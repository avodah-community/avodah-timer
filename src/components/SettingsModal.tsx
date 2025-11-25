import { X } from "lucide-react";
import { type DisplaySize, SIZE_OPTIONS } from "@/constants";
import { COLOR_OPTIONS, type DisplayColor } from "@/utils/colors";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	displayColor: DisplayColor;
	displaySize: DisplaySize;
	showHours: boolean;
	onColorChange: (color: DisplayColor) => void;
	onSizeChange: (size: DisplaySize) => void;
	onShowHoursChange: (show: boolean) => void;
}

export function SettingsModal({
	isOpen,
	onClose,
	displayColor,
	displaySize,
	showHours,
	onColorChange,
	onSizeChange,
	onShowHoursChange,
}: SettingsModalProps) {
	if (!isOpen) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<Card
				className="w-full max-w-md border-gray-700 bg-gray-900/95 max-h-[90dvh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-gray-900/95 z-10">
					<CardTitle>Settings</CardTitle>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-10 w-10 sm:h-8 sm:w-8 touch-manipulation"
					>
						<X className="h-5 w-5 sm:h-4 sm:w-4" />
					</Button>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-3">
						<span className="text-sm font-medium text-gray-300 block">
							Display Color
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
							{COLOR_OPTIONS.map((option) => (
								<button
									type="button"
									key={option.value}
									onClick={() => onColorChange(option.value)}
									className={`
                                        flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation
                                        ${
																					displayColor === option.value
																						? "border-cyan-400 bg-cyan-400/10"
																						: "border-gray-700 bg-gray-800/50 hover:border-gray-600"
																				}
                                    `}
								>
									<div
										className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${option.preview} shadow-lg`}
									/>
									<span className="text-xs sm:text-sm text-gray-300">
										{option.label}
									</span>
								</button>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<span className="text-sm font-medium text-gray-300 block">
							Display Size
						</span>
						<div className="flex gap-2 sm:gap-3">
							{SIZE_OPTIONS.map((option) => (
								<button
									type="button"
									key={option.value}
									onClick={() => onSizeChange(option.value)}
									className={`
                                        flex-1 flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation
                                        ${
																					displaySize === option.value
																						? "border-cyan-400 bg-cyan-400/10 text-white"
																						: "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600"
																				}
                                    `}
								>
									<span className="text-base sm:text-lg font-semibold">
										{option.label}
									</span>
								</button>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<span className="text-sm font-medium text-gray-300 block">
							Show Hours
						</span>
						<button
							type="button"
							onClick={() => onShowHoursChange(!showHours)}
							className={`
                                w-full flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation
                                ${
																	showHours
																		? "border-cyan-400 bg-cyan-400/10"
																		: "border-gray-700 bg-gray-800/50 hover:border-gray-600"
																}
                            `}
						>
							<span className="text-sm text-gray-300">
								{showHours ? "Hours visible" : "Hours hidden"}
							</span>
							<div
								className={`
                                    w-11 h-6 rounded-full transition-all relative
                                    ${showHours ? "bg-cyan-400" : "bg-gray-600"}
                                `}
							>
								<div
									className={`
                                        absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                                        ${showHours ? "left-6" : "left-1"}
                                    `}
								/>
							</div>
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
