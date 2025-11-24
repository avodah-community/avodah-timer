// Shared constants used across the application

export type DisplaySize = "small" | "medium" | "large";

// Base scale multipliers for user's size choice
export const SIZE_SCALE: Record<DisplaySize, number> = {
	small: 1,
	medium: 1.5,
	large: 2,
};

export const SIZE_OPTIONS: { value: DisplaySize; label: string }[] = [
	{ value: "small", label: "Small" },
	{ value: "medium", label: "Medium" },
	{ value: "large", label: "Large" },
];
