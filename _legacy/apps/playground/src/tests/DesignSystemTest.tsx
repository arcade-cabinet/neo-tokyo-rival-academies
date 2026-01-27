/**
 * DesignSystemTest - Typography & HUD Mockups
 *
 * Comprehensive design system preview:
 * - Font pairings (header + body)
 * - Size scales for accessibility
 * - HUD mockups for mobile game
 * - Light/Dark/High-Contrast modes
 */

import React, { useState } from "react";
import { createRoot } from "react-dom/client";

// ============================================================================
// FONT DEFINITIONS
// ============================================================================

interface FontPairing {
	name: string;
	description: string;
	headerFont: string;
	headerWeight: number;
	bodyFont: string;
	bodyWeight: number;
	googleImport: string;
}

const FONT_PAIRINGS: FontPairing[] = [
	{
		name: "Industrial Standard",
		description: "Oswald headers with Inter body. Strong industrial presence, maximum readability.",
		headerFont: "'Oswald', sans-serif",
		headerWeight: 600,
		bodyFont: "'Inter', sans-serif",
		bodyWeight: 400,
		googleImport: "Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700",
	},
	{
		name: "Condensed Tech",
		description: "Barlow Condensed headers with DM Sans body. Clean, modern, space-efficient.",
		headerFont: "'Barlow Condensed', sans-serif",
		headerWeight: 600,
		bodyFont: "'DM Sans', sans-serif",
		bodyWeight: 400,
		googleImport: "Barlow+Condensed:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700",
	},
	{
		name: "Bold Impact",
		description: "Bebas Neue headers with Source Sans 3 body. Maximum impact, excellent reading.",
		headerFont: "'Bebas Neue', sans-serif",
		headerWeight: 400,
		bodyFont: "'Source Sans 3', sans-serif",
		bodyWeight: 400,
		googleImport: "Bebas+Neue&family=Source+Sans+3:wght@400;500;600;700",
	},
	{
		name: "Technical Precision",
		description: "Rajdhani headers with Inter body. Semi-condensed, technical feel, game-ready.",
		headerFont: "'Rajdhani', sans-serif",
		headerWeight: 600,
		bodyFont: "'Inter', sans-serif",
		bodyWeight: 400,
		googleImport: "Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600;700",
	},
	{
		name: "Humanist Warmth",
		description: "Saira headers with Nunito body. Warmer, friendlier, still readable.",
		headerFont: "'Saira', sans-serif",
		headerWeight: 600,
		bodyFont: "'Nunito', sans-serif",
		bodyWeight: 400,
		googleImport: "Saira:wght@400;500;600;700&family=Nunito:wght@400;500;600;700",
	},
];

// ============================================================================
// COLOR PALETTE (Using Tidal Slate as default)
// ============================================================================

const COLORS = {
	light: {
		background: "#F5F7FA",
		surface: "#FFFFFF",
		surfaceElevated: "#E8ECF2",
		text: "#0F1A24",
		textMuted: "#3D4F5F",
		primary: "#1D4ED8",
		primaryMuted: "#DBEAFE",
		accent: "#9A3412",
		accentMuted: "#FED7AA",
		success: "#047857",
		warning: "#92400E",
		error: "#991B1B",
		border: "#94A3B8",
	},
	dark: {
		background: "#0F1419",
		surface: "#1A2332",
		surfaceElevated: "#243447",
		text: "#E2E8F0",
		textMuted: "#94A3B8",
		primary: "#60A5FA",
		primaryMuted: "#1E3A5F",
		accent: "#F97316",
		accentMuted: "#7C2D12",
		success: "#34D399",
		warning: "#FBBF24",
		error: "#F87171",
		border: "#334155",
	},
	highContrast: {
		background: "#000000",
		surface: "#0A0A0A",
		surfaceElevated: "#1A1A1A",
		text: "#FFFFFF",
		textMuted: "#CCCCCC",
		primary: "#5CB3FF",
		primaryMuted: "#1A3A5C",
		accent: "#FF8C00",
		accentMuted: "#663600",
		success: "#00FF7F",
		warning: "#FFD700",
		error: "#FF4444",
		border: "#FFFFFF",
	},
};

type ThemeMode = "light" | "dark" | "highContrast";

// ============================================================================
// SIZE SCALE (Mobile-first, accessible)
// ============================================================================

const SIZE_SCALE = {
	// Minimum touch target: 44px (Apple HIG) / 48px (Material)
	touchTarget: 48,

	// Text sizes (rem-based for accessibility)
	textXs: "0.75rem",    // 12px - captions only
	textSm: "0.875rem",   // 14px - secondary text
	textBase: "1rem",     // 16px - body text (minimum for mobile)
	textLg: "1.125rem",   // 18px - emphasized body
	textXl: "1.25rem",    // 20px - subheadings
	text2xl: "1.5rem",    // 24px - section headers
	text3xl: "1.875rem",  // 30px - page titles
	text4xl: "2.25rem",   // 36px - hero text

	// Spacing
	spacingXs: "0.25rem",
	spacingSm: "0.5rem",
	spacingMd: "1rem",
	spacingLg: "1.5rem",
	spacingXl: "2rem",
};

// ============================================================================
// COMPONENTS
// ============================================================================

function FontLoader({ pairing }: { pairing: FontPairing }) {
	return (
		<link
			href={`https://fonts.googleapis.com/css2?family=${pairing.googleImport}&display=swap`}
			rel="stylesheet"
		/>
	);
}

function TypographyPreview({
	pairing,
	colors,
}: {
	pairing: FontPairing;
	colors: typeof COLORS.dark;
}) {
	return (
		<div
			style={{
				background: colors.surface,
				padding: "1.5rem",
				borderRadius: "12px",
				border: `1px solid ${colors.border}`,
			}}
		>
			<div style={{ marginBottom: "1rem" }}>
				<span
					style={{
						background: colors.primary,
						color: colors.background,
						padding: "4px 8px",
						borderRadius: "4px",
						fontSize: SIZE_SCALE.textSm,
						fontFamily: pairing.bodyFont,
						fontWeight: 600,
					}}
				>
					{pairing.name}
				</span>
			</div>

			<h1
				style={{
					fontFamily: pairing.headerFont,
					fontWeight: pairing.headerWeight,
					fontSize: SIZE_SCALE.text3xl,
					color: colors.text,
					margin: "0 0 0.5rem 0",
					lineHeight: 1.2,
				}}
			>
				FLOODED WORLD
			</h1>
			<h2
				style={{
					fontFamily: pairing.headerFont,
					fontWeight: pairing.headerWeight,
					fontSize: SIZE_SCALE.text2xl,
					color: colors.text,
					margin: "0 0 0.5rem 0",
					lineHeight: 1.3,
				}}
			>
				Territory Status
			</h2>
			<h3
				style={{
					fontFamily: pairing.headerFont,
					fontWeight: pairing.headerWeight - 100,
					fontSize: SIZE_SCALE.textXl,
					color: colors.textMuted,
					margin: "0 0 1rem 0",
					lineHeight: 1.4,
				}}
			>
				Salvage Operations
			</h3>

			<p
				style={{
					fontFamily: pairing.bodyFont,
					fontWeight: pairing.bodyWeight,
					fontSize: SIZE_SCALE.textBase,
					color: colors.text,
					margin: "0 0 0.75rem 0",
					lineHeight: 1.6,
				}}
			>
				The waters rose 40 years ago. Now humanity survives on rooftops,
				bridges, and floating platforms cobbled together from the old world's
				debris. Every scrap of metal, every salvaged wire has value.
			</p>

			<p
				style={{
					fontFamily: pairing.bodyFont,
					fontWeight: pairing.bodyWeight,
					fontSize: SIZE_SCALE.textSm,
					color: colors.textMuted,
					margin: 0,
					lineHeight: 1.5,
				}}
			>
				Secondary text for captions, timestamps, and metadata.
				Resources: <span style={{ color: colors.success }}>+24 salvage</span> |
				Warning: <span style={{ color: colors.warning }}>storm incoming</span> |
				Alert: <span style={{ color: colors.error }}>territory contested</span>
			</p>
		</div>
	);
}

function HUDMockup({
	pairing,
	colors,
	mode,
}: {
	pairing: FontPairing;
	colors: typeof COLORS.dark;
	mode: ThemeMode;
}) {
	return (
		<div
			style={{
				background: colors.background,
				borderRadius: "12px",
				overflow: "hidden",
				border: `2px solid ${colors.border}`,
				position: "relative",
				width: "100%",
				maxWidth: "375px", // iPhone width
				aspectRatio: "9/16",
			}}
		>
			{/* Top HUD Bar */}
			<div
				style={{
					background: `linear-gradient(180deg, ${colors.surface}ee 0%, ${colors.surface}00 100%)`,
					padding: "1rem",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				{/* Player Info */}
				<div>
					<div
						style={{
							fontFamily: pairing.headerFont,
							fontWeight: pairing.headerWeight,
							fontSize: SIZE_SCALE.textLg,
							color: colors.text,
							marginBottom: "4px",
						}}
					>
						KIRA
					</div>
					{/* HP Bar */}
					<div
						style={{
							width: "120px",
							height: "8px",
							background: colors.surfaceElevated,
							borderRadius: "4px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: "75%",
								height: "100%",
								background: `linear-gradient(90deg, ${colors.success} 0%, ${colors.warning} 100%)`,
							}}
						/>
					</div>
					<div
						style={{
							fontFamily: pairing.bodyFont,
							fontSize: SIZE_SCALE.textXs,
							color: colors.textMuted,
							marginTop: "2px",
						}}
					>
						HP 75/100
					</div>
				</div>

				{/* Resources */}
				<div style={{ textAlign: "right" }}>
					<div
						style={{
							fontFamily: pairing.bodyFont,
							fontSize: SIZE_SCALE.textSm,
							color: colors.accent,
							fontWeight: 600,
						}}
					>
						⚡ 247
					</div>
					<div
						style={{
							fontFamily: pairing.bodyFont,
							fontSize: SIZE_SCALE.textSm,
							color: colors.primary,
							fontWeight: 600,
						}}
					>
						🔧 89
					</div>
				</div>
			</div>

			{/* Game Area (placeholder) */}
			<div
				style={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "200px",
				}}
			>
				<span
					style={{
						fontFamily: pairing.bodyFont,
						fontSize: SIZE_SCALE.textSm,
						color: colors.textMuted,
						opacity: 0.5,
					}}
				>
					[ GAME VIEW ]
				</span>
			</div>

			{/* Quest Notification */}
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					background: colors.surface,
					border: `2px solid ${colors.primary}`,
					borderRadius: "8px",
					padding: "1rem",
					maxWidth: "280px",
					boxShadow: `0 4px 20px ${colors.background}80`,
				}}
			>
				<div
					style={{
						fontFamily: pairing.headerFont,
						fontWeight: pairing.headerWeight,
						fontSize: SIZE_SCALE.textLg,
						color: colors.primary,
						marginBottom: "0.5rem",
					}}
				>
					NEW QUEST
				</div>
				<div
					style={{
						fontFamily: pairing.bodyFont,
						fontSize: SIZE_SCALE.textBase,
						color: colors.text,
						marginBottom: "0.75rem",
						lineHeight: 1.4,
					}}
				>
					Salvage the solar panels from the abandoned tower before the storm hits.
				</div>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<button
						style={{
							flex: 1,
							padding: "12px",
							background: colors.primary,
							color: "#FFFFFF",
							border: "none",
							borderRadius: "6px",
							fontFamily: pairing.headerFont,
							fontWeight: 600,
							fontSize: SIZE_SCALE.textSm,
							cursor: "pointer",
							minHeight: `${SIZE_SCALE.touchTarget}px`,
						}}
					>
						ACCEPT
					</button>
					<button
						style={{
							flex: 1,
							padding: "12px",
							background: "transparent",
							color: colors.textMuted,
							border: `1px solid ${colors.border}`,
							borderRadius: "6px",
							fontFamily: pairing.bodyFont,
							fontWeight: 500,
							fontSize: SIZE_SCALE.textSm,
							cursor: "pointer",
							minHeight: `${SIZE_SCALE.touchTarget}px`,
						}}
					>
						Later
					</button>
				</div>
			</div>

			{/* Bottom Navigation */}
			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					background: colors.surface,
					borderTop: `1px solid ${colors.border}`,
					padding: "0.75rem",
					display: "flex",
					justifyContent: "space-around",
				}}
			>
				{[
					{ icon: "🗺️", label: "MAP", active: true },
					{ icon: "🎒", label: "ITEMS", active: false },
					{ icon: "📋", label: "QUESTS", active: false },
					{ icon: "⚙️", label: "MENU", active: false },
				].map((item) => (
					<div
						key={item.label}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							padding: "4px 12px",
							borderRadius: "8px",
							background: item.active ? colors.primaryMuted : "transparent",
							minWidth: `${SIZE_SCALE.touchTarget}px`,
							minHeight: `${SIZE_SCALE.touchTarget}px`,
							justifyContent: "center",
						}}
					>
						<span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
						<span
							style={{
								fontFamily: pairing.headerFont,
								fontWeight: item.active ? 600 : 400,
								fontSize: SIZE_SCALE.textXs,
								color: item.active ? colors.primary : colors.textMuted,
								marginTop: "2px",
							}}
						>
							{item.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function InventoryMockup({
	pairing,
	colors,
}: {
	pairing: FontPairing;
	colors: typeof COLORS.dark;
}) {
	const items = [
		{ name: "Salvaged Wire", qty: 24, rarity: "common" },
		{ name: "Solar Cell", qty: 3, rarity: "rare" },
		{ name: "Water Filter", qty: 1, rarity: "epic" },
		{ name: "Rusted Pipe", qty: 12, rarity: "common" },
	];

	const rarityColors: Record<string, string> = {
		common: colors.textMuted,
		rare: colors.primary,
		epic: colors.accent,
	};

	return (
		<div
			style={{
				background: colors.surface,
				borderRadius: "12px",
				padding: "1rem",
				border: `1px solid ${colors.border}`,
				maxWidth: "320px",
			}}
		>
			<h3
				style={{
					fontFamily: pairing.headerFont,
					fontWeight: pairing.headerWeight,
					fontSize: SIZE_SCALE.textXl,
					color: colors.text,
					margin: "0 0 1rem 0",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				INVENTORY
				<span
					style={{
						fontFamily: pairing.bodyFont,
						fontSize: SIZE_SCALE.textSm,
						color: colors.textMuted,
						fontWeight: 400,
					}}
				>
					40/50
				</span>
			</h3>

			<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
				{items.map((item) => (
					<div
						key={item.name}
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "0.75rem",
							background: colors.surfaceElevated,
							borderRadius: "8px",
							borderLeft: `3px solid ${rarityColors[item.rarity]}`,
							minHeight: `${SIZE_SCALE.touchTarget}px`,
						}}
					>
						<span
							style={{
								fontFamily: pairing.bodyFont,
								fontSize: SIZE_SCALE.textBase,
								color: colors.text,
							}}
						>
							{item.name}
						</span>
						<span
							style={{
								fontFamily: pairing.bodyFont,
								fontSize: SIZE_SCALE.textSm,
								color: rarityColors[item.rarity],
								fontWeight: 600,
							}}
						>
							x{item.qty}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function DialogMockup({
	pairing,
	colors,
}: {
	pairing: FontPairing;
	colors: typeof COLORS.dark;
}) {
	return (
		<div
			style={{
				background: colors.surface,
				borderRadius: "12px",
				padding: "1.5rem",
				border: `1px solid ${colors.border}`,
				maxWidth: "360px",
			}}
		>
			{/* Character name */}
			<div
				style={{
					fontFamily: pairing.headerFont,
					fontWeight: pairing.headerWeight,
					fontSize: SIZE_SCALE.textLg,
					color: colors.accent,
					marginBottom: "0.75rem",
				}}
			>
				CAPTAIN YUKI
			</div>

			{/* Dialog text */}
			<p
				style={{
					fontFamily: pairing.bodyFont,
					fontSize: SIZE_SCALE.textBase,
					color: colors.text,
					lineHeight: 1.6,
					margin: "0 0 1rem 0",
				}}
			>
				"The old tower district was hit hard by last month's storm.
				There's good salvage up there, but watch out for the Tide Runners.
				They've been spotted in the area."
			</p>

			{/* Dialog options */}
			<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
				{[
					"Tell me more about the Tide Runners.",
					"I'll handle it. Where exactly?",
					"Maybe another time.",
				].map((option, i) => (
					<button
						key={i}
						style={{
							padding: "12px 16px",
							background: i === 1 ? colors.primaryMuted : colors.surfaceElevated,
							border: i === 1 ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
							borderRadius: "8px",
							fontFamily: pairing.bodyFont,
							fontSize: SIZE_SCALE.textBase,
							color: i === 1 ? colors.primary : colors.text,
							textAlign: "left",
							cursor: "pointer",
							minHeight: `${SIZE_SCALE.touchTarget}px`,
						}}
					>
						{option}
					</button>
				))}
			</div>
		</div>
	);
}

// ============================================================================
// MAIN APP
// ============================================================================

function DesignSystemApp() {
	const [selectedFont, setSelectedFont] = useState(0);
	const [mode, setMode] = useState<ThemeMode>("dark");

	const pairing = FONT_PAIRINGS[selectedFont];
	const colors = COLORS[mode];

	return (
		<>
			{/* Load all fonts */}
			{FONT_PAIRINGS.map((p) => (
				<FontLoader key={p.name} pairing={p} />
			))}

			<div
				style={{
					fontFamily: "'Inter', sans-serif",
					background: "#18181B",
					minHeight: "100vh",
					padding: "1rem",
					color: "#E4E4E7",
				}}
			>
				{/* Header */}
				<header style={{ marginBottom: "1.5rem" }}>
					<h1 style={{ fontSize: "1.5rem", margin: 0, color: "#FAFAFA" }}>
						// TYPOGRAPHY & HUD MOCKUPS
					</h1>
					<p style={{ color: "#A1A1AA", margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
						Font pairings and UI components for Flooded World
					</p>
				</header>

				{/* Controls */}
				<div
					style={{
						display: "flex",
						gap: "1rem",
						marginBottom: "1.5rem",
						flexWrap: "wrap",
						alignItems: "flex-start",
					}}
				>
					{/* Font selector */}
					<div>
						<label
							style={{
								display: "block",
								fontSize: "0.75rem",
								color: "#A1A1AA",
								marginBottom: "0.5rem",
							}}
						>
							FONT PAIRING
						</label>
						<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
							{FONT_PAIRINGS.map((p, i) => (
								<button
									key={p.name}
									onClick={() => setSelectedFont(i)}
									style={{
										padding: "0.5rem 1rem",
										background: i === selectedFont ? "#3B82F6" : "#27272A",
										border: i === selectedFont ? "2px solid #60A5FA" : "2px solid #3F3F46",
										color: i === selectedFont ? "#FFFFFF" : "#A1A1AA",
										borderRadius: "6px",
										cursor: "pointer",
										fontWeight: i === selectedFont ? "bold" : "normal",
										fontSize: "0.8rem",
									}}
								>
									{p.name}
								</button>
							))}
						</div>
					</div>

					{/* Theme selector */}
					<div>
						<label
							style={{
								display: "block",
								fontSize: "0.75rem",
								color: "#A1A1AA",
								marginBottom: "0.5rem",
							}}
						>
							THEME MODE
						</label>
						<div style={{ display: "flex", gap: "0.5rem" }}>
							{(["light", "dark", "highContrast"] as ThemeMode[]).map((m) => (
								<button
									key={m}
									onClick={() => setMode(m)}
									style={{
										padding: "0.5rem 1rem",
										background: m === mode ? "#3B82F6" : "#27272A",
										border: m === mode ? "2px solid #60A5FA" : "2px solid #3F3F46",
										color: m === mode ? "#FFFFFF" : "#A1A1AA",
										borderRadius: "6px",
										cursor: "pointer",
										fontWeight: m === mode ? "bold" : "normal",
										fontSize: "0.8rem",
									}}
								>
									{m === "highContrast" ? "HIGH CONTRAST" : m.toUpperCase()}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Font Info */}
				<div
					style={{
						background: "#27272A",
						padding: "1rem",
						borderRadius: "8px",
						marginBottom: "1.5rem",
						borderLeft: "4px solid #3B82F6",
					}}
				>
					<h2 style={{ margin: 0, fontSize: "1rem", color: "#FAFAFA" }}>
						{pairing.name}
					</h2>
					<p style={{ margin: "0.5rem 0 0 0", color: "#A1A1AA", fontSize: "0.85rem" }}>
						{pairing.description}
					</p>
					<p style={{ margin: "0.5rem 0 0 0", color: "#71717A", fontSize: "0.75rem" }}>
						Header: <code style={{ color: "#60A5FA" }}>{pairing.headerFont}</code> |
						Body: <code style={{ color: "#60A5FA" }}>{pairing.bodyFont}</code>
					</p>
				</div>

				{/* Typography Preview */}
				<section style={{ marginBottom: "2rem" }}>
					<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
						Typography Scale
					</h3>
					<TypographyPreview pairing={pairing} colors={colors} />
				</section>

				{/* HUD Mockups */}
				<section style={{ marginBottom: "2rem" }}>
					<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
						Mobile HUD Mockup
					</h3>
					<div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
						<HUDMockup pairing={pairing} colors={colors} mode={mode} />
						<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
							<InventoryMockup pairing={pairing} colors={colors} />
							<DialogMockup pairing={pairing} colors={colors} />
						</div>
					</div>
				</section>

				{/* Size Scale Reference */}
				<section style={{ marginBottom: "2rem" }}>
					<h3 style={{ fontSize: "1rem", color: "#FAFAFA", marginBottom: "1rem" }}>
						Accessibility Size Scale
					</h3>
					<div
						style={{
							background: colors.surface,
							padding: "1rem",
							borderRadius: "12px",
							border: `1px solid ${colors.border}`,
						}}
					>
						{[
							{ name: "text-xs", size: SIZE_SCALE.textXs, note: "Captions only (use sparingly)" },
							{ name: "text-sm", size: SIZE_SCALE.textSm, note: "Secondary text, metadata" },
							{ name: "text-base", size: SIZE_SCALE.textBase, note: "Body text (minimum for mobile)" },
							{ name: "text-lg", size: SIZE_SCALE.textLg, note: "Emphasized body" },
							{ name: "text-xl", size: SIZE_SCALE.textXl, note: "Subheadings" },
							{ name: "text-2xl", size: SIZE_SCALE.text2xl, note: "Section headers" },
							{ name: "text-3xl", size: SIZE_SCALE.text3xl, note: "Page titles" },
						].map((scale) => (
							<div
								key={scale.name}
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: "1rem",
									marginBottom: "0.75rem",
									paddingBottom: "0.75rem",
									borderBottom: `1px solid ${colors.border}`,
								}}
							>
								<code
									style={{
										color: colors.primary,
										fontSize: "0.75rem",
										width: "80px",
									}}
								>
									{scale.name}
								</code>
								<span
									style={{
										fontFamily: pairing.bodyFont,
										fontSize: scale.size,
										color: colors.text,
									}}
								>
									Sample Text
								</span>
								<span
									style={{
										fontFamily: pairing.bodyFont,
										fontSize: "0.75rem",
										color: colors.textMuted,
										marginLeft: "auto",
									}}
								>
									{scale.size} - {scale.note}
								</span>
							</div>
						))}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								marginTop: "1rem",
								padding: "0.75rem",
								background: colors.surfaceElevated,
								borderRadius: "8px",
							}}
						>
							<div
								style={{
									width: `${SIZE_SCALE.touchTarget}px`,
									height: `${SIZE_SCALE.touchTarget}px`,
									background: colors.primary,
									borderRadius: "8px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#FFFFFF",
									fontFamily: pairing.bodyFont,
									fontSize: "0.75rem",
								}}
							>
								48px
							</div>
							<span
								style={{
									fontFamily: pairing.bodyFont,
									fontSize: "0.85rem",
									color: colors.text,
								}}
							>
								Minimum touch target: <strong>48px</strong> (Material Design / Apple HIG)
							</span>
						</div>
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
							fontSize: "0.85rem",
							lineHeight: 1.6,
						}}
					>
						<h4 style={{ color: "#3B82F6", margin: "0 0 0.5rem 0" }}>Typography Principles</h4>
						<ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.5rem", color: "#A1A1AA" }}>
							<li>Headers: Bold, condensed industrial fonts convey survival/post-apocalyptic theme</li>
							<li>Body: Clean, highly readable fonts optimized for screen display</li>
							<li>Minimum body text: 16px (1rem) for mobile readability</li>
							<li>Line height: 1.5-1.6 for body text, 1.2-1.3 for headers</li>
						</ul>

						<h4 style={{ color: "#F97316", margin: "0 0 0.5rem 0" }}>Mobile-First Rules</h4>
						<ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.5rem", color: "#A1A1AA" }}>
							<li>Touch targets: Minimum 48px for all interactive elements</li>
							<li>Spacing: Generous padding for fat-finger friendliness</li>
							<li>Contrast: All text meets WCAG AA (4.5:1) minimum</li>
							<li>High contrast mode available for visual impairment</li>
						</ul>

						<h4 style={{ color: "#34D399", margin: "0 0 0.5rem 0" }}>Font Loading</h4>
						<p style={{ margin: 0, color: "#A1A1AA" }}>
							All fonts loaded from Google Fonts with <code>display=swap</code> for
							performance. Consider subsetting for production builds.
						</p>
					</div>
				</section>

				{/* Footer */}
				<footer style={{ marginTop: "2rem", padding: "1rem 0", borderTop: "1px solid #27272A" }}>
					<p style={{ color: "#71717A", fontSize: "0.75rem", textAlign: "center" }}>
						Sources: <a href="https://www.typewolf.com/google-fonts" style={{ color: "#60A5FA" }}>Typewolf</a>,
						<a href="https://www.untitledui.com/blog/best-free-fonts" style={{ color: "#60A5FA" }}> Untitled UI</a>,
						<a href="https://fonts.google.com" style={{ color: "#60A5FA" }}> Google Fonts</a>
					</p>
				</footer>
			</div>
		</>
	);
}

// Mount
const root = createRoot(document.getElementById("root")!);
root.render(<DesignSystemApp />);
