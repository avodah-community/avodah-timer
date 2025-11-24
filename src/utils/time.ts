// Time utilities for parsing and formatting timer values

export const DEFAULT_TIME = 5 * 60; // 5 minutes in seconds

export const PRESETS = [
	{ label: "5 min", seconds: 5 * 60 },
	{ label: "10 min", seconds: 10 * 60 },
	{ label: "15 min", seconds: 15 * 60 },
];

// Preset values as a simple array for quick lookups
export const PRESET_VALUES = PRESETS.map((p) => p.seconds);

/**
 * Parse time string like "5m30s", "1h5m", "1h5m30s" into total seconds
 */
export function parseTimeParam(timeParam: string): number | null {
	if (!timeParam) return null;

	const match = timeParam.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
	if (match && (match[1] || match[2] || match[3])) {
		const hours = parseInt(match[1] || "0", 10);
		const minutes = parseInt(match[2] || "0", 10);
		const seconds = parseInt(match[3] || "0", 10);
		return hours * 3600 + minutes * 60 + seconds;
	}

	return null;
}

/**
 * Format seconds into human-readable string like "5m30s" or "1h5m30s"
 */
export function formatTimeParam(totalSeconds: number): string {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;

	let result = "";
	if (h > 0) result += `${h}h`;
	if (m > 0) result += `${m}m`;
	if (s > 0 || result === "") result += `${s}s`;
	return result;
}

/**
 * Convert total seconds to hours, minutes, seconds components
 */
export function secondsToHMS(totalSeconds: number): {
	h: number;
	m: number;
	s: number;
} {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	return { h, m, s };
}

/**
 * Format time for display as "Xh Xm Xs timer" string
 */
export function formatTimeDisplay(totalSeconds: number): string {
	const { h, m, s } = secondsToHMS(totalSeconds);
	const parts: string[] = [];
	if (h > 0) parts.push(`${h}h`);
	if (m > 0) parts.push(`${m}m`);
	if (s > 0 || parts.length === 0) parts.push(`${s}s`);
	return parts.join(" ");
}
