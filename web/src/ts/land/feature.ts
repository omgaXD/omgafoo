export const features = ["none", "tree", "stone"] as const;
export type Feature = (typeof features)[number];
