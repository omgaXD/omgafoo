#!/usr/bin/env bash
# Dynamic DNS updater for name.com
# Runs via cron every 30 minutes; registers the cron job itself on first run.
set -euo pipefail

SCRIPT_PATH="$(realpath "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
IP_CACHE_FILE="$SCRIPT_DIR/.last_ip"
LOG_FILE="$SCRIPT_DIR/update_dns.log"
ENV_FILE="$SCRIPT_DIR/.env"

# ── Load .env ──────────────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found at $ENV_FILE" >&2
  exit 1
fi
set -a
# shellcheck source=.env
source "$ENV_FILE"
set +a

[[ -z "${NAME_COM_API_KEY:-}" ]]   && { echo "ERROR: NAME_COM_API_KEY is not set in .env"   >&2; exit 1; }
[[ -z "${NAME_COM_USERNAME:-}" ]]  && { echo "ERROR: NAME_COM_USERNAME is not set in .env"  >&2; exit 1; }
[[ -z "${NAME_COM_DOMAIN:-}" ]]    && { echo "ERROR: NAME_COM_DOMAIN is not set in .env"    >&2; exit 1; }
[[ -z "${NAME_COM_RECORD_IDS:-}" ]] && { echo "ERROR: NAME_COM_RECORD_ID is not set in .env" >&2; exit 1; }

DOMAIN="$NAME_COM_DOMAIN"
RECORD_IDS="$NAME_COM_RECORD_IDS"
API_BASE="https://api.name.com/core/v1/domains/${DOMAIN}/records"

# ── Register cron job on first run ─────────────────────────────────────────────
if ! crontab -l 2>/dev/null | grep -qF "$SCRIPT_PATH"; then
  echo "[setup] Cron job not found — registering..."
  (crontab -l 2>/dev/null; echo "*/30 * * * * $SCRIPT_PATH >> $LOG_FILE 2>&1") | crontab -
  echo "[setup] Cron job scheduled: every 30 minutes."
fi

# ── Fetch current public IP ────────────────────────────────────────────────────
CURRENT_IP="$(curl -sf --max-time 10 ifconfig.me)"
[[ -z "$CURRENT_IP" ]] && { echo "ERROR: Failed to fetch public IP from ifconfig.me" >&2; exit 1; }

# ── Compare with last known IP ────────────────────────────────────────────────
LAST_IP="$(cat "$IP_CACHE_FILE" 2>/dev/null || true)"
if [[ "$CURRENT_IP" == "$LAST_IP" ]]; then
  echo "[$(date -Iseconds)] IP unchanged: $CURRENT_IP — skipping."
  exit 0
fi

echo "[$(date -Iseconds)] IP changed: ${LAST_IP:-<none>} → $CURRENT_IP"

# ── Update each A record ──────────────────────────────────────────────────────
for RECORD_ID in $(echo "$RECORD_IDS" | tr ',' '\n'); do
  # Trim whitespace
  RECORD_ID="${RECORD_ID#"${RECORD_ID%%[![:space:]]*}"}"
  RECORD_ID="${RECORD_ID%"${RECORD_ID##*[![:space:]]}"}"

  # ── Fetch existing record to preserve host / ttl ────────────────────────────
  RECORD_JSON="$(curl -sf --max-time 10 \
    --user "${NAME_COM_USERNAME}:${NAME_COM_API_KEY}" \
    "${API_BASE}/${RECORD_ID}")"

  if command -v jq &>/dev/null; then
    REC_HOST="$(echo "$RECORD_JSON" | jq -r '.host // ""')"
    REC_TTL="$(echo  "$RECORD_JSON" | jq -r '.ttl  // 300')"
  else
    REC_HOST="$(python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('host',''))"  <<< "$RECORD_JSON")"
    REC_TTL="$( python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ttl', 300))" <<< "$RECORD_JSON")"
  fi

  # ── Update the A record ─────────────────────────────────────────────────────
  HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" \
    --request PUT \
    --max-time 10 \
    --url "${API_BASE}/${RECORD_ID}" \
    --user "${NAME_COM_USERNAME}:${NAME_COM_API_KEY}" \
    --header "Content-Type: application/json" \
    --data "{\"answer\":\"$CURRENT_IP\",\"type\":\"A\",\"host\":\"$REC_HOST\",\"ttl\":$REC_TTL}")"

  if [[ "$HTTP_CODE" == "200" ]]; then
    echo "[$(date -Iseconds)] ✓ Record $RECORD_ID updated → $CURRENT_IP"
  else
    echo "ERROR: name.com API returned HTTP $HTTP_CODE for record $RECORD_ID" >&2
    exit 1
  fi
done

# ── Update cache after all records are successfully updated ────────────────────
echo "$CURRENT_IP" > "$IP_CACHE_FILE"
echo "[$(date -Iseconds)] All records updated successfully."
