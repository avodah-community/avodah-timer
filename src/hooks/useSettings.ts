import { useEffect, useState } from "react";

// Note: DisplayColor is now exported from @/utils/colors
// Note: DisplaySize is now exported from @/constants

// Only notificationsEnabled is stored in localStorage
// displayColor, displaySize, and timer are stored in URL
interface Settings {
	notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
	notificationsEnabled: false,
};

const STORAGE_KEY = "avodah-timer-settings";

const MIN_LOADING_MS = 300; // Minimum loading time for smooth transition

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const startTime = Date.now();

		// Load settings from localStorage (only notificationsEnabled)
		let loadedSettings = DEFAULT_SETTINGS;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Only pick notificationsEnabled from stored settings
				loadedSettings = {
					notificationsEnabled:
						parsed.notificationsEnabled ??
						DEFAULT_SETTINGS.notificationsEnabled,
				};
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}

		// Ensure minimum loading time for smooth transition
		const elapsed = Date.now() - startTime;
		const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

		setTimeout(() => {
			setSettings(loadedSettings);
			setIsLoaded(true);
		}, remaining);
	}, []);

	const updateSettings = (newSettings: Partial<Settings>) => {
		const updated = { ...settings, ...newSettings };
		setSettings(updated);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		} catch (error) {
			console.error("Failed to save settings:", error);
		}
	};

	return {
		settings,
		updateSettings,
		isLoaded,
	};
}
