import { Check, ChevronDown, ChevronUp, Settings, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SettingsModal } from "./components/SettingsModal";
import { TimeInput } from "./components/TimeInput";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay, useViewportScale } from "./components/TimerDisplay";
import { Button } from "./components/ui/button";
import { type DisplaySize, SIZE_SCALE } from "./constants";
import { useNotifications } from "./hooks/useNotifications";
import { useSettings } from "./hooks/useSettings";
import { useTimer } from "./hooks/useTimer";
import { cn } from "./lib/utils";
import { startCompletionAlarm } from "./utils/audio";
import type { DisplayColor } from "./utils/colors";
import { formatTimeDisplay, PRESET_VALUES } from "./utils/time";
import { getURLParams, hasTimeParam, updateURL } from "./utils/url";

// Calculate margin needed below timer to account for CSS scale transform
// Timer base height is 128px, scale extends visually by (scale-1) * 64px below layout box
// To maintain 50px visual gap: margin = 50 + (effectiveScale - 1) * 64
function calculateTimerMargin(
	baseScale: number,
	viewportFactor: number,
): number {
	const effectiveScale = baseScale * viewportFactor;
	return Math.round(50 + (effectiveScale - 1) * 64);
}

function App() {
	const { settings, updateSettings, isLoaded } = useSettings();
	const { permission, requestPermission, sendNotification } =
		useNotifications();

	// Display color, size, and hours toggle are derived from URL (not localStorage)
	const [displayColor, setDisplayColor] = useState<DisplayColor>(
		() => getURLParams().color,
	);
	const [displaySize, setDisplaySize] = useState<DisplaySize>(
		() => getURLParams().size,
	);
	const [showHours, setShowHours] = useState<boolean>(
		() => getURLParams().showHours,
	);

	// Get viewport scale factor for responsive timer sizing
	const viewportScale = useViewportScale(showHours);
	const timerMargin = calculateTimerMargin(
		SIZE_SCALE[displaySize],
		viewportScale,
	);

	// Fixed drawer height to fit all content without scrolling
	const drawerHeight = 390;

	// Store alarm stop function
	const stopAlarmRef = useRef<(() => void) | null>(null);

	// Request notification permission on first load
	const hasRequestedPermission = useRef(false);
	useEffect(() => {
		if (hasRequestedPermission.current) return;
		hasRequestedPermission.current = true;

		console.log("[App] Checking notification permission on load:", permission);
		// Only request if permission hasn't been decided yet
		if (permission === "default") {
			console.log("[App] Requesting notification permission on first load...");
			requestPermission();
		} else {
			console.log("[App] Notification permission already set to:", permission);
		}
	}, [permission, requestPermission]);

	// Helper function to get base time from URL
	const getBaseTimeFromURL = useCallback((): number => {
		return getURLParams().time;
	}, []);

	// Compute initial URL state once
	const initialURLState = useRef<{
		time: number;
		hadTimeParam: boolean;
	} | null>(null);
	if (initialURLState.current === null) {
		const params = new URLSearchParams(window.location.search);
		initialURLState.current = {
			time: getURLParams().time,
			hadTimeParam: params.has("t"),
		};
	}

	const [activePreset, setActivePreset] = useState<number | null>(() => {
		const { time } = getURLParams();
		return PRESET_VALUES.includes(time) ? time : null;
	});
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(() => !hasTimeParam());
	const [hasTimeSet, setHasTimeSet] = useState(true);

	// Ensure URL has all params on mount (fills in defaults if missing)
	const hasAppliedURLParams = useRef(false);
	useEffect(() => {
		if (hasAppliedURLParams.current) return;
		hasAppliedURLParams.current = true;

		const { time, color, size, showHours: urlShowHours } = getURLParams();
		// Always update URL to ensure all params are present (fills in defaults)
		updateURL(time, color, size, urlShowHours);
	}, []);

	const handleComplete = useCallback(() => {
		console.log("[Timer] Timer completed! handleComplete called");
		console.log("[Timer] Notification settings:", {
			notificationsEnabled: settings.notificationsEnabled,
			permission: permission,
		});

		// Start looping alarm - store stop function for later dismissal
		stopAlarmRef.current = startCompletionAlarm();

		if (settings.notificationsEnabled) {
			console.log("[Timer] Attempting to send notification...");
			sendNotification("Timer Complete! ⏰", {
				body: "Your Avodah Timer has finished.",
				tag: "timer-complete",
				requireInteraction: true,
			});
		} else {
			console.log(
				"[Timer] Notifications are disabled in settings, skipping notification",
			);
		}
	}, [settings.notificationsEnabled, sendNotification, permission]);

	// Initialize timer from URL on mount
	const baseTimeFromURL = getBaseTimeFromURL();
	const timer = useTimer({
		initialTime: baseTimeFromURL,
		onComplete: handleComplete,
	});

	// Set page title based on initial time
	useEffect(() => {
		const formatTitle = (seconds: number) => {
			const h = Math.floor(seconds / 3600);
			const m = Math.floor((seconds % 3600) / 60);
			const s = seconds % 60;
			if (h > 0) {
				return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} Countdown`;
			}
			return `${m}:${String(s).padStart(2, "0")} Countdown`;
		};
		document.title = formatTitle(baseTimeFromURL);
	}, [baseTimeFromURL]);

	const handleStart = useCallback(() => {
		timer.start();
		setIsDrawerOpen(false);
	}, [timer]);

	// Toggle start/pause with spacebar
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger if user is typing in an input field
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			if (e.code === "Space") {
				e.preventDefault(); // Prevent page scroll
				if (timer.isRunning) {
					timer.pause();
				} else if (timer.timeRemaining > 0) {
					timer.start();
					setIsDrawerOpen(false);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [timer]);

	const handleTimeSet = useCallback(
		(seconds: number, presetSeconds?: number) => {
			timer.setTime(seconds);
			setHasTimeSet(true);
			setActivePreset(presetSeconds ?? null);
			updateURL(seconds, displayColor, displaySize, showHours);
		},
		[timer, displayColor, displaySize, showHours],
	);

	// Track if we're still initializing to prevent URL updates during mount
	const isInitializing = useRef(true);
	useEffect(() => {
		// After first render, we're no longer initializing
		isInitializing.current = false;
	}, []);

	const handleTimeChange = useCallback(
		(seconds: number) => {
			// Update the timer display immediately
			timer.setDisplayTime(seconds);
			// Only update URL if not initializing and time is valid (> 0)
			// This prevents setting URL to 0 during component initialization
			if (!isInitializing.current && seconds > 0) {
				updateURL(seconds, displayColor, displaySize, showHours);
				setHasTimeSet(true);
				// Check if the new time matches a preset, otherwise clear
				setActivePreset(PRESET_VALUES.includes(seconds) ? seconds : null);
			}
		},
		[timer, displayColor, displaySize, showHours],
	);

	const handleColorChange = useCallback(
		(color: DisplayColor) => {
			setDisplayColor(color);
			// Read time from URL (source of truth)
			const baseTime = getBaseTimeFromURL();
			updateURL(baseTime, color, displaySize, showHours);
		},
		[getBaseTimeFromURL, displaySize, showHours],
	);

	const handleSizeChange = useCallback(
		(size: DisplaySize) => {
			setDisplaySize(size);
			// Read time from URL (source of truth)
			const baseTime = getBaseTimeFromURL();
			updateURL(baseTime, displayColor, size, showHours);
		},
		[getBaseTimeFromURL, displayColor, showHours],
	);

	const handleShowHoursChange = useCallback(
		(show: boolean) => {
			setShowHours(show);
			// Read time from URL (source of truth)
			const baseTime = getBaseTimeFromURL();
			updateURL(baseTime, displayColor, displaySize, show);
		},
		[getBaseTimeFromURL, displayColor, displaySize],
	);

	const handleNotificationsChange = useCallback(
		(enabled: boolean) => {
			updateSettings({ notificationsEnabled: enabled });
		},
		[updateSettings],
	);

	const handleReset = useCallback(() => {
		// Stop any playing alarm
		if (stopAlarmRef.current) {
			stopAlarmRef.current();
			stopAlarmRef.current = null;
		}
		// Reset to the current URL baseline (the "identity" of the timer)
		const baseTime = getBaseTimeFromURL();
		timer.setTime(baseTime);
		setHasTimeSet(true);
		// Check if reset time matches a preset
		setActivePreset(PRESET_VALUES.includes(baseTime) ? baseTime : null);
	}, [timer, getBaseTimeFromURL]);

	const handleDismiss = useCallback(() => {
		// Stop the looping alarm
		if (stopAlarmRef.current) {
			stopAlarmRef.current();
			stopAlarmRef.current = null;
		}
		// Clear the completion state
		timer.acknowledge();
	}, [timer]);

	const [showCopied, setShowCopied] = useState(false);
	const handleShare = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setShowCopied(true);
			setTimeout(() => setShowCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy URL:", err);
		}
	}, []);

	// Show loading spinner while settings load from localStorage
	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-[#05060b] flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#05060b] px-4 text-white flex flex-col animate-fade-in">
			<header className="relative text-center space-y-2 pt-8 pb-4 my-2!">
				<Button
					variant="ghost"
					size="icon"
					onClick={handleShare}
					className={cn(
						"fixed top-2 left-2 h-12 w-12 sm:top-3 sm:left-3 sm:h-14 sm:w-14 md:top-4 md:left-4 md:h-[72px] md:w-[72px] text-gray-300 hover:text-white z-50 transition-opacity duration-300",
						timer.isRunning && "opacity-40 hover:opacity-100",
					)}
				>
					{showCopied ? (
						<Check className="h-6 w-6 sm:h-7 sm:w-7 md:h-10 md:w-10" />
					) : (
						<Share2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-10 md:w-10" />
					)}
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsSettingsOpen(true)}
					className={cn(
						"fixed top-2 right-2 h-12 w-12 sm:top-3 sm:right-3 sm:h-14 sm:w-14 md:top-4 md:right-4 md:h-[72px] md:w-[72px] text-gray-300 hover:text-white z-50 transition-opacity duration-300",
						timer.isRunning && "opacity-40 hover:opacity-100",
					)}
				>
					<Settings className="h-6 w-6 sm:h-7 sm:w-7 md:h-10 md:w-10" />
				</Button>
				<p
					className={cn(
						"text-xs tracking-[0.4em] text-gray-300 transition-opacity duration-300",
						timer.isRunning && "opacity-40",
					)}
				>
					{`${formatTimeDisplay(getURLParams().time)} timer`}
				</p>
			</header>

			<div className="flex-1 flex items-center justify-center pb-20 sm:pb-24 md:pb-32">
				<div className="mx-auto w-full max-w-4xl flex flex-col gap-10 items-center">
					<main className="flex flex-col items-center justify-center">
						<div style={{ marginBottom: `${timerMargin}px` }}>
							<TimerDisplay
								seconds={timer.timeRemaining}
								isRunning={timer.isRunning}
								isComplete={timer.isComplete}
								hasStarted={timer.hasStarted}
								hasTimeSet={hasTimeSet}
								displayColor={displayColor}
								displaySize={displaySize}
								showHours={showHours}
							/>
						</div>
						{timer.isComplete ? (
							<div className="flex items-center justify-center pt-6">
								<button
									type="button"
									onClick={handleDismiss}
									className="min-w-[292px] h-11 px-8 rounded-xl border-2 border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 text-white font-medium uppercase tracking-widest transition-all duration-300 animate-pulse"
								>
									Dismiss
								</button>
							</div>
						) : (
							<TimerControls
								isRunning={timer.isRunning}
								isComplete={timer.isComplete}
								timeRemaining={timer.timeRemaining}
								onStart={handleStart}
								onPause={timer.pause}
								onReset={handleReset}
								displayColor={displayColor}
							/>
						)}
					</main>
				</div>
			</div>

			{/* Overlay when drawer is open */}
			<div
				className={cn(
					"fixed inset-0 bg-black/50 backdrop-blur-lg transition-all duration-300 ease-in-out z-40",
					isDrawerOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none",
				)}
				onClick={() => setIsDrawerOpen(false)}
				aria-hidden="true"
			/>

			<section
				className={cn(
					"fixed left-0 right-0 bottom-0 bg-[#1a1a24] backdrop-blur-sm border-t transition-all duration-300 ease-in-out z-50 pb-[env(safe-area-inset-bottom)]",
					isDrawerOpen ? "border-white/10" : "border-white/0",
				)}
				style={{
					// Use (100vh - 100dvh) to account for iOS Safari toolbar height dynamically
					height: isDrawerOpen
						? `calc(${drawerHeight}px + env(safe-area-inset-bottom) + (100vh - 100dvh))`
						: `calc(3px + (100vh - 100dvh))`,
				}}
			>
				{/* Full-width grab handle - larger touch target on mobile */}
				<button
					type="button"
					onClick={() => setIsDrawerOpen(!isDrawerOpen)}
					className={cn(
						"absolute left-0 right-0 -top-12 h-12 sm:-top-10 sm:h-10 flex items-center justify-between bg-[#151520] backdrop-blur-sm border-x-0 border-t border-b-0 border-white/10 rounded-t-none text-gray-300 hover:text-white hover:bg-[#1e1e2a] transition-all duration-300 z-10 touch-manipulation",
						timer.isRunning && "opacity-40 hover:opacity-100",
					)}
					aria-label={
						isDrawerOpen ? "Collapse timer settings" : "Expand timer settings"
					}
				>
					{/* Chevron at 1/3 position */}
					<div className="flex-1 flex justify-center">
						{isDrawerOpen ? (
							<ChevronDown className="h-5 w-5 transition-transform duration-300" />
						) : (
							<ChevronUp className="h-5 w-5 transition-transform duration-300" />
						)}
					</div>
					{/* Chevron at 2/3 position */}
					<div className="flex-1 flex justify-center">
						{isDrawerOpen ? (
							<ChevronDown className="h-5 w-5 transition-transform duration-300" />
						) : (
							<ChevronUp className="h-5 w-5 transition-transform duration-300" />
						)}
					</div>
				</button>
				<div
					className="overflow-hidden transition-all duration-300 ease-in-out h-full"
					style={{
						opacity: isDrawerOpen ? 1 : 0,
					}}
				>
					<div className="px-4 pb-[50px]">
						<div className="mx-auto w-full max-w-4xl">
							<TimeInput
								onTimeSet={handleTimeSet}
								onTimeChange={handleTimeChange}
								onStart={handleStart}
								onClose={() => setIsDrawerOpen(false)}
								disabled={timer.isRunning}
								displayColor={displayColor}
								activePreset={activePreset}
								showHours={showHours}
							/>
						</div>
					</div>
				</div>
			</section>
			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				displayColor={displayColor}
				displaySize={displaySize}
				showHours={showHours}
				notificationsEnabled={settings.notificationsEnabled}
				notificationPermission={permission}
				onColorChange={handleColorChange}
				onSizeChange={handleSizeChange}
				onShowHoursChange={handleShowHoursChange}
				onNotificationsChange={handleNotificationsChange}
				onRequestNotificationPermission={requestPermission}
			/>
		</div>
	);
}

export default App;
