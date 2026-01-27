/**
 * useTheme - React hook for Flooded World design system
 *
 * Provides theme-aware colors, typography, and sizing.
 * Supports light, dark, and high-contrast modes.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { colors, typography, spacing, sizing, shadows, type ThemeMode } from "./tokens";

// ============================================================================
// THEME DETECTION
// ============================================================================

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): ThemeMode | null {
	if (typeof localStorage === "undefined") return null;
	const stored = localStorage.getItem("flooded-world-theme");
	if (stored === "light" || stored === "dark" || stored === "highContrast") {
		return stored;
	}
	return null;
}

function storeTheme(mode: ThemeMode): void {
	if (typeof localStorage !== "undefined") {
		localStorage.setItem("flooded-world-theme", mode);
	}
}

// ============================================================================
// HOOK
// ============================================================================

/** Shadow type that works for both light and dark modes */
type ShadowSet = { sm: string; md: string; lg: string; xl: string };

export interface UseThemeReturn {
	/** Current theme mode */
	mode: ThemeMode;
	/** Set theme mode */
	setMode: (mode: ThemeMode) => void;
	/** Toggle between light and dark */
	toggleMode: () => void;
	/** Current theme colors */
	colors: (typeof colors)["dark"];
	/** Typography tokens */
	typography: typeof typography;
	/** Spacing tokens */
	spacing: typeof spacing;
	/** Sizing tokens */
	sizing: typeof sizing;
	/** Shadow tokens for current mode */
	shadows: ShadowSet;
	/** Is dark mode active */
	isDark: boolean;
	/** Is high contrast mode active */
	isHighContrast: boolean;
}

export function useTheme(defaultMode?: ThemeMode): UseThemeReturn {
	const [mode, setModeState] = useState<ThemeMode>(() => {
		// Priority: explicit default > stored preference > system preference
		if (defaultMode) return defaultMode;
		const stored = getStoredTheme();
		if (stored) return stored;
		return getSystemTheme();
	});

	// Listen for system theme changes
	useEffect(() => {
		if (getStoredTheme()) return; // Don't override if user has explicit preference

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			setModeState(e.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, []);

	const setMode = useCallback((newMode: ThemeMode) => {
		setModeState(newMode);
		storeTheme(newMode);
	}, []);

	const toggleMode = useCallback(() => {
		setModeState((current) => {
			const next = current === "dark" ? "light" : "dark";
			storeTheme(next);
			return next;
		});
	}, []);

	const themeColors = useMemo(() => colors[mode], [mode]);
	const themeShadows = useMemo(
		() => (mode === "light" ? shadows.light : shadows.dark),
		[mode]
	);

	return {
		mode,
		setMode,
		toggleMode,
		colors: themeColors,
		typography,
		spacing,
		sizing,
		shadows: themeShadows,
		isDark: mode === "dark" || mode === "highContrast",
		isHighContrast: mode === "highContrast",
	};
}

// ============================================================================
// STYLE HELPERS
// ============================================================================

/**
 * Creates inline styles for a themed component
 */
export function createThemedStyles(mode: ThemeMode) {
	const c = colors[mode];
	const s = mode === "light" ? shadows.light : shadows.dark;

	return {
		// Common patterns
		panel: {
			background: c.surface,
			border: `1px solid ${c.border}`,
			borderRadius: sizing.radiusLg,
			color: c.text,
		},

		panelElevated: {
			background: c.surfaceElevated,
			border: `1px solid ${c.border}`,
			borderRadius: sizing.radiusLg,
			boxShadow: s.md,
			color: c.text,
		},

		primaryButton: {
			background: c.primary,
			color: mode === "light" ? "#FFFFFF" : c.background,
			border: "none",
			borderRadius: sizing.radiusMd,
			fontFamily: typography.fonts.header,
			fontWeight: typography.weights.semibold,
			fontSize: typography.sizes.sm,
			padding: `${spacing.sm} ${spacing.lg}`,
			minHeight: sizing.touchTargetPx,
			cursor: "pointer",
		},

		secondaryButton: {
			background: "transparent",
			color: c.primary,
			border: `2px solid ${c.primary}`,
			borderRadius: sizing.radiusMd,
			fontFamily: typography.fonts.body,
			fontWeight: typography.weights.medium,
			fontSize: typography.sizes.sm,
			padding: `${spacing.sm} ${spacing.lg}`,
			minHeight: sizing.touchTargetPx,
			cursor: "pointer",
		},

		accentButton: {
			background: c.accent,
			color: "#FFFFFF",
			border: "none",
			borderRadius: sizing.radiusMd,
			fontFamily: typography.fonts.header,
			fontWeight: typography.weights.semibold,
			fontSize: typography.sizes.sm,
			padding: `${spacing.sm} ${spacing.lg}`,
			minHeight: sizing.touchTargetPx,
			cursor: "pointer",
		},

		input: {
			background: c.background,
			color: c.text,
			border: `1px solid ${c.border}`,
			borderRadius: sizing.radiusMd,
			fontFamily: typography.fonts.body,
			fontSize: typography.sizes.base,
			padding: `${spacing.sm} ${spacing.md}`,
			minHeight: sizing.inputHeight,
		},

		header: {
			fontFamily: typography.fonts.header,
			fontWeight: typography.weights.semibold,
			color: c.text,
			lineHeight: typography.lineHeights.tight,
		},

		body: {
			fontFamily: typography.fonts.body,
			fontWeight: typography.weights.regular,
			color: c.text,
			lineHeight: typography.lineHeights.normal,
		},

		muted: {
			fontFamily: typography.fonts.body,
			color: c.textMuted,
			fontSize: typography.sizes.sm,
		},

		success: { color: c.success },
		warning: { color: c.warning },
		error: { color: c.error },
	};
}

export default useTheme;
