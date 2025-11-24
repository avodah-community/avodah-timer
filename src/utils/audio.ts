// Webkit prefixed AudioContext for older Safari
declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext;
	}
}

// Play a single beep using Web Audio API
function playBeep(
	audioContext: AudioContext,
	frequency: number = 800,
	duration: number = 0.5,
) {
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	oscillator.frequency.value = frequency;
	oscillator.type = "sine";

	// Fade in/out for smoother sound
	gainNode.gain.setValueAtTime(0, audioContext.currentTime);
	gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
	gainNode.gain.exponentialRampToValueAtTime(
		0.01,
		audioContext.currentTime + duration,
	);

	oscillator.start(audioContext.currentTime);
	oscillator.stop(audioContext.currentTime + duration);
}

// Play the three-beep completion pattern
function playBeepPattern(audioContext: AudioContext) {
	playBeep(audioContext, 800, 0.5);
	setTimeout(() => playBeep(audioContext, 800, 0.5), 600);
	setTimeout(() => playBeep(audioContext, 800, 0.5), 1200);
}

// Legacy function for backward compatibility
export function playCompletionSound() {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	playBeepPattern(audioContext);
}

// Start a looping completion alarm that plays until stopped
// Returns a stop function to call when user dismisses
export function startCompletionAlarm(): () => void {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();

	// Play immediately
	playBeepPattern(audioContext);

	// Then repeat every 4 seconds
	const intervalId = setInterval(() => {
		playBeepPattern(audioContext);
	}, 4000);

	// Return stop function
	return () => {
		clearInterval(intervalId);
		audioContext.close();
	};
}
