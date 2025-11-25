import { useEffect, useState } from "react";

const MIN_LOADING_MS = 300; // Minimum loading time for smooth transition

export function useSettings() {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const startTime = Date.now();

		// Ensure minimum loading time for smooth transition
		const elapsed = Date.now() - startTime;
		const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

		setTimeout(() => {
			setIsLoaded(true);
		}, remaining);
	}, []);

	return {
		isLoaded,
	};
}
