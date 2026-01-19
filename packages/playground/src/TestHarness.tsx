/**
 * TestHarness - Reusable test environment for isolated component testing
 *
 * Provides:
 * - Babylon scene with camera controls
 * - Orbit camera for inspection
 * - Grid helper for spatial reference
 * - Info panel showing component state
 * - Seed input for procedural testing
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
	PointLight,
	MeshBuilder,
	Vector3,
	type Scene as BabylonScene,
	DefaultRenderingPipeline,
	ImageProcessingConfiguration,
} from "@babylonjs/core";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Scene, useScene } from "reactylon";
import { Engine } from "reactylon/web";

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
	/** Extra controls to render */
	controls?: ReactNode;
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
 * Cyberpunk lighting setup - colored accent lights + post-processing
 */
function LightingSetup({ enableBloom = true }: { enableBloom?: boolean }) {
	const scene = useScene();

	useEffect(() => {
		if (!scene) return;

		const disposables: { dispose: () => void }[] = [];

		// Ambient hemisphere light - low intensity, dark blue ground
		const hemi = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
		hemi.intensity = 0.4;
		hemi.diffuse = new Color3(0.6, 0.6, 0.7);
		hemi.groundColor = new Color3(0.05, 0.05, 0.1);
		disposables.push(hemi);

		// Cyberpunk colored accent lights
		// Cyan/teal accent from one side
		const cyanLight = new PointLight("cyanLight", new Vector3(-10, 8, -5), scene);
		cyanLight.diffuse = new Color3(0, 0.8, 1);
		cyanLight.specular = new Color3(0, 0.5, 0.8);
		cyanLight.intensity = 0.6;
		cyanLight.range = 30;
		disposables.push(cyanLight);

		// Magenta/pink accent from opposite side
		const magentaLight = new PointLight("magentaLight", new Vector3(10, 6, 5), scene);
		magentaLight.diffuse = new Color3(1, 0, 0.6);
		magentaLight.specular = new Color3(0.8, 0, 0.4);
		magentaLight.intensity = 0.5;
		magentaLight.range = 25;
		disposables.push(magentaLight);

		// Green accent from below/street level
		const greenLight = new PointLight("greenLight", new Vector3(0, 1, 8), scene);
		greenLight.diffuse = new Color3(0, 1, 0.5);
		greenLight.specular = new Color3(0, 0.6, 0.3);
		greenLight.intensity = 0.3;
		greenLight.range = 20;
		disposables.push(greenLight);

		// Post-processing pipeline - bloom, tone mapping, etc.
		// Wait for camera to be available before creating pipeline
		if (enableBloom) {
			const setupPipeline = () => {
				// Ensure we have at least one camera
				if (scene.cameras.length === 0) return;

				const pipeline = new DefaultRenderingPipeline(
					"cyberpunkPipeline",
					true, // HDR
					scene,
					scene.cameras
				);

				// BLOOM - makes emissive surfaces glow
				pipeline.bloomEnabled = true;
				pipeline.bloomThreshold = 0.3;
				pipeline.bloomWeight = 0.8;
				pipeline.bloomKernel = 64;
				pipeline.bloomScale = 0.6;

				// Chromatic aberration - subtle color fringing for that cyberpunk feel
				pipeline.chromaticAberrationEnabled = true;
				pipeline.chromaticAberration.aberrationAmount = 15;
				pipeline.chromaticAberration.radialIntensity = 0.5;

				// Vignette through image processing
				pipeline.imageProcessing.vignetteEnabled = true;
				pipeline.imageProcessing.vignetteWeight = 1.5;
				pipeline.imageProcessing.vignetteColor = new Color4(0.1, 0, 0.15, 0);
				pipeline.imageProcessing.vignetteStretch = 0;

				// FXAA anti-aliasing
				pipeline.fxaaEnabled = true;

				// Tone mapping for HDR
				pipeline.imageProcessingEnabled = true;
				pipeline.imageProcessing.toneMappingEnabled = true;
				pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
				pipeline.imageProcessing.exposure = 1.1;
				pipeline.imageProcessing.contrast = 1.15;

				// Slight color grading - push toward cyan/magenta
				pipeline.imageProcessing.colorCurvesEnabled = true;
				if (pipeline.imageProcessing.colorCurves) {
					pipeline.imageProcessing.colorCurves.globalSaturation = 1.2;
				}

				disposables.push(pipeline);
			};

			// Try immediately if camera already exists
			if (scene.cameras.length > 0) {
				setupPipeline();
			} else {
				// Otherwise wait for camera to be added
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
	}, [scene, enableBloom]);

	return null;
}

/**
 * Main test harness component
 */
export function TestHarness({
	title,
	description,
	children,
	showGrid = true,
	cameraDistance = 20,
	cameraTarget = Vector3.Zero(),
	backgroundColor = new Color4(0.05, 0.05, 0.08, 1),
	onSeedChange,
	initialSeed = "test-seed-001",
	controls,
}: TestHarnessProps) {
	const [seed, setSeed] = useState(initialSeed);
	const [fps, setFps] = useState(0);
	const engineRef = useRef<import("@babylonjs/core").AbstractEngine | null>(null);

	// FPS counter
	useEffect(() => {
		const interval = setInterval(() => {
			if (engineRef.current) {
				setFps(Math.round(engineRef.current.getFps()));
			}
		}, 500);
		return () => clearInterval(interval);
	}, []);

	const handleSeedChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newSeed = e.target.value;
			setSeed(newSeed);
			onSeedChange?.(newSeed);
		},
		[onSeedChange]
	);

	const handleSceneReady = useCallback((scene: BabylonScene) => {
		scene.clearColor = backgroundColor;
		engineRef.current = scene.getEngine();
	}, [backgroundColor]);

	return (
		<div style={{ width: "100vw", height: "100vh", display: "flex" }}>
			{/* Side panel */}
			<div
				style={{
					width: "300px",
					background: "#0a0a0f",
					borderRight: "1px solid #00ff88",
					padding: "1rem",
					fontFamily: "'Courier New', monospace",
					color: "#00ff88",
					overflow: "auto",
				}}
			>
				<h1 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{title}</h1>
				<p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "1rem" }}>
					{description}
				</p>

				<div style={{ marginBottom: "1rem" }}>
					<label style={{ display: "block", fontSize: "0.7rem", marginBottom: "0.25rem" }}>
						SEED:
					</label>
					<input
						type="text"
						value={seed}
						onChange={handleSeedChange}
						style={{
							width: "100%",
							padding: "0.5rem",
							background: "#1a1a2e",
							border: "1px solid #00ff88",
							color: "#00ff88",
							fontFamily: "inherit",
						}}
					/>
				</div>

				<div
					style={{
						padding: "0.5rem",
						background: "#1a1a2e",
						marginBottom: "1rem",
						fontSize: "0.8rem",
					}}
				>
					FPS: <span style={{ color: fps > 55 ? "#00ff00" : fps > 30 ? "#ffff00" : "#ff0000" }}>{fps}</span>
				</div>

				{/* Custom controls */}
				{controls && (
					<div style={{ marginTop: "1rem" }}>
						<h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#ff0088" }}>
							CONTROLS
						</h3>
						{controls}
					</div>
				)}

				<div style={{ marginTop: "2rem", fontSize: "0.7rem", opacity: 0.5 }}>
					<p>Mouse: Orbit camera</p>
					<p>Scroll: Zoom</p>
					<p>Right-click drag: Pan</p>
				</div>

				<a
					href="/"
					style={{
						display: "block",
						marginTop: "2rem",
						padding: "0.5rem",
						background: "#1a1a2e",
						border: "1px solid #ff0088",
						color: "#ff0088",
						textDecoration: "none",
						textAlign: "center",
					}}
				>
					← Back to Index
				</a>
			</div>

			{/* Canvas area */}
			<div style={{ flex: 1, width: "100%", height: "100%", overflow: "hidden" }}>
				<Engine engineOptions={{ antialias: true, adaptToDeviceRatio: true }}>
					<Scene onSceneReady={handleSceneReady}>
						<CameraSetup distance={cameraDistance} target={cameraTarget} />
						<LightingSetup enableBloom={false} />
						{showGrid && <GridHelper />}
						{children}
					</Scene>
				</Engine>
			</div>
		</div>
	);
}

export default TestHarness;
