export const icons = [
	"tree-1",
	"tree-2",
	"palm",
	"stone-1",
	"stone-2",
	"sandstone-1",
	"sandstone-2",
	"waterstone-1",
	"waterstone-2",
	"x",
	"waterWheel",
	"waterWheel-animated",
	"connector",
	"rockCutter",
	"big-0",
	"big-180",
] as const;
export type Icon = (typeof icons)[number];
