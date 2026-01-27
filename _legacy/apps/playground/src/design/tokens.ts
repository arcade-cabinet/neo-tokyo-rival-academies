/**
 * Design Tokens - Flooded World Design System
 *
 * Centralized design tokens for consistent UI across the game.
 *
 * Typography: Technical Precision (Rajdhani + Inter)
 * - Anchored to 2020s-2030s modern aesthetic
 * - Pre-flood infrastructure would use these fonts
 *
 * Colors: Tidal Slate palette
 * - Blues primary (water theme, accessibility)
 * - Rust/amber accents (weathered materials)
 * - NO NEON - post-apocalyptic survival aesthetic
 *
 * @see docs/DESIGN_PHILOSOPHY.md
 * @see docs/WORLD_TIMELINE.md
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
	fonts: {
		/** Header font - technical, semi-condensed, modern infrastructure feel */
		header: "'Rajdhani', sans-serif",
		/** Body font - highly readable, screen-optimized */
		body: "'Inter', sans-serif",
		/** Monospace for code/data displays */
		mono: "'JetBrains Mono', 'Fira Code', monospace",
	},

	weights: {
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},

	/** Font sizes in rem (base 16px) - mobile-first, accessible */
	sizes: {
		/** 12px - Captions only, use sparingly */
		xs: "0.75rem",
		/** 14px - Secondary text, metadata */
		sm: "0.875rem",
		/** 16px - Body text (minimum for mobile readability) */
		base: "1rem",
		/** 18px - Emphasized body text */
		lg: "1.125rem",
		/** 20px - Subheadings */
		xl: "1.25rem",
		/** 24px - Section headers */
		"2xl": "1.5rem",
		/** 30px - Page titles */
		"3xl": "1.875rem",
		/** 36px - Hero text */
		"4xl": "2.25rem",
		/** 48px - Display text */
		"5xl": "3rem",
	},

	lineHeights: {
		/** Tight - for headers */
		tight: 1.2,
		/** Snug - for subheaders */
		snug: 1.3,
		/** Normal - for body text */
		normal: 1.5,
		/** Relaxed - for long-form reading */
		relaxed: 1.6,
	},

	/** Google Fonts import URL */
	googleFontsUrl:
		"https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
} as const;

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
	light: {
		// Backgrounds
		background: "#F5F7FA",
		surface: "#FFFFFF",
		surfaceElevated: "#E8ECF2",

		// Text
		text: "#0F1A24",
		textMuted: "#3D4F5F",

		// Primary (Blue - water theme)
		primary: "#1D4ED8",
		primaryHover: "#1E40AF",
		primaryMuted: "#DBEAFE",

		// Accent (Rust/Amber - weathered materials)
		accent: "#9A3412",
		accentHover: "#7C2D12",
		accentMuted: "#FED7AA",

		// Semantic
		success: "#047857",
		successMuted: "#D1FAE5",
		warning: "#92400E",
		warningMuted: "#FEF3C7",
		error: "#991B1B",
		errorMuted: "#FEE2E2",

		// Borders & Dividers
		border: "#94A3B8",
		borderLight: "#CBD5E1",
		divider: "#E2E8F0",
	},

	dark: {
		// Backgrounds
		background: "#0F1419",
		surface: "#1A2332",
		surfaceElevated: "#243447",

		// Text
		text: "#E2E8F0",
		textMuted: "#94A3B8",

		// Primary (Blue - water theme)
		primary: "#60A5FA",
		primaryHover: "#3B82F6",
		primaryMuted: "#1E3A5F",

		// Accent (Rust/Amber - weathered materials)
		accent: "#F97316",
		accentHover: "#EA580C",
		accentMuted: "#7C2D12",

		// Semantic
		success: "#34D399",
		successMuted: "#064E3B",
		warning: "#FBBF24",
		warningMuted: "#78350F",
		error: "#F87171",
		errorMuted: "#7F1D1D",

		// Borders & Dividers
		border: "#334155",
		borderLight: "#475569",
		divider: "#1E293B",
	},

	highContrast: {
		// Backgrounds
		background: "#000000",
		surface: "#0A0A0A",
		surfaceElevated: "#1A1A1A",

		// Text
		text: "#FFFFFF",
		textMuted: "#CCCCCC",

		// Primary
		primary: "#5CB3FF",
		primaryHover: "#7EC8FF",
		primaryMuted: "#1A3A5C",

		// Accent
		accent: "#FF8C00",
		accentHover: "#FFA333",
		accentMuted: "#663600",

		// Semantic
		success: "#00FF7F",
		successMuted: "#004D26",
		warning: "#FFD700",
		warningMuted: "#665500",
		error: "#FF4444",
		errorMuted: "#660000",

		// Borders & Dividers
		border: "#FFFFFF",
		borderLight: "#CCCCCC",
		divider: "#333333",
	},

	// Academy colors (faction theming)
	factions: {
		kurenai: {
			primary: "#DC2626", // Crimson
			secondary: "#FCD34D", // Gold
			muted: "#7F1D1D",
		},
		azure: {
			primary: "#2563EB", // Cobalt
			secondary: "#E5E7EB", // Silver
			muted: "#1E3A8A",
		},
		neutral: {
			primary: "#6B7280", // Grey
			secondary: "#D1D5DB",
			muted: "#374151",
		},
	},

	// Material colors (world objects)
	materials: {
		rust: "#A0522D",
		concrete: "#6B7280",
		water: "#0E4A5C",
		waterDeep: "#0A2F3A",
		wood: "#8B7355",
		tarp: "#4A5568",
		rope: "#D2B48C",
		metal: "#71717A",
	},
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
	/** 4px */
	xs: "0.25rem",
	/** 8px */
	sm: "0.5rem",
	/** 12px */
	md: "0.75rem",
	/** 16px */
	lg: "1rem",
	/** 24px */
	xl: "1.5rem",
	/** 32px */
	"2xl": "2rem",
	/** 48px */
	"3xl": "3rem",
	/** 64px */
	"4xl": "4rem",
} as const;

// ============================================================================
// SIZING
// ============================================================================

export const sizing = {
	/** Minimum touch target for mobile (Apple HIG / Material Design) */
	touchTarget: 48,
	touchTargetPx: "48px",

	/** Icon sizes */
	iconSm: "16px",
	iconMd: "20px",
	iconLg: "24px",
	iconXl: "32px",

	/** Border radius */
	radiusSm: "4px",
	radiusMd: "6px",
	radiusLg: "8px",
	radiusXl: "12px",
	radiusFull: "9999px",

	/** Common component heights */
	buttonSm: "32px",
	buttonMd: "40px",
	buttonLg: "48px",
	inputHeight: "44px",
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
	light: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	},
	dark: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
	},
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
	fast: "150ms ease",
	normal: "200ms ease",
	slow: "300ms ease",
	/** For color/opacity changes */
	colors: "150ms ease",
	/** For transform/movement */
	transform: "200ms ease-out",
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
	base: 0,
	dropdown: 100,
	sticky: 200,
	modal: 300,
	popover: 400,
	tooltip: 500,
	toast: 600,
	overlay: 700,
	max: 9999,
} as const;

// ============================================================================
// BREAKPOINTS (Mobile-first)
// ============================================================================

export const breakpoints = {
	/** Small phones */
	xs: "320px",
	/** Large phones */
	sm: "480px",
	/** Tablets */
	md: "768px",
	/** Small laptops */
	lg: "1024px",
	/** Desktops */
	xl: "1280px",
	/** Large screens */
	"2xl": "1536px",
} as const;

// ============================================================================
// THEME HELPER
// ============================================================================

export type ThemeMode = "light" | "dark" | "highContrast";

export function getThemeColors(mode: ThemeMode) {
	return colors[mode];
}

// ============================================================================
// CSS CUSTOM PROPERTIES GENERATOR
// ============================================================================

/**
 * Generates CSS custom properties for a given theme mode.
 * Useful for injecting into :root or a theme provider.
 */
export function generateCSSVariables(mode: ThemeMode): string {
	const c = colors[mode];
	return `
    --color-background: ${c.background};
    --color-surface: ${c.surface};
    --color-surface-elevated: ${c.surfaceElevated};
    --color-text: ${c.text};
    --color-text-muted: ${c.textMuted};
    --color-primary: ${c.primary};
    --color-primary-hover: ${c.primaryHover};
    --color-primary-muted: ${c.primaryMuted};
    --color-accent: ${c.accent};
    --color-accent-hover: ${c.accentHover};
    --color-accent-muted: ${c.accentMuted};
    --color-success: ${c.success};
    --color-warning: ${c.warning};
    --color-error: ${c.error};
    --color-border: ${c.border};
    --color-divider: ${c.divider};

    --font-header: ${typography.fonts.header};
    --font-body: ${typography.fonts.body};
    --font-mono: ${typography.fonts.mono};

    --size-touch-target: ${sizing.touchTargetPx};
    --radius-md: ${sizing.radiusMd};
    --radius-lg: ${sizing.radiusLg};
  `.trim();
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const tokens = {
	typography,
	colors,
	spacing,
	sizing,
	shadows,
	transitions,
	zIndex,
	breakpoints,
} as const;

export default tokens;
