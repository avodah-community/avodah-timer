// URL parameter utilities for timer state persistence

import type { DisplaySize } from "@/constants";
import { type DisplayColor, VALID_COLORS } from "./colors";
import { DEFAULT_TIME, formatTimeParam, parseTimeParam } from "./time";

const DEFAULT_COLOR: DisplayColor = "blue";
const DEFAULT_SIZE: DisplaySize = "medium";

const SIZE_URL_MAP: Record<DisplaySize, string> = {
	small: "s",
	medium: "m",
	large: "l",
};

const URL_SIZE_MAP: Record<string, DisplaySize> = {
	s: "small",
	m: "medium",
	l: "large",
};

export interface URLParams {
	time: number;
	color: DisplayColor;
	size: DisplaySize;
	showHours: boolean;
}

/**
 * Parse URL parameters into timer configuration
 */
export function getURLParams(): URLParams {
	const params = new URLSearchParams(window.location.search);
	const timeParam = params.get("t");
	const colorParam = params.get("c");
	const sizeParam = params.get("s");
	const hoursParam = params.get("h");

	const time = timeParam ? parseTimeParam(timeParam) : null;
	const color =
		colorParam && VALID_COLORS.includes(colorParam as DisplayColor)
			? (colorParam as DisplayColor)
			: DEFAULT_COLOR;
	const size =
		sizeParam && URL_SIZE_MAP[sizeParam]
			? URL_SIZE_MAP[sizeParam]
			: DEFAULT_SIZE;
	const showHours = hoursParam === "1";

	return {
		time: time && time > 0 ? time : DEFAULT_TIME,
		color,
		size,
		showHours,
	};
}

/**
 * Update URL with timer configuration
 */
export function updateURL(
	time: number,
	color: DisplayColor,
	size: DisplaySize,
	showHours: boolean,
): void {
	const url = new URL(window.location.href);
	url.searchParams.set("t", formatTimeParam(time));
	url.searchParams.set("c", color);
	url.searchParams.set("s", SIZE_URL_MAP[size]);
	url.searchParams.set("h", showHours ? "1" : "0");
	window.history.replaceState({}, "", url.toString());
}

/**
 * Check if URL has a time parameter
 */
export function hasTimeParam(): boolean {
	const params = new URLSearchParams(window.location.search);
	return params.has("t");
}
