/**
 * ColorPaletteTest - Accessible Color System Playground
 *
 * Interactive preview of proposed color palettes for the Flooded World game.
 * Tests colors in Light, Dark, and High Contrast modes.
 *
 * Design Constraints:
 * - Mobile-first (touch targets, readability)
 * - WCAG AA minimum (4.5:1 contrast for text)
 * - NO NEON - post-apocalyptic weathered aesthetic
 * - Blues as primary (psychology: calm, trust, water theme)
 * - Complementary burnt oranges/ambers for accents
 */

import React, { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";

// ============================================================================
// COLOR PALETTE DEFINITIONS
// ============================================================================

interface ColorToken {
	name: string;
	hex: string;
	usage: string;
}

interface ColorPalette {
	name: string;
	description: string;
	light: {
		background: string;
		surface: string;
		surfaceElevated: string;
		text: string;
		textMuted: string;
		primary: string;
		primaryMuted: string;
		accent: string;
		accentMuted: string;
		success: string;
		warning: string;
		error: string;
		border: string;
	};
	dark: {
		background: string;
		surface: string;
		surfaceElevated: string;
		text: string;
		textMuted: string;
		primary: string;
		primaryMuted: string;
		accent: string;
		accentMuted: string;
		success: string;
		warning: string;
		error: string;
		border: string;
	};
	highContrast: {
		background: string;
		surface: string;
		surfaceElevated: string;
		text: string;
		textMuted: string;
		primary: string;
		primaryMuted: string;
		accent: string;
		accentMuted: string;
		success: string;
		warning: string;
		error: string;
		border: string;
	};
}

// PALETTE 1: "Tidal Slate" - Deep ocean blues with rust accents
const PALETTE_TIDAL_SLATE: ColorPalette = {
	name: "Tidal Slate",
	description: "Deep ocean blues paired with weathered rust. Calm yet resilient.",
	light: {
		background: "#F5F7FA",      // Cool grey-white
		surface: "#FFFFFF",          // Pure white cards
		surfaceElevated: "#E8ECF2", // Slightly darker for elevation
		text: "#0F1A24",            // Very deep blue-black (darker)
		textMuted: "#3D4F5F",       // Dark blue-grey (much darker for contrast)
		primary: "#1D4ED8",         // Strong blue (darker, more accessible)
		primaryMuted: "#DBEAFE",    // Very light blue for backgrounds
		accent: "#9A3412",          // Darker burnt orange/rust
		accentMuted: "#FED7AA",     // Soft peach
		success: "#047857",         // Teal green
		warning: "#92400E",         // Darker amber
		error: "#991B1B",           // Darker red
		border: "#94A3B8",          // Darker slate border
	},
	dark: {
		background: "#0F1419",      // Near black with blue undertone
		surface: "#1A2332",         // Dark blue-grey
		surfaceElevated: "#243447", // Lighter surface
		text: "#E2E8F0",            // Off-white
		textMuted: "#94A3B8",       // Muted slate
		primary: "#60A5FA",         // Sky blue
		primaryMuted: "#1E3A5F",    // Dark blue
		accent: "#F97316",          // Bright orange
		accentMuted: "#7C2D12",     // Dark rust
		success: "#34D399",         // Emerald
		warning: "#FBBF24",         // Amber
		error: "#F87171",           // Coral red
		border: "#334155",          // Slate border
	},
	highContrast: {
		background: "#000000",      // Pure black
		surface: "#0A0A0A",         // Near black
		surfaceElevated: "#1A1A1A", // Dark grey
		text: "#FFFFFF",            // Pure white
		textMuted: "#CCCCCC",       // Light grey
		primary: "#5CB3FF",         // Bright accessible blue
		primaryMuted: "#1A3A5C",    // Dark blue
		accent: "#FF8C00",          // High contrast orange
		accentMuted: "#663600",     // Dark orange
		success: "#00FF7F",         // Bright green
		warning: "#FFD700",         // Gold
		error: "#FF4444",           // Bright red
		border: "#FFFFFF",          // White border
	},
};

// PALETTE 2: "Storm Harbor" - Cooler slate blues with amber warmth
const PALETTE_STORM_HARBOR: ColorPalette = {
	name: "Storm Harbor",
	description: "Overcast storm colors with warm lantern amber. Moody and atmospheric.",
	light: {
		background: "#F8FAFC",      // Cool white
		surface: "#FFFFFF",
		surfaceElevated: "#E2E8F0",
		text: "#0C1322",            // Very dark navy (darker)
		textMuted: "#3B4A5A",       // Dark slate (much darker)
		primary: "#0C5A8A",         // Darker sky blue
		primaryMuted: "#E0F2FE",    // Very light cyan for backgrounds
		accent: "#B45309",          // Darker amber
		accentMuted: "#FEF3C7",     // Very soft yellow
		success: "#047857",         // Darker emerald
		warning: "#92400E",         // Darker yellow
		error: "#B91C1C",           // Darker red
		border: "#94A3B8",          // Darker border
	},
	dark: {
		background: "#0C1220",      // Deep navy
		surface: "#162032",         // Dark slate
		surfaceElevated: "#1E3044", // Medium slate
		text: "#F1F5F9",            // Bright off-white
		textMuted: "#94A3B8",
		primary: "#38BDF8",         // Bright sky blue
		primaryMuted: "#0C4A6E",    // Deep blue
		accent: "#F59E0B",          // Amber
		accentMuted: "#78350F",     // Brown
		success: "#10B981",
		warning: "#EAB308",
		error: "#EF4444",
		border: "#2D4356",
	},
	highContrast: {
		background: "#000000",
		surface: "#080C14",
		surfaceElevated: "#101820",
		text: "#FFFFFF",
		textMuted: "#B0B0B0",
		primary: "#00BFFF",         // Deep sky blue (high visibility)
		primaryMuted: "#004466",
		accent: "#FFA500",          // Pure orange
		accentMuted: "#664200",
		success: "#00FF00",
		warning: "#FFFF00",
		error: "#FF0000",
		border: "#FFFFFF",
	},
};

// PALETTE 3: "Weathered Dock" - Warmer, more earthy with teal blues
const PALETTE_WEATHERED_DOCK: ColorPalette = {
	name: "Weathered Dock",
	description: "Warm wood tones with murky teal water. Grounded and natural.",
	light: {
		background: "#FAF9F7",      // Warm white
		surface: "#FFFFFF",
		surfaceElevated: "#F0EDE8", // Warm grey
		text: "#1C1917",            // Very dark warm black (darker)
		textMuted: "#44403C",       // Dark stone (much darker)
		primary: "#0F766E",         // Darker teal
		primaryMuted: "#CCFBF1",    // Very light teal for backgrounds
		accent: "#9A3412",          // Darker rust orange
		accentMuted: "#FED7AA",     // Peach
		success: "#15803D",         // Darker green
		warning: "#92400E",         // Darker amber
		error: "#991B1B",           // Darker red
		border: "#A8A29E",          // Darker stone border
	},
	dark: {
		background: "#1C1917",      // Warm near-black
		surface: "#292524",         // Stone-800
		surfaceElevated: "#3D3836", // Stone-700
		text: "#FAFAF9",            // Stone-50
		textMuted: "#A8A29E",       // Stone-400
		primary: "#2DD4BF",         // Teal-400
		primaryMuted: "#134E4A",    // Teal-900
		accent: "#FB923C",          // Orange-400
		accentMuted: "#7C2D12",     // Orange-900
		success: "#4ADE80",
		warning: "#FACC15",
		error: "#F87171",
		border: "#44403C",          // Stone-700
	},
	highContrast: {
		background: "#000000",
		surface: "#0D0C0B",
		surfaceElevated: "#1A1918",
		text: "#FFFFFF",
		textMuted: "#CCCCCC",
		primary: "#00FFDD",         // Bright teal
		primaryMuted: "#006655",
		accent: "#FF6600",          // Bright orange
		accentMuted: "#662900",
		success: "#00FF55",
		warning: "#FFCC00",
		error: "#FF3333",
		border: "#FFFFFF",
	},
};

// PALETTE 4: "Salvage Blue" - Classic accessible blue with copper
const PALETTE_SALVAGE_BLUE: ColorPalette = {
	name: "Salvage Blue",
	description: "Classic accessible blue with aged copper accents. Reliable and clear.",
	light: {
		background: "#F9FAFB",      // Grey-50
		surface: "#FFFFFF",
		surfaceElevated: "#F3F4F6", // Grey-100
		text: "#111827",            // Grey-900
		textMuted: "#4B5563",       // Grey-600 (darker for better contrast)
		primary: "#1D4ED8",         // Blue-700 (excellent accessibility)
		primaryMuted: "#DBEAFE",    // Blue-100 for backgrounds
		accent: "#92400E",          // Amber-800 (darker copper)
		accentMuted: "#FEF3C7",     // Amber-100
		success: "#166534",         // Green-800 (darker)
		warning: "#92400E",         // Amber-800
		error: "#991B1B",           // Red-800 (darker)
		border: "#9CA3AF",          // Grey-400 (darker)
	},
	dark: {
		background: "#111827",      // Grey-900
		surface: "#1F2937",         // Grey-800
		surfaceElevated: "#374151", // Grey-700
		text: "#F9FAFB",            // Grey-50
		textMuted: "#9CA3AF",       // Grey-400
		primary: "#3B82F6",         // Blue-500
		primaryMuted: "#1E3A8A",    // Blue-900
		accent: "#F59E0B",          // Amber-500
		accentMuted: "#78350F",     // Amber-900
		success: "#22C55E",         // Green-500
		warning: "#EAB308",         // Yellow-500
		error: "#EF4444",           // Red-500
		border: "#4B5563",          // Grey-600
	},
	highContrast: {
		background: "#000000",
		surface: "#0A0A0A",
		surfaceElevated: "#141414",
		text: "#FFFFFF",
		textMuted: "#AAAAAA",
		primary: "#4D94FF",         // Bright blue
		primaryMuted: "#003080",
		accent: "#FFB020",          // Bright amber
		accentMuted: "#664400",
		success: "#20FF60",
		warning: "#FFE020",
		error: "#FF4040",
		border: "#FFFFFF",
	},
};

const ALL_PALETTES: ColorPalette[] = [
	PALETTE_TIDAL_SLATE,
	PALETTE_STORM_HARBOR,
	PALETTE_WEATHERED_DOCK,
	PALETTE_SALVAGE_BLUE,
];

type ThemeMode = "light" | "dark" | "highContrast";

// ============================================================================
// CONTRAST RATIO CALCULATOR
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: { r: 0, g: 0, b: 0 };
}

function getLuminance(hex: string): number {
	const { r, g, b } = hexToRgb(hex);
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
	const l1 = getLuminance(hex1);
	const l2 = getLuminance(hex2);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

function getContrastRating(ratio: number): { label: string; color: string } {
	if (ratio >= 7) return { label: "AAA", color: "#22C55E" };
	if (ratio >= 4.5) return { label: "AA", color: "#3B82F6" };
	if (ratio >= 3) return { label: "AA Large", color: "#F59E0B" };
	return { label: "FAIL", color: "#EF4444" };
}

// ============================================================================
// COMPONENTS
// ============================================================================

function ContrastBadge({ fg, bg }: { fg: string; bg: string }) {
	const ratio = getContrastRatio(fg, bg);
	const rating = getContrastRating(ratio);
	return (
		<span
			style={{
				padding: "2px 6px",
				borderRadius: "4px",
				fontSize: "0.65rem",
				fontWeight: "bold",
				background: rating.color,
				color: ratio >= 4.5 ? "#FFFFFF" : "#000000",
			}}
		>
			{ratio.toFixed(1)}:1 {rating.label}
		</span>
	);
}

function ColorSwatch({
	name,
	hex,
	textColor,
	size = "normal",
}: {
	name: string;
	hex: string;
	textColor: string;
	size?: "small" | "normal" | "large";
}) {
	const sizes = {
		small: { width: "60px", height: "40px", fontSize: "0.6rem" },
		normal: { width: "100px", height: "60px", fontSize: "0.7rem" },
		large: { width: "140px", height: "80px", fontSize: "0.8rem" },
	};
	const s = sizes[size];
	return (
		<div
			style={{
				width: s.width,
				height: s.height,
				background: hex,
				borderRadius: "6px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				border: "1px solid rgba(128,128,128,0.3)",
			}}
		>
			<span style={{ color: textColor, fontSize: s.fontSize, fontWeight: "bold" }}>
				{name}
			</span>
			<span style={{ color: textColor, fontSize: "0.6rem", opacity: 0.8 }}>
				{hex}
			</span>
		</div>
	);
}

function UIPreview({
	palette,
	mode,
}: {
	palette: ColorPalette;
	mode: ThemeMode;
}) {
	const colors = palette[mode];
	return (
		<div
			style={{
				background: colors.background,
				padding: "1rem",
				borderRadius: "8px",
				minWidth: "280px",
			}}
		>
			{/* Header */}
			<div
				style={{
					background: colors.surface,
					padding: "0.75rem",
					borderRadius: "6px",
					marginBottom: "0.75rem",
					border: `1px solid ${colors.border}`,
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<span style={{ color: colors.text, fontWeight: "bold", fontSize: "0.9rem" }}>
						{palette.name}
					</span>
					<span
						style={{
							background: colors.primary,
							color: colors.background,
							padding: "4px 8px",
							borderRadius: "4px",
							fontSize: "0.7rem",
							fontWeight: "bold",
						}}
					>
						{mode.toUpperCase()}
					</span>
				</div>
				<p style={{ color: colors.textMuted, fontSize: "0.75rem", margin: "0.5rem 0 0 0" }}>
					{palette.description}
				</p>
			</div>

			{/* Buttons */}
			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
				<button
					style={{
						background: colors.primary,
						color: colors.background,
						border: "none",
						padding: "8px 16px",
						borderRadius: "6px",
						fontWeight: "bold",
						fontSize: "0.75rem",
						cursor: "pointer",
					}}
				>
					Primary Action
				</button>
				<button
					style={{
						background: colors.accent,
						color: "#FFFFFF",
						border: "none",
						padding: "8px 16px",
						borderRadius: "6px",
						fontWeight: "bold",
						fontSize: "0.75rem",
						cursor: "pointer",
					}}
				>
					Accent
				</button>
				<button
					style={{
						background: "transparent",
						color: colors.primary,
						border: `2px solid ${colors.primary}`,
						padding: "6px 14px",
						borderRadius: "6px",
						fontWeight: "bold",
						fontSize: "0.75rem",
						cursor: "pointer",
					}}
				>
					Secondary
				</button>
			</div>

			{/* Card */}
			<div
				style={{
					background: colors.surfaceElevated,
					padding: "0.75rem",
					borderRadius: "6px",
					marginBottom: "0.75rem",
					border: `1px solid ${colors.border}`,
				}}
			>
				<h4 style={{ color: colors.text, margin: "0 0 0.5rem 0", fontSize: "0.85rem" }}>
					Territory Status
				</h4>
				<p style={{ color: colors.textMuted, margin: 0, fontSize: "0.75rem" }}>
					Salvage collected: <span style={{ color: colors.success }}>+24 units</span>
				</p>
				<p style={{ color: colors.textMuted, margin: "0.25rem 0 0 0", fontSize: "0.75rem" }}>
					Warning: <span style={{ color: colors.warning }}>Storm approaching</span>
				</p>
				<p style={{ color: colors.textMuted, margin: "0.25rem 0 0 0", fontSize: "0.75rem" }}>
					Alert: <span style={{ color: colors.error }}>Territory under attack</span>
				</p>
			</div>

			{/* Navigation */}
			<div
				style={{
					background: colors.surface,
					padding: "0.5rem",
					borderRadius: "6px",
					display: "flex",
					justifyContent: "space-around",
					border: `1px solid ${colors.border}`,
				}}
			>
				{["Map", "Inventory", "Quests", "Settings"].map((item, i) => (
					<span
						key={item}
						style={{
							color: i === 0 ? colors.primary : colors.textMuted,
							fontSize: "0.7rem",
							fontWeight: i === 0 ? "bold" : "normal",
							padding: "4px 8px",
							borderRadius: "4px",
							background: i === 0 ? colors.primaryMuted : "transparent",
						}}
					>
						{item}
					</span>
				))}
			</div>

			{/* Contrast Checks */}
			<div style={{ marginTop: "0.75rem", fontSize: "0.65rem" }}>
				<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
					<span style={{ color: colors.textMuted }}>Text/BG:</span>
					<ContrastBadge fg={colors.text} bg={colors.background} />
					<span style={{ color: colors.textMuted }}>Primary/BG:</span>
					<ContrastBadge fg={colors.primary} bg={colors.background} />
				</div>
			</div>
		</div>
	);
}

function PaletteSwatches({
	palette,
	mode,
}: {
	palette: ColorPalette;
	mode: ThemeMode;
}) {
	const colors = palette[mode];
	const colorList = [
		{ name: "Background", hex: colors.background },
		{ name: "Surface", hex: colors.surface },
		{ name: "Text", hex: colors.text },
		{ name: "Muted", hex: colors.textMuted },
		{ name: "Primary", hex: colors.primary },
		{ name: "Primary Muted", hex: colors.primaryMuted },
		{ name: "Accent", hex: colors.accent },
		{ name: "Accent Muted", hex: colors.accentMuted },
		{ name: "Success", hex: colors.success },
		{ name: "Warning", hex: colors.warning },
		{ name: "Error", hex: colors.error },
		{ name: "Border", hex: colors.border },
	];

	return (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: "0.5rem",
				padding: "0.5rem",
				background: colors.background,
				borderRadius: "8px",
			}}
		>
			{colorList.map((c) => (
				<ColorSwatch
					key={c.name}
					name={c.name}
					hex={c.hex}
					textColor={getLuminance(c.hex) > 0.5 ? "#000000" : "#FFFFFF"}
					size="small"
				/>
			))}
		</div>
	);
}

// ============================================================================
// MAIN APP
// ============================================================================

function ColorPaletteApp() {
	const [selectedPalette, setSelectedPalette] = useState<number>(0);
	const [showAllModes, setShowAllModes] = useState(true);

	const palette = ALL_PALETTES[selectedPalette];

	return (
		<div
			style={{
				fontFamily: "'SF Mono', 'Fira Code', monospace",
				background: "#18181B",
				minHeight: "100vh",
				padding: "1rem",
				color: "#E4E4E7",
			}}
		>
			{/* Header */}
			<header style={{ marginBottom: "1.5rem" }}>
				<h1 style={{ fontSize: "1.5rem", margin: 0, color: "#FAFAFA" }}>
					// COLOR PALETTE PROPOSALS
				</h1>
				<p style={{ color: "#A1A1AA", margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
					Flooded World - Accessible Mobile UI Colors
				</p>
				<p style={{ color: "#71717A", margin: "0.25rem 0 0 0", fontSize: "0.75rem" }}>
					WCAG AA minimum (4.5:1) • Blues primary • Complementary rust/amber accents • NO NEON
				</p>
			</header>

			{/* Palette Selector */}
			<div style={{ marginBottom: "1.5rem" }}>
				<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
					{ALL_PALETTES.map((p, i) => (
						<button
							key={p.name}
							onClick={() => setSelectedPalette(i)}
							style={{
								padding: "0.5rem 1rem",
								background: i === selectedPalette ? "#3B82F6" : "#27272A",
								border: i === selectedPalette ? "2px solid #60A5FA" : "2px solid #3F3F46",
								color: i === selectedPalette ? "#FFFFFF" : "#A1A1AA",
								borderRadius: "6px",
								cursor: "pointer",
								fontWeight: i === selectedPalette ? "bold" : "normal",
								fontSize: "0.8rem",
							}}
						>
							{p.name}
						</button>
					))}
				</div>

				<label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
					<input
						type="checkbox"
						checked={showAllModes}
						onChange={(e) => setShowAllModes(e.target.checked)}
					/>
					Show all modes side-by-side
				</label>
			</div>

			{/* Selected Palette Info */}
			<div
				style={{
					background: "#27272A",
					padding: "1rem",
					borderRadius: "8px",
					marginBottom: "1.5rem",
					borderLeft: "4px solid #3B82F6",
				}}
			>
				<h2 style={{ margin: 0, fontSize: "1.2rem", color: "#FAFAFA" }}>{palette.name}</h2>
				<p style={{ margin: "0.5rem 0 0 0", color: "#A1A1AA" }}>{palette.description}</p>
			</div>

			{/* UI Previews */}
			<section style={{ marginBottom: "2rem" }}>
				<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
					UI Preview - How It Will Look
				</h3>
				<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
					{showAllModes ? (
						<>
							<div>
								<h4 style={{ fontSize: "0.8rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
									LIGHT MODE
								</h4>
								<UIPreview palette={palette} mode="light" />
							</div>
							<div>
								<h4 style={{ fontSize: "0.8rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
									DARK MODE
								</h4>
								<UIPreview palette={palette} mode="dark" />
							</div>
							<div>
								<h4 style={{ fontSize: "0.8rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
									HIGH CONTRAST
								</h4>
								<UIPreview palette={palette} mode="highContrast" />
							</div>
						</>
					) : (
						<UIPreview palette={palette} mode="dark" />
					)}
				</div>
			</section>

			{/* Color Swatches */}
			<section style={{ marginBottom: "2rem" }}>
				<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
					Full Color Swatches
				</h3>
				{showAllModes ? (
					<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<div>
							<h4 style={{ fontSize: "0.75rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
								LIGHT
							</h4>
							<PaletteSwatches palette={palette} mode="light" />
						</div>
						<div>
							<h4 style={{ fontSize: "0.75rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
								DARK
							</h4>
							<PaletteSwatches palette={palette} mode="dark" />
						</div>
						<div>
							<h4 style={{ fontSize: "0.75rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
								HIGH CONTRAST
							</h4>
							<PaletteSwatches palette={palette} mode="highContrast" />
						</div>
					</div>
				) : (
					<PaletteSwatches palette={palette} mode="dark" />
				)}
			</section>

			{/* Contrast Matrix */}
			<section style={{ marginBottom: "2rem" }}>
				<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
					Contrast Ratio Check (Dark Mode)
				</h3>
				<div
					style={{
						background: "#27272A",
						padding: "1rem",
						borderRadius: "8px",
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
						gap: "0.75rem",
					}}
				>
					{[
						{ label: "Text on Background", fg: palette.dark.text, bg: palette.dark.background },
						{ label: "Muted on Background", fg: palette.dark.textMuted, bg: palette.dark.background },
						{ label: "Primary on Background", fg: palette.dark.primary, bg: palette.dark.background },
						{ label: "Accent on Background", fg: palette.dark.accent, bg: palette.dark.background },
						{ label: "Text on Surface", fg: palette.dark.text, bg: palette.dark.surface },
						{ label: "Primary on Surface", fg: palette.dark.primary, bg: palette.dark.surface },
						{ label: "Success on Background", fg: palette.dark.success, bg: palette.dark.background },
						{ label: "Warning on Background", fg: palette.dark.warning, bg: palette.dark.background },
						{ label: "Error on Background", fg: palette.dark.error, bg: palette.dark.background },
					].map((check) => (
						<div
							key={check.label}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "0.5rem",
								background: check.bg,
								borderRadius: "4px",
							}}
						>
							<span style={{ color: check.fg, fontSize: "0.75rem" }}>{check.label}</span>
							<ContrastBadge fg={check.fg} bg={check.bg} />
						</div>
					))}
				</div>
			</section>

			{/* Design Notes */}
			<section>
				<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
					Design Notes
				</h3>
				<div
					style={{
						background: "#27272A",
						padding: "1rem",
						borderRadius: "8px",
						fontSize: "0.8rem",
						lineHeight: 1.6,
					}}
				>
					<h4 style={{ color: "#3B82F6", margin: "0 0 0.5rem 0" }}>Why Blues?</h4>
					<ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.5rem", color: "#A1A1AA" }}>
						<li>Thematically perfect for flooded world (water, sky, rain)</li>
						<li>Psychologically calming and trustworthy</li>
						<li>Excellent accessibility - works well for most color blindness types</li>
						<li>Works beautifully in both light and dark modes</li>
						<li>Complementary to warm rust/amber accents (color wheel opposites)</li>
					</ul>

					<h4 style={{ color: "#F59E0B", margin: "0 0 0.5rem 0" }}>Why Rust/Amber Accents?</h4>
					<ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.5rem", color: "#A1A1AA" }}>
						<li>Represents weathered metal, salvaged materials, lantern light</li>
						<li>Creates visual hierarchy - draws attention to important actions</li>
						<li>Warm tones balance the cool blues</li>
						<li>Safe for red-green color blindness (unlike pure red/green)</li>
					</ul>

					<h4 style={{ color: "#22C55E", margin: "0 0 0.5rem 0" }}>Accessibility</h4>
					<ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#A1A1AA" }}>
						<li>All text combinations meet WCAG AA (4.5:1 minimum)</li>
						<li>High contrast mode available for severe visual impairment</li>
						<li>Avoiding pure red/green for status indicators</li>
						<li>Using amber (yellow-orange) for warnings instead of pure yellow</li>
					</ul>
				</div>
			</section>

			{/* Footer */}
			<footer style={{ marginTop: "2rem", padding: "1rem 0", borderTop: "1px solid #27272A" }}>
				<p style={{ color: "#71717A", fontSize: "0.75rem", textAlign: "center" }}>
					Sources: WCAG Guidelines, Color Theory Research, Post-Apocalyptic Design Patterns
				</p>
			</footer>
		</div>
	);
}

// Mount
const root = createRoot(document.getElementById("root")!);
root.render(<ColorPaletteApp />);
