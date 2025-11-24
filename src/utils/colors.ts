// Color utilities for consistent theming across the application

export type DisplayColor = "blue" | "green" | "orange" | "red";

export const VALID_COLORS: DisplayColor[] = ["blue", "green", "orange", "red"];

export const COLOR_OPTIONS: {
	value: DisplayColor;
	label: string;
	preview: string;
}[] = [
	{
		value: "blue",
		label: "Blue",
		preview: "bg-gradient-to-b from-cyan-300 to-blue-400",
	},
	{
		value: "green",
		label: "Green",
		preview: "bg-gradient-to-b from-green-300 to-emerald-400",
	},
	{
		value: "orange",
		label: "Orange",
		preview: "bg-gradient-to-b from-orange-400 to-orange-600",
	},
	{
		value: "red",
		label: "Red",
		preview: "bg-gradient-to-b from-red-600 to-red-800",
	},
];

// Timer segment display state
export type DisplayState = "idle" | "active" | "complete";

// Shared color mappings used across components
const COLOR_MAP: Record<
	DisplayColor,
	{ active: string; shadow: string; gradient: string }
> = {
	blue: {
		active: "from-cyan-300 to-cyan-500",
		shadow: "drop-shadow-[0_0_5px_rgba(6,182,212,0.9)]",
		gradient: "from-cyan-300 to-cyan-500",
	},
	green: {
		active: "from-green-400 to-emerald-500",
		shadow: "drop-shadow-[0_0_5px_rgba(34,197,94,0.9)]",
		gradient: "from-green-400 to-emerald-500",
	},
	orange: {
		active: "from-orange-400 to-orange-600",
		shadow: "drop-shadow-[0_0_5px_rgba(251,146,60,0.9)]",
		gradient: "from-orange-400 to-orange-600",
	},
	red: {
		active: "from-red-600 to-red-800",
		shadow: "drop-shadow-[0_0_5px_rgba(220,38,38,0.9)]",
		gradient: "from-red-600 to-red-800",
	},
};

// TimerDisplay segment colors
export function getSegmentColors(
	displayColor: DisplayColor,
): Record<DisplayState, { colors: string; shadow: string; opacity: string }> {
	const colors = COLOR_MAP[displayColor];

	return {
		idle: {
			colors: "from-gray-600/60 to-gray-800/40",
			shadow: "drop-shadow-none",
			opacity: "opacity-[0.30]",
		},
		active: {
			colors: colors.active,
			shadow: colors.shadow,
			opacity: "",
		},
		complete: {
			colors: "from-red-300 to-amber-400",
			shadow: "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]",
			opacity: "",
		},
	};
}

// TimerDisplay colon colors
export function getColonColors(
	displayColor: DisplayColor,
): Record<DisplayState, { gradient: string; shadow: string }> {
	const colors = COLOR_MAP[displayColor];

	return {
		idle: { gradient: "from-gray-500 to-gray-700 opacity-40", shadow: "" },
		active: { gradient: colors.gradient, shadow: colors.shadow },
		complete: { gradient: colors.gradient, shadow: colors.shadow },
	};
}

// TimerDisplay drop shadow
export function getDropShadow(displayColor: DisplayColor): string {
	const colorMap: Record<DisplayColor, string> = {
		blue: "drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]",
		green: "drop-shadow-[0_0_12px_rgba(0,200,100,0.25)]",
		orange: "drop-shadow-[0_0_12px_rgba(251,146,60,0.25)]",
		red: "drop-shadow-[0_0_18px_rgba(185,28,28,0.5)]",
	};
	return colorMap[displayColor];
}

// TimerControls and TimeInput button styles
export function getButtonStyles(displayColor: DisplayColor): string {
	const colorMap: Record<DisplayColor, string> = {
		blue: "bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400",
		green:
			"bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400",
		orange:
			"bg-orange-500/10 border-orange-500 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400",
		red: "bg-red-600/10 border-red-600 text-red-400 hover:bg-red-600/20 hover:border-red-500",
	};
	return colorMap[displayColor];
}

// TimeInput spinner button styles
export function getSpinnerButtonStyles(displayColor: DisplayColor): string {
	const colorMap: Record<DisplayColor, string> = {
		blue: "hover:bg-cyan-500/20 hover:text-cyan-400 active:bg-cyan-500/30",
		green: "hover:bg-green-500/20 hover:text-green-400 active:bg-green-500/30",
		orange:
			"hover:bg-orange-500/20 hover:text-orange-400 active:bg-orange-500/30",
		red: "hover:bg-red-500/20 hover:text-red-400 active:bg-red-500/30",
	};
	return colorMap[displayColor];
}

// TimeInput preset active styles
export function getPresetActiveStyles(displayColor: DisplayColor): string {
	const colorMap: Record<DisplayColor, string> = {
		blue: "ring-2 ring-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.4)]",
		green:
			"ring-2 ring-green-400 bg-green-500/20 shadow-[0_0_12px_rgba(52,211,153,0.4)]",
		orange:
			"ring-2 ring-orange-400 bg-orange-500/20 shadow-[0_0_12px_rgba(251,146,60,0.4)]",
		red: "ring-2 ring-red-500 bg-red-500/20 shadow-[0_0_12px_rgba(220,38,38,0.4)]",
	};
	return colorMap[displayColor];
}
