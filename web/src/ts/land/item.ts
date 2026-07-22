export const items = ['wood', 'stone'] as const;
export type Item = typeof items[number];