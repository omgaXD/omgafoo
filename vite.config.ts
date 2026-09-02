import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import { globSync } from "fs";

export default defineConfig({
	root: "web/src",
	base: "/",
	build: {
		outDir: "../out",
		emptyOutDir: true,
		manifest: true,
		rolldownOptions: {
			input: globSync('web/src/ts/**/index.ts')
		},
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{ src: "templates/**/*", dest: "templates" },
				{ src: "static/assets/**/*", dest: "static/assets" },
			],
		}),
	],
	server: {
		// Allow the backend (running on a different port) to request scripts
		cors: true,
		origin: "http://localhost:5173",
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./web/src"),
		},
	},
});
