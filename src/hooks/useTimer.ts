import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerOptions {
	initialTime: number; // in seconds
	onComplete?: () => void;
}

export function useTimer({ initialTime, onComplete }: UseTimerOptions) {
	const [timeRemaining, setTimeRemaining] = useState(initialTime);
	const [isRunning, setIsRunning] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);

	// Store the target end time for accurate timing
	const endTimeRef = useRef<number | null>(null);
	const intervalRef = useRef<number | null>(null);
	const onCompleteRef = useRef(onComplete);

	// Keep onComplete ref updated to avoid stale closures
	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	// Calculate remaining time from end time reference
	const calculateRemaining = useCallback(() => {
		if (endTimeRef.current === null) return timeRemaining;
		const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
		return Math.max(0, remaining);
	}, [timeRemaining]);

	// Main timer effect using timestamp-based timing
	useEffect(() => {
		if (isRunning && endTimeRef.current !== null) {
			// Use a shorter interval (200ms) for more responsive updates
			intervalRef.current = setInterval(() => {
				const remaining = calculateRemaining();
				setTimeRemaining(remaining);

				if (remaining <= 0) {
					setIsRunning(false);
					setIsComplete(true);
					endTimeRef.current = null;
					if (onCompleteRef.current) {
						onCompleteRef.current();
					}
				}
			}, 200);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isRunning, calculateRemaining]);

	// Visibility change handler - immediately update time when tab becomes visible
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				isRunning &&
				endTimeRef.current !== null
			) {
				const remaining = calculateRemaining();
				setTimeRemaining(remaining);

				if (remaining <= 0) {
					setIsRunning(false);
					setIsComplete(true);
					endTimeRef.current = null;
					if (onCompleteRef.current) {
						onCompleteRef.current();
					}
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isRunning, calculateRemaining]);

	const start = useCallback(() => {
		// Set the end time based on current remaining time
		endTimeRef.current = Date.now() + timeRemaining * 1000;
		setIsRunning(true);
		setIsComplete(false);
		setHasStarted(true);
	}, [timeRemaining]);

	const pause = useCallback(() => {
		// Store the current remaining time before pausing
		if (endTimeRef.current !== null) {
			const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
			setTimeRemaining(Math.max(0, remaining));
		}
		endTimeRef.current = null;
		setIsRunning(false);
	}, []);

	const reset = useCallback(() => {
		endTimeRef.current = null;
		setIsRunning(false);
		setIsComplete(false);
		setHasStarted(false);
		setTimeRemaining(initialTime);
	}, [initialTime]);

	const setTime = useCallback((seconds: number) => {
		endTimeRef.current = null;
		setIsRunning(false);
		setIsComplete(false);
		setHasStarted(false);
		setTimeRemaining(seconds);
	}, []);

	const setDisplayTime = useCallback((seconds: number) => {
		// Always update the display, even when running, so users can see their changes immediately
		setTimeRemaining(seconds);
		// If running, also update the end time to match the new display time
		if (endTimeRef.current !== null) {
			endTimeRef.current = Date.now() + seconds * 1000;
		}
	}, []);

	// Acknowledge completion without resetting - just clears the complete state
	const acknowledge = useCallback(() => {
		setIsComplete(false);
	}, []);

	return {
		timeRemaining,
		isRunning,
		isComplete,
		hasStarted,
		start,
		pause,
		reset,
		setTime,
		setDisplayTime,
		acknowledge,
	};
}
