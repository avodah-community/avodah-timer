import { ChevronDown, ChevronUp, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	type DisplayColor,
	getButtonStyles,
	getPresetActiveStyles,
	getSpinnerButtonStyles,
} from "@/utils/colors";
import { DEFAULT_TIME, PRESETS, parseTimeParam } from "@/utils/time";

interface TimeInputProps {
	onTimeSet: (seconds: number, presetSeconds?: number) => void;
	onTimeChange?: (seconds: number) => void;
	onStart?: () => void;
	onClose?: () => void;
	disabled?: boolean;
	displayColor?: DisplayColor;
	activePreset?: number | null;
	showHours?: boolean;
}

interface TimeSpinnerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	onIncrement: () => void;
	onDecrement: () => void;
	max: number;
	disabled?: boolean;
	displayColor: DisplayColor;
}

function TimeSpinner({
	label,
	value,
	onChange,
	onIncrement,
	onDecrement,
	max,
	disabled,
	displayColor,
}: TimeSpinnerProps) {
	const inputId = `time-input-${label.toLowerCase()}`;
	const buttonStyles = getSpinnerButtonStyles(displayColor);

	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-xs text-slate-400 uppercase tracking-wider">
				{label}
			</span>
			<div className="flex flex-col items-center">
				<button
					type="button"
					onClick={onIncrement}
					disabled={disabled}
					className={cn(
						"w-16 sm:w-16 h-11 sm:h-10 flex items-center justify-center rounded-t-lg border border-b-0 border-white/15 bg-white/5 text-slate-300 transition-all duration-150 touch-manipulation",
						buttonStyles,
						disabled &&
							"opacity-50 cursor-not-allowed hover:bg-white/5 hover:text-slate-300",
					)}
					aria-label={`Increase ${label}`}
				>
					<ChevronUp className="h-6 w-6 sm:h-5 sm:w-5" />
				</button>
				<input
					id={inputId}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					min="0"
					max={max}
					value={value}
					onChange={(e) => {
						const val = e.target.value.replace(/\D/g, "");
						onChange(val);
					}}
					disabled={disabled}
					className={cn(
						"w-16 sm:w-16 h-14 border border-white/15 bg-black/40 text-center text-2xl font-bold text-white touch-manipulation",
						"focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50",
						"[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
						disabled && "opacity-50 cursor-not-allowed",
					)}
				/>
				<button
					type="button"
					onClick={onDecrement}
					disabled={disabled}
					className={cn(
						"w-16 sm:w-16 h-11 sm:h-10 flex items-center justify-center rounded-b-lg border border-t-0 border-white/15 bg-white/5 text-slate-300 transition-all duration-150 touch-manipulation",
						buttonStyles,
						disabled &&
							"opacity-50 cursor-not-allowed hover:bg-white/5 hover:text-slate-300",
					)}
					aria-label={`Decrease ${label}`}
				>
					<ChevronDown className="h-6 w-6 sm:h-5 sm:w-5" />
				</button>
			</div>
		</div>
	);
}

export function TimeInput({
	onTimeSet,
	onTimeChange,
	onStart,
	onClose,
	disabled,
	displayColor = "blue",
	activePreset,
	showHours = false,
}: TimeInputProps) {
	// Initialize from URL if present, otherwise use default (5 minutes)
	const getInitialTimeFromURL = () => {
		const params = new URLSearchParams(window.location.search);
		const timeParam = params.get("t");
		const totalSeconds = timeParam ? parseTimeParam(timeParam) : null;
		const time = totalSeconds && totalSeconds > 0 ? totalSeconds : DEFAULT_TIME;

		const h = Math.floor(time / 3600);
		const m = Math.floor((time % 3600) / 60);
		const s = time % 60;
		return { h: String(h), m: String(m), s: String(s) };
	};

	const initialTime = getInitialTimeFromURL();
	const [hours, setHours] = useState(initialTime.h);
	const [minutes, setMinutes] = useState(initialTime.m);
	const [seconds, setSeconds] = useState(initialTime.s);
	const isFirstRender = useRef(true);
	const onTimeChangeRef = useRef(onTimeChange);
	const prevDisabledRef = useRef(disabled);

	// Keep ref updated
	useEffect(() => {
		onTimeChangeRef.current = onTimeChange;
	}, [onTimeChange]);

	useEffect(() => {
		// Skip initial render to avoid setting timer to 0
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		// Skip if only the disabled state changed (e.g., when pausing)
		if (prevDisabledRef.current !== disabled) {
			prevDisabledRef.current = disabled;
			return;
		}

		if (onTimeChangeRef.current && !disabled) {
			const hNum = parseInt(hours, 10) || 0;
			const mNum = parseInt(minutes, 10) || 0;
			const sNum = parseInt(seconds, 10) || 0;
			const totalSeconds = hNum * 3600 + mNum * 60 + sNum;
			onTimeChangeRef.current(totalSeconds);
		}
	}, [hours, minutes, seconds, disabled]);

	const handlePreset = (presetSeconds: number) => {
		const h = Math.floor(presetSeconds / 3600);
		const m = Math.floor((presetSeconds % 3600) / 60);
		const s = presetSeconds % 60;
		setHours(String(h));
		setMinutes(String(m));
		setSeconds(String(s));
		if (onTimeChangeRef.current) {
			onTimeChangeRef.current(presetSeconds);
		}
		onTimeSet(presetSeconds, presetSeconds);
	};

	// Increment/decrement handlers with min/max constraints
	const handleIncrement = (
		currentValue: string,
		setter: (val: string) => void,
		max: number,
	) => {
		const num = parseInt(currentValue, 10) || 0;
		const newValue = num >= max ? 0 : num + 1;
		setter(String(newValue));
	};

	const handleDecrement = (
		currentValue: string,
		setter: (val: string) => void,
		max: number,
	) => {
		const num = parseInt(currentValue, 10) || 0;
		const newValue = num <= 0 ? max : num - 1;
		setter(String(newValue));
	};

	const handleClear = () => {
		setHours("0");
		setMinutes("0");
		setSeconds("0");
		if (onTimeChangeRef.current) {
			onTimeChangeRef.current(0);
		}
		onTimeSet(0, 0);
	};

	return (
		<div className="space-y-4 p-2 sm:p-4 pt-4 sm:pt-6 text-white">
			<div className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-4">
				<Button
					variant="outline"
					disabled={disabled}
					onClick={handleClear}
					className="h-11 sm:h-10 px-4 sm:px-6 text-sm font-medium border-white/20 text-white hover:bg-white/10 transition-all duration-200 touch-manipulation"
				>
					Clear
				</Button>
				{PRESETS.map((preset) => {
					const isActive = activePreset === preset.seconds;
					return (
						<Button
							key={preset.label}
							variant="secondary"
							disabled={disabled}
							onClick={() => handlePreset(preset.seconds)}
							className={cn(
								"h-11 sm:h-10 px-4 sm:px-6 text-sm font-medium bg-white/10 text-white shadow-md shadow-black/20 hover:bg-white/20 hover:text-white border-0 transition-all duration-200 touch-manipulation",
								isActive && getPresetActiveStyles(displayColor),
							)}
						>
							{preset.label}
						</Button>
					);
				})}
			</div>

			<div className="flex items-center justify-center gap-1 sm:gap-2">
				{showHours && (
					<>
						<TimeSpinner
							label="Hour"
							value={hours}
							onChange={setHours}
							onIncrement={() => handleIncrement(hours, setHours, 23)}
							onDecrement={() => handleDecrement(hours, setHours, 23)}
							max={23}
							disabled={disabled}
							displayColor={displayColor}
						/>
						<span className="text-2xl sm:text-3xl font-bold text-slate-500 mt-5">
							:
						</span>
					</>
				)}
				<TimeSpinner
					label="Min"
					value={minutes}
					onChange={setMinutes}
					onIncrement={() => handleIncrement(minutes, setMinutes, 59)}
					onDecrement={() => handleDecrement(minutes, setMinutes, 59)}
					max={59}
					disabled={disabled}
					displayColor={displayColor}
				/>
				<span className="text-2xl sm:text-3xl font-bold text-slate-500 mt-5">
					:
				</span>
				<TimeSpinner
					label="Sec"
					value={seconds}
					onChange={setSeconds}
					onIncrement={() => handleIncrement(seconds, setSeconds, 59)}
					onDecrement={() => handleDecrement(seconds, setSeconds, 59)}
					max={59}
					disabled={disabled}
					displayColor={displayColor}
				/>
			</div>

			{/* Action buttons */}
			{(onStart || onClose) && (
				<div className="flex justify-center gap-3 pt-4 pb-2">
					{onClose && (
						<Button
							variant="outline"
							size="lg"
							onClick={onClose}
							className="min-w-[140px] h-12 rounded-xl border-2 text-base font-medium transition-all touch-manipulation border-white/20 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/30"
						>
							<X className="mr-2 h-5 w-5" />
							Close
						</Button>
					)}
					{onStart && (
						<Button
							variant="outline"
							size="lg"
							onClick={onStart}
							disabled={disabled}
							className={cn(
								"min-w-[140px] h-12 rounded-xl border-2 text-base font-medium transition-all touch-manipulation",
								getButtonStyles(displayColor),
							)}
						>
							<Play className="mr-2 h-5 w-5" />
							Start
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
