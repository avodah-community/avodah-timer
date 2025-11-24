import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type DisplayColor, getButtonStyles } from "@/utils/colors";

interface TimerControlsProps {
	isRunning: boolean;
	isComplete: boolean;
	timeRemaining: number;
	onStart: () => void;
	onPause: () => void;
	onReset: () => void;
	displayColor?: DisplayColor;
}

export function TimerControls({
	isRunning,
	isComplete,
	timeRemaining,
	onStart,
	onPause,
	onReset,
	displayColor = "blue",
}: TimerControlsProps) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-3 pt-6">
			<Button
				variant="outline"
				size="lg"
				onClick={isRunning ? onPause : onStart}
				className={cn(
					"min-w-[140px] rounded-xl border-2 transition-opacity hover:opacity-100",
					isRunning ? "opacity-30" : "opacity-100",
					getButtonStyles(displayColor),
				)}
				disabled={
					(isComplete && !isRunning) || (!isRunning && timeRemaining === 0)
				}
			>
				{isRunning ? (
					<>
						<Pause className="mr-2 h-5 w-5" />
						Pause
					</>
				) : (
					<>
						<Play className="mr-2 h-5 w-5" />
						Start
					</>
				)}
			</Button>
			<Button
				variant="outline"
				size="lg"
				onClick={onReset}
				className={cn(
					"min-w-[140px] rounded-xl border-white/20 text-white hover:bg-white/10 transition-opacity hover:opacity-100",
					isRunning ? "opacity-30" : "opacity-100",
				)}
			>
				<RotateCcw className="mr-2 h-5 w-5" />
				Reset
			</Button>
		</div>
	);
}
