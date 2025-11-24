import { useCallback, useEffect, useState } from "react";

type NotificationPermission = "default" | "granted" | "denied";

interface UseNotificationsReturn {
	permission: NotificationPermission;
	isSupported: boolean;
	requestPermission: () => Promise<NotificationPermission>;
	sendNotification: (title: string, options?: NotificationOptions) => void;
}

export function useNotifications(): UseNotificationsReturn {
	const [permission, setPermission] =
		useState<NotificationPermission>("default");
	const isSupported = typeof window !== "undefined" && "Notification" in window;

	useEffect(() => {
		if (isSupported) {
			const currentPermission = Notification.permission;
			setPermission(currentPermission);
			console.log(
				"[Notifications] Initial permission state:",
				currentPermission,
			);
		} else {
			console.log(
				"[Notifications] Notifications not supported in this browser",
			);
		}
	}, [isSupported]);

	const requestPermission =
		useCallback(async (): Promise<NotificationPermission> => {
			if (!isSupported) {
				console.log(
					"[Notifications] Cannot request permission - not supported",
				);
				return "denied";
			}

			try {
				console.log("[Notifications] Requesting notification permission...");
				const result = await Notification.requestPermission();
				console.log("[Notifications] Permission request result:", result);
				setPermission(result);
				return result;
			} catch (error) {
				console.error(
					"[Notifications] Failed to request notification permission:",
					error,
				);
				return "denied";
			}
		}, [isSupported]);

	const sendNotification = useCallback(
		(title: string, options?: NotificationOptions) => {
			console.log("[Notifications] sendNotification called with:", {
				title,
				options,
				isSupported,
				permission,
			});

			if (!isSupported) {
				console.warn(
					"[Notifications] Cannot send notification - not supported",
				);
				return;
			}

			if (permission !== "granted") {
				console.warn(
					"[Notifications] Cannot send notification - permission not granted. Current permission:",
					permission,
				);
				return;
			}

			try {
				console.log("[Notifications] Creating notification...");
				const notification = new Notification(title, {
					icon: "/favicon.svg",
					badge: "/favicon.svg",
					...options,
				});
				console.log(
					"[Notifications] Notification created successfully:",
					notification,
				);
			} catch (error) {
				console.error("[Notifications] Failed to send notification:", error);
			}
		},
		[isSupported, permission],
	);

	return {
		permission,
		isSupported,
		requestPermission,
		sendNotification,
	};
}
