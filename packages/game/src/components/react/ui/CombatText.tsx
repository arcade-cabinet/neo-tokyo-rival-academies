import type { FC } from "react";
import { useEffect, useState } from "react";

interface CombatTextProps {
	message: string;
	color: string;
	onComplete?: () => void;
}

interface FloatingDamageProps {
	damage: number;
	isCritical: boolean;
	position: { x: number; y: number };
	color?: string; // Optional override
	onComplete?: () => void;
}

/**
 * Custom hook for floating animation logic.
 */
const useFloatingAnimation = (onComplete?: () => void) => {
	const [offset, setOffset] = useState(0);
	const [opacity, setOpacity] = useState(1);

	useEffect(() => {
		let frameId = 0;
		let isActive = true;
		const startTime = Date.now();
		const duration = 1000;

		const animate = () => {
			if (!isActive) return;
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			setOffset(-50 * progress);
			setOpacity(1 - progress);

			if (progress < 1) {
				frameId = requestAnimationFrame(animate);
			} else {
				onComplete?.();
			}
		};

		frameId = requestAnimationFrame(animate);
		return () => {
			isActive = false;
			cancelAnimationFrame(frameId);
		};
	}, [onComplete]);

	return { offset, opacity };
};

/**
 * Generic combat text component for displaying messages.
 */
export const CombatText: FC<CombatTextProps> = ({
	message,
	color,
	onComplete,
}) => {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		setVisible(true);
		timer = setTimeout(() => {
			setVisible(false);
			onComplete?.();
		}, 600);

		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<div
			style={{
				position: "absolute",
				top: "30%",
				width: "100%",
				textAlign: "center",
				fontSize: "4rem",
				fontWeight: 900,
				color: "#fff",
				textShadow: `4px 4px 0 ${color}`,
				fontStyle: "italic",
				opacity: visible ? 1 : 0,
				transform: visible
					? "scale(1.2) skewX(-20deg)"
					: "scale(0.5) skewX(-20deg)",
				transition: "all 0.1s",
				pointerEvents: "none",
				zIndex: 100,
			}}
		>
			{message}
		</div>
	);
};

/**
 * Floating damage numbers component.
 * Spawns damage text at hit location with color coding and animation.
 *
 * Color coding:
 * - White: Normal damage
 * - Yellow: Critical hit
 * - Red: Player damage
 */
export const FloatingDamage: FC<FloatingDamageProps> = ({
	damage,
	isCritical,
	position,
	color: colorOverride,
	onComplete,
}) => {
	const { offset, opacity } = useFloatingAnimation(onComplete);

	// Determine color based on damage type or override
	const color = colorOverride || (isCritical ? "#FFD700" : "#FFFFFF");

	return (
		<div
			style={{
				position: "absolute",
				left: `${position.x}px`,
				top: `${position.y + offset}px`,
				fontSize: isCritical ? "2.5rem" : "2rem",
				fontWeight: 900,
				color: color,
				textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
				opacity: opacity,
				pointerEvents: "none",
				zIndex: 1000,
				transform: isCritical ? "scale(1.2)" : "scale(1)",
				transition: "transform 0.1s",
			}}
		>
			{damage}
		</div>
	);
};

/**
 * Player damage variant (red color).
 */
export const PlayerDamage: FC<
	Omit<FloatingDamageProps, "isCritical" | "color">
> = (props) => {
	return <FloatingDamage {...props} isCritical={false} color="#FF4444" />;
};
