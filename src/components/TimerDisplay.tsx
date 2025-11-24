import { useEffect, useMemo, useState } from "react";
import { type DisplaySize, SIZE_SCALE } from "@/constants";
import { cn } from "@/lib/utils";
import {
	type DisplayColor,
	type DisplayState,
	getColonColors,
	getDropShadow,
	getSegmentColors,
} from "@/utils/colors";

interface TimerDisplayProps {
	seconds: number;
	isRunning: boolean;
	isComplete: boolean;
	hasStarted?: boolean;
	hasTimeSet?: boolean;
	displayColor?: DisplayColor;
	displaySize?: DisplaySize;
	showHours?: boolean;
}

// Viewport-aware scale factor to ensure timer fits on screen
// Returns a multiplier (0-1) based on viewport width
// This factor will be multiplied by the user's size choice (1x, 1.5x, 2x)
export function useViewportScale(showHours: boolean): number {
	const [viewportFactor, setViewportFactor] = useState(1);

	useEffect(() => {
		const calculateFactor = () => {
			const vw = window.innerWidth;
			// Base timer width at 1x scale: 4 digits (MM:SS) ≈ 380px, 6 digits (HH:MM:SS) ≈ 580px
			const baseWidth = showHours ? 580 : 380;
			const targetWidth = vw - 32; // 16px padding each side
			const maxScale = 2; // Maximum scale (Large size)

			// Calculate factor so that even at max scale, timer fits
			// factor × maxScale × baseWidth <= targetWidth
			// factor = targetWidth / (baseWidth × maxScale)
			const factor = targetWidth / (baseWidth * maxScale);

			// Clamp between 0.4 (minimum readable) and 1 (full scale)
			setViewportFactor(Math.min(1, Math.max(0.4, factor)));
		};

		calculateFactor();
		window.addEventListener("resize", calculateFactor);
		return () => window.removeEventListener("resize", calculateFactor);
	}, [showHours]);

	return viewportFactor;
}

type SegmentKey = "a" | "b" | "c" | "d" | "e" | "f" | "g";

const SEGMENT_MAP: Record<string, SegmentKey[]> = {
	"0": ["a", "b", "c", "d", "e", "f"],
	"1": ["b", "c"],
	"2": ["a", "b", "g", "e", "d"],
	"3": ["a", "b", "g", "c", "d"],
	"4": ["f", "g", "b", "c"],
	"5": ["a", "f", "g", "c", "d"],
	"6": ["a", "f", "g", "c", "d", "e"],
	"7": ["a", "b", "c"],
	"8": ["a", "b", "c", "d", "e", "f", "g"],
	"9": ["a", "b", "c", "d", "f", "g"],
};

const SEGMENT_CLASS_MAP: Record<SegmentKey, string> = {
	a: "top-2 left-1/2 -translate-x-1/2 w-[52px] h-2",
	b: "top-4 right-2 w-2 h-12",
	c: "bottom-4 right-2 w-2 h-12",
	d: "bottom-2 left-1/2 -translate-x-1/2 w-[52px] h-2",
	e: "bottom-4 left-2 w-2 h-12",
	f: "top-4 left-2 w-2 h-12",
	g: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-2",
};

const CLIP_PATHS = {
	horizontal:
		"polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)",
	vertical:
		"polygon(50% 0, 100% 6px, 100% calc(100% - 6px), 50% 100%, 0 calc(100% - 6px), 0 6px)",
};

function SevenSegmentDigit({
	digit,
	state,
	displayColor,
}: {
	digit: string;
	state: DisplayState;
	displayColor: DisplayColor;
}) {
	const activeSegments = SEGMENT_MAP[digit] ?? SEGMENT_MAP["0"];
	const segmentColors = getSegmentColors(displayColor);

	return (
		<div className={cn("relative w-20 h-32 rounded-3xl")}>
			{Object.entries(SEGMENT_CLASS_MAP).map(([segment, positionClass]) => {
				const isActive = activeSegments.includes(segment as SegmentKey);
				const isVertical = ["b", "c", "e", "f"].includes(segment);
				const style = isActive ? segmentColors[state] : segmentColors.idle;

				return (
					<div
						key={segment}
						className={cn(
							"absolute transition-all duration-200 ease-out blur-[0.3px]",
							positionClass,
							style.shadow,
							style.opacity,
						)}
					>
						<div
							className={cn("w-full h-full bg-gradient-to-b", style.colors)}
							style={{
								clipPath: isVertical
									? CLIP_PATHS.vertical
									: CLIP_PATHS.horizontal,
							}}
						/>
					</div>
				);
			})}
		</div>
	);
}

function Colon({
	state,
	displayColor,
	isComplete,
}: {
	state: DisplayState;
	displayColor: DisplayColor;
	isComplete?: boolean;
}) {
	const colonColors = getColonColors(displayColor);
	const colorStyle = colonColors[state];
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center h-32 gap-4 px-1",
				isComplete && "animate-colon-blink",
			)}
		>
			{[0, 1].map((dot) => (
				<span
					key={dot}
					className={cn(
						"w-3 h-3 rounded-full bg-gradient-to-b",
						colorStyle.gradient,
						colorStyle.shadow,
					)}
				/>
			))}
		</div>
	);
}

export function TimerDisplay({
	seconds,
	isRunning,
	isComplete,
	hasStarted = false,
	hasTimeSet = false,
	displayColor = "blue",
	displaySize = "small",
	showHours = false,
}: TimerDisplayProps) {
	const { hours, minutes, secs } = useMemo(() => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		return {
			hours: String(h).padStart(2, "0"),
			minutes: String(m).padStart(2, "0"),
			secs: String(s).padStart(2, "0"),
		};
	}, [seconds]);

	// Keep the active color even when complete - we use animation instead of color change
	const displayState: DisplayState =
		isComplete || isRunning || hasStarted || hasTimeSet ? "active" : "idle";

	// Build digits array based on whether hours are shown
	const digits = showHours
		? [...hours.split(""), ...minutes.split(""), ...secs.split("")]
		: [...minutes.split(""), ...secs.split("")];

	// Colon positions: with hours [1,3], without hours [1]
	const colonPositions = showHours ? [1, 3] : [1];

	// Calculate responsive scale: user's size choice × viewport constraint
	const viewportFactor = useViewportScale(showHours);
	const baseScale = SIZE_SCALE[displaySize];
	const effectiveScale = baseScale * viewportFactor;

	return (
		<div
			className={cn(
				"flex items-center justify-center gap-2 sm:gap-3 md:gap-4",
				getDropShadow(displayColor),
				isComplete && "animate-breathing-glow",
			)}
			style={{
				transform: `scale(${effectiveScale})`,
				transformOrigin: "center",
			}}
		>
			{digits.map((digit, index) => {
				const showColonAfter = colonPositions.includes(index);
				// Use position-based key since digit values can repeat
				const positionLabel = showHours
					? ["h1", "h2", "m1", "m2", "s1", "s2"][index]
					: ["m1", "m2", "s1", "s2"][index];
				return (
					<div key={positionLabel} className="flex items-center gap-2 sm:gap-3">
						<SevenSegmentDigit
							digit={digit}
							state={displayState}
							displayColor={displayColor}
						/>
						{showColonAfter && (
							<Colon
								state={displayState}
								displayColor={displayColor}
								isComplete={isComplete}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
