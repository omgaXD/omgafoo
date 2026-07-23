export const staticIcons = [
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
	"connector",
	"rockCutter",
	"big-0",
	"big-180",
] as const;
export const animatedIcons = ["waterWheel-animated", "rockCutter-animated"] as const;

export type AnimatedIcon = (typeof animatedIcons)[number];
export type StaticIcon = (typeof staticIcons)[number];
export type Icon = AnimatedIcon | StaticIcon
