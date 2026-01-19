/**
 * TestHarness - Reusable test environment for isolated component testing
 *
 * Provides:
 * - Babylon scene with camera controls
 * - Orbit camera for inspection
 * - Grid helper for spatial reference
 * - Info panel showing component state
 * - Seed input for procedural testing
 *
 * AUTOMATION-FRIENDLY DESIGN (for Claude MCP browser control):
 *
 * window.playground API:
 *   - getSeed() → current seed string
 *   - setSeed(value) → change seed programmatically
 *   - getState() → all current state as object
 *   - getFps() → current FPS number
 *   - getScene() → Babylon scene reference
 *   - listControls() → array of available control names
 *   - setControl(name, value) → set a control value
 *
 * Data attributes for element finding:
 *   - [data-playground="seed-input"] - seed input field
 *   - [data-playground="fps-display"] - FPS counter
 *   - [data-playground-control="name"] - control elements
 *
 * Console logging:
 *   - All state changes logged with [PLAYGROUND] prefix
 *   - Use read_console_messages with pattern "[PLAYGROUND]" to track
 */

import "@babylonjs/core/Engines/engine";
import "@babylonjs/core/scene";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";
import {
	ArcRotateCamera,
	Color3,
	Color4,
	HemisphericLight,
	DirectionalLight,
	MeshBuilder,
	Vector3,
	type Scene as BabylonScene,
	DefaultRenderingPipeline,
	ImageProcessingConfiguration,
} from "@babylonjs/core";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Scene, useScene } from "reactylon";
import { Engine } from "reactylon/web";
import { useTheme, createThemedStyles, typography, type ThemeMode } from "./design";

/**
 * Control definition for automation-friendly controls
 */
export interface PlaygroundControl {
	/** Unique name for programmatic access */
	name: string;
	/** Display label */
	label: string;
	/** Control type */
	type: "toggle" | "select" | "slider" | "number";
	/** Current value */
	value: boolean | string | number;
	/** For select: available options */
	options?: Array<{ label: string; value: string }>;
	/** For slider/number: min/max */
	min?: number;
	max?: number;
	step?: number;
	/** Change handler */
	onChange: (value: boolean | string | number) => void;
}

/**
 * Global playground API exposed on window
 */
export interface PlaygroundAPI {
	getSeed: () => string;
	setSeed: (value: string) => void;
	getState: () => Record<string, unknown>;
	getFps: () => number;
	getScene: () => import("@babylonjs/core").Scene | null;
	listControls: () => string[];
	getControl: (name: string) => unknown;
	setControl: (name: string, value: unknown) => void;
}

declare global {
	interface Window {
		playground?: PlaygroundAPI;
	}
}

export interface TestHarnessProps {
	/** Test page title */
	title: string;
	/** Description of what's being tested */
	description: string;
	/** The component(s) being tested */
	children: ReactNode;
	/** Show ground grid (default: true) */
	showGrid?: boolean;
	/** Camera distance (default: 20) */
	cameraDistance?: number;
	/** Camera target (default: origin) */
	cameraTarget?: Vector3;
	/** Background color (default: dark) */
	backgroundColor?: Color4;
	/** Callback when seed changes */
	onSeedChange?: (seed: string) => void;
	/** Initial seed value */
	initialSeed?: string;
	/** Extra controls to render (legacy - use automationControls for programmatic access) */
	controls?: ReactNode;
	/** Automation-friendly controls with programmatic API */
	automationControls?: PlaygroundControl[];
}

/**
 * Grid helper component
 */
function GridHelper({ size = 20, divisions = 20 }: { size?: number; divisions?: number }) {
	const scene = useScene();

	useEffect(() => {
		if (!scene) return;

		const lines: import("@babylonjs/core").LinesMesh[] = [];
		const step = size / divisions;
		const halfSize = size / 2;

		// Create grid lines
		for (let i = 0; i <= divisions; i++) {
			const pos = -halfSize + i * step;
			const opacity = i === divisions / 2 ? 0.5 : 0.15;

			// X-axis lines
			const lineX = MeshBuilder.CreateLines(
				`gridX_${i}`,
				{
					points: [new Vector3(-halfSize, 0, pos), new Vector3(halfSize, 0, pos)],
				},
				scene
			);
			lineX.color = new Color3(0.3, 0.3, 0.3);
			lineX.alpha = opacity;
			lines.push(lineX);

			// Z-axis lines
			const lineZ = MeshBuilder.CreateLines(
				`gridZ_${i}`,
				{
					points: [new Vector3(pos, 0, -halfSize), new Vector3(pos, 0, halfSize)],
				},
				scene
			);
			lineZ.color = new Color3(0.3, 0.3, 0.3);
			lineZ.alpha = opacity;
			lines.push(lineZ);
		}

		return () => {
			for (const line of lines) {
				line.dispose();
			}
		};
	}, [scene, size, divisions]);

	return null;
}

/**
 * Camera setup component
 */
function CameraSetup({
	distance,
	target,
}: {
	distance: number;
	target: Vector3;
}) {
	const scene = useScene();

	useEffect(() => {
		if (!scene) return;

		const camera = new ArcRotateCamera(
			"testCamera",
			Math.PI / 4, // alpha - horizontal rotation
			Math.PI / 3, // beta - vertical angle
			distance,
			target,
			scene
		);

		camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
		camera.lowerRadiusLimit = 2;
		camera.upperRadiusLimit = 100;
		camera.wheelPrecision = 20;
		camera.panningSensibility = 200;

		scene.activeCamera = camera;

		return () => {
			camera.dispose();
		};
	}, [scene, distance, target]);

	return null;
}

/**
 * Flooded World lighting setup - natural lighting, no neon
 * Simulates overcast sky with water reflections
 */
function LightingSetup({ enablePostProcessing = true }: { enablePostProcessing?: boolean }) {
	const scene = useScene();

	useEffect(() => {
		if (!scene) return;

		const disposables: { dispose: () => void }[] = [];

		// Ambient hemisphere light - cool blue sky, warm ground bounce
		const hemi = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
		hemi.intensity = 0.6;
		hemi.diffuse = new Color3(0.7, 0.75, 0.85); // Cool overcast sky
		hemi.groundColor = new Color3(0.15, 0.12, 0.1); // Warm rust/wood bounce
		disposables.push(hemi);

		// Main sun/sky light - slightly warm, represents filtered sunlight
		const sunLight = new DirectionalLight("sunLight", new Vector3(-1, -2, -1), scene);
		sunLight.diffuse = new Color3(1.0, 0.95, 0.85); // Warm daylight
		sunLight.specular = new Color3(0.8, 0.8, 0.75);
		sunLight.intensity = 0.8;
		disposables.push(sunLight);

		// Water reflection fill - subtle blue from below
		const waterReflection = new HemisphericLight("waterFill", new Vector3(0, -1, 0), scene);
		waterReflection.intensity = 0.15;
		waterReflection.diffuse = new Color3(0.3, 0.5, 0.6); // Deep water blue
		waterReflection.groundColor = new Color3(0, 0, 0);
		disposables.push(waterReflection);

		// Post-processing pipeline - subtle, realistic
		if (enablePostProcessing) {
			const setupPipeline = () => {
				if (scene.cameras.length === 0) return;

				const pipeline = new DefaultRenderingPipeline(
					"floodedWorldPipeline",
					true, // HDR
					scene,
					scene.cameras
				);

				// Subtle bloom for highlights (sunlight on water, wet surfaces)
				pipeline.bloomEnabled = true;
				pipeline.bloomThreshold = 0.6;
				pipeline.bloomWeight = 0.3;
				pipeline.bloomKernel = 32;
				pipeline.bloomScale = 0.4;

				// No chromatic aberration - keep it realistic

				// Subtle vignette - weathered view
				pipeline.imageProcessing.vignetteEnabled = true;
				pipeline.imageProcessing.vignetteWeight = 0.8;
				pipeline.imageProcessing.vignetteColor = new Color4(0.05, 0.05, 0.08, 0);
				pipeline.imageProcessing.vignetteStretch = 0.2;

				// FXAA anti-aliasing
				pipeline.fxaaEnabled = true;

				// Tone mapping for HDR - natural look
				pipeline.imageProcessingEnabled = true;
				pipeline.imageProcessing.toneMappingEnabled = true;
				pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
				pipeline.imageProcessing.exposure = 1.0;
				pipeline.imageProcessing.contrast = 1.05;

				// Natural color - no saturation boost
				pipeline.imageProcessing.colorCurvesEnabled = false;

				disposables.push(pipeline);
			};

			if (scene.cameras.length > 0) {
				setupPipeline();
			} else {
				const observer = scene.onNewCameraAddedObservable.addOnce(() => {
					setupPipeline();
				});
				disposables.push({ dispose: () => observer.remove() });
			}
		}

		return () => {
			for (const d of disposables) {
				d.dispose();
			}
		};
	}, [scene, enablePostProcessing]);

	return null;
}

/**
 * Render automation-friendly control with theme support
 */
function AutomationControl({ control, styles }: { control: PlaygroundControl; styles: ReturnType<typeof createThemedStyles> }) {
	const { name, label, type, value, options, min, max, step, onChange } = control;

	if (type === "toggle") {
		return (
			<div style={{ marginBottom: "0.5rem" }}>
				<label style={{ ...styles.muted, display: "block", marginBottom: "0.25rem" }}>
					{label}:
				</label>
				<button
					id={`control-${name}`}
					data-playground-control={name}
					data-control-type="toggle"
					data-control-value={String(value)}
					onClick={() => {
						const newValue = !value;
						console.log(`[PLAYGROUND] Control "${name}" changed: ${value} → ${newValue}`);
						onChange(newValue);
					}}
					style={value ? styles.primaryButton : styles.secondaryButton}
				>
					{value ? "ON" : "OFF"}
				</button>
			</div>
		);
	}

	if (type === "select" && options) {
		return (
			<div style={{ marginBottom: "0.5rem" }}>
				<label style={{ ...styles.muted, display: "block", marginBottom: "0.25rem" }}>
					{label}:
				</label>
				<select
					id={`control-${name}`}
					data-playground-control={name}
					data-control-type="select"
					data-control-value={String(value)}
					value={String(value)}
					onChange={(e) => {
						console.log(`[PLAYGROUND] Control "${name}" changed: ${value} → ${e.target.value}`);
						onChange(e.target.value);
					}}
					style={styles.input}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
		);
	}

	if (type === "slider" || type === "number") {
		return (
			<div style={{ marginBottom: "0.5rem" }}>
				<label style={{ ...styles.muted, display: "block", marginBottom: "0.25rem" }}>
					{label}: <span data-playground-control-display={name}>{value}</span>
				</label>
				<input
					type="range"
					id={`control-${name}`}
					data-playground-control={name}
					data-control-type={type}
					data-control-value={String(value)}
					value={Number(value)}
					min={min ?? 0}
					max={max ?? 100}
					step={step ?? 1}
					onChange={(e) => {
						const newValue = Number(e.target.value);
						console.log(`[PLAYGROUND] Control "${name}" changed: ${value} → ${newValue}`);
						onChange(newValue);
					}}
					style={{
						width: "100%",
						accentColor: styles.primaryButton.background as string,
					}}
				/>
			</div>
		);
	}

	return null;
}

/**
 * Main test harness component with Flooded World design system
 */
export function TestHarness({
	title,
	description,
	children,
	showGrid = true,
	cameraDistance = 20,
	cameraTarget = Vector3.Zero(),
	backgroundColor,
	onSeedChange,
	initialSeed = "test-seed-001",
	controls,
	automationControls = [],
}: TestHarnessProps) {
	const [seed, setSeed] = useState(initialSeed);
	const [fps, setFps] = useState(0);
	const engineRef = useRef<import("@babylonjs/core").AbstractEngine | null>(null);
	const sceneRef = useRef<BabylonScene | null>(null);

	// Use design system theme
	const { colors, mode } = useTheme();
	const styles = createThemedStyles(mode);

	// Compute background color from theme if not provided
	const computedBackgroundColor = backgroundColor ?? new Color4(0.06, 0.08, 0.1, 1); // Dark tidal blue

	// FPS counter
	useEffect(() => {
		const interval = setInterval(() => {
			if (engineRef.current) {
				setFps(Math.round(engineRef.current.getFps()));
			}
		}, 500);
		return () => clearInterval(interval);
	}, []);

	// Expose window.playground API for automation
	useEffect(() => {
		const api: PlaygroundAPI = {
			getSeed: () => seed,
			setSeed: (value: string) => {
				console.log(`[PLAYGROUND] API setSeed: "${seed}" → "${value}"`);
				setSeed(value);
				onSeedChange?.(value);
			},
			getState: () => {
				const state: Record<string, unknown> = {
					seed,
					fps,
					title,
				};
				for (const ctrl of automationControls) {
					state[ctrl.name] = ctrl.value;
				}
				return state;
			},
			getFps: () => fps,
			getScene: () => sceneRef.current,
			listControls: () => automationControls.map((c) => c.name),
			getControl: (name: string) => {
				const ctrl = automationControls.find((c) => c.name === name);
				return ctrl?.value;
			},
			setControl: (name: string, value: unknown) => {
				const ctrl = automationControls.find((c) => c.name === name);
				if (ctrl) {
					console.log(`[PLAYGROUND] API setControl "${name}": ${ctrl.value} → ${value}`);
					ctrl.onChange(value as boolean | string | number);
				} else {
					console.warn(`[PLAYGROUND] Unknown control: ${name}`);
				}
			},
		};

		window.playground = api;
		console.log(`[PLAYGROUND] Initialized: "${title}"`);
		console.log(`[PLAYGROUND] Available controls: ${automationControls.map((c) => c.name).join(", ") || "none"}`);

		return () => {
			delete window.playground;
		};
	}, [seed, fps, title, automationControls, onSeedChange]);

	const handleSeedChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newSeed = e.target.value;
			console.log(`[PLAYGROUND] Seed changed: "${seed}" → "${newSeed}"`);
			setSeed(newSeed);
			onSeedChange?.(newSeed);
		},
		[seed, onSeedChange]
	);

	const handleSceneReady = useCallback((scene: BabylonScene) => {
		scene.clearColor = computedBackgroundColor;
		engineRef.current = scene.getEngine();
		sceneRef.current = scene;
		console.log("[PLAYGROUND] Scene ready");
	}, [computedBackgroundColor]);

	// FPS color based on semantic colors
	const fpsColor = fps > 55 ? colors.success : fps > 30 ? colors.warning : colors.error;

	return (
		<div style={{ width: "100vw", height: "100vh", display: "flex" }}>
			{/* Google Fonts */}
			<link href={typography.googleFontsUrl} rel="stylesheet" />

			{/* Side panel */}
			<div
				style={{
					width: "300px",
					background: colors.background,
					borderRight: `1px solid ${colors.border}`,
					padding: "1rem",
					fontFamily: typography.fonts.body,
					color: colors.text,
					overflow: "auto",
				}}
			>
				<h1 style={{
					...styles.header,
					fontSize: typography.sizes.xl,
					marginBottom: "0.5rem",
				}}>
					{title}
				</h1>
				<p style={{
					...styles.muted,
					marginBottom: "1rem",
				}}>
					{description}
				</p>

				<div style={{ marginBottom: "1rem" }}>
					<label style={{
						...styles.muted,
						display: "block",
						marginBottom: "0.25rem",
						textTransform: "uppercase",
						letterSpacing: "0.05em",
					}}>
						Seed:
					</label>
					<input
						id="playground-seed-input"
						data-playground="seed-input"
						type="text"
						value={seed}
						onChange={handleSeedChange}
						style={{
							...styles.input,
							width: "100%",
							boxSizing: "border-box",
						}}
					/>
				</div>

				<div
					id="playground-fps-display"
					data-playground="fps-display"
					data-fps={fps}
					style={{
						...styles.panel,
						padding: "0.75rem",
						marginBottom: "1rem",
					}}
				>
					<span style={{ fontFamily: typography.fonts.mono }}>
						FPS: <span style={{ color: fpsColor, fontWeight: typography.weights.semibold }}>{fps}</span>
					</span>
				</div>

				{/* Automation-friendly controls */}
				{automationControls.length > 0 && (
					<div style={{ marginTop: "1rem" }} data-playground="controls-panel">
						<h3 style={{
							...styles.header,
							fontSize: typography.sizes.base,
							marginBottom: "0.75rem",
							color: colors.accent,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
						}}>
							Controls
						</h3>
						{automationControls.map((ctrl) => (
							<AutomationControl key={ctrl.name} control={ctrl} styles={styles} />
						))}
					</div>
				)}

				{/* Legacy custom controls (for backward compatibility) */}
				{controls && (
					<div style={{ marginTop: "1rem" }}>
						<h3 style={{
							...styles.header,
							fontSize: typography.sizes.base,
							marginBottom: "0.75rem",
							color: colors.accent,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
						}}>
							Controls
						</h3>
						{controls}
					</div>
				)}

				<div style={{ marginTop: "2rem", ...styles.muted }}>
					<p>Mouse: Orbit camera</p>
					<p>Scroll: Zoom</p>
					<p>Right-click drag: Pan</p>
				</div>

				<a
					href="/"
					style={{
						...styles.accentButton,
						display: "block",
						marginTop: "2rem",
						textDecoration: "none",
						textAlign: "center",
					}}
				>
					← Back to Index
				</a>
			</div>

			{/* Canvas area - use CSS to force full size */}
			<div
				id="canvas-container"
				style={{
					flex: 1,
					width: "100%",
					height: "100%",
					overflow: "hidden",
					position: "relative",
				}}
			>
				<style>{`
					#canvas-container canvas {
						width: 100% !important;
						height: 100% !important;
						display: block !important;
					}
				`}</style>
				<Engine
					engineOptions={{
						antialias: true,
						adaptToDeviceRatio: true,
						preserveDrawingBuffer: true,
					}}
					onEngineReady={(engine) => {
						engineRef.current = engine;
						// Resize to fill container
						window.addEventListener('resize', () => engine.resize());
						// Initial resize after a tick
						setTimeout(() => engine.resize(), 100);
					}}
				>
					<Scene onSceneReady={handleSceneReady}>
						<CameraSetup distance={cameraDistance} target={cameraTarget} />
						<LightingSetup enablePostProcessing={false} />
						{showGrid && <GridHelper />}
						{children}
					</Scene>
				</Engine>
			</div>
		</div>
	);
}

export default TestHarness;
