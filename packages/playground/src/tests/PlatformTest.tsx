/**
 * PlatformTest - Test rideable platform component
 *
 * Testing:
 * - Static platforms (bridges, floors)
 * - Animated platforms following rail paths
 * - Different styles (metal, wood, glass, concrete)
 * - Railings and neon edges
 * - Animation controls (start, stop, progress)
 */

import { Color3, Vector3, Path3D } from "@babylonjs/core";
import { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Platform, type PlatformAnimationControls } from "../components/Platform";
import { RailPath, RailPathPresets } from "../components/RailPath";
import { Water } from "../components/Water";
import { TexturedWall } from "../components/TexturedWall";

function PlatformTestScene() {
	const [seed, setSeed] = useState("platform-001");
	const [style, setStyle] = useState<"metal" | "wood" | "glass" | "concrete">("metal");
	const [showRailings, setShowRailings] = useState(true);
	const [showNeon, setShowNeon] = useState(true);
	const [isAnimating, setIsAnimating] = useState(false);

	const animControlsRef = useRef<PlatformAnimationControls | null>(null);
	const [pathData, setPathData] = useState<Path3D | null>(null);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	// Ferry path points
	const ferryPathPoints = RailPathPresets.arc(
		new Vector3(-12, 0.5, 0),
		new Vector3(12, 0.5, 0),
		1.5
	);

	const handlePathReady = useCallback((path: Path3D) => {
		setPathData(path);
	}, []);

	const handleAnimationReady = useCallback((controls: PlatformAnimationControls) => {
		animControlsRef.current = controls;
	}, []);

	const toggleAnimation = () => {
		if (!animControlsRef.current) return;

		if (isAnimating) {
			animControlsRef.current.pause();
		} else {
			animControlsRef.current.start();
		}
		setIsAnimating(!isAnimating);
	};

	const stopAnimation = () => {
		if (!animControlsRef.current) return;
		animControlsRef.current.stop();
		setIsAnimating(false);
	};

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					PLATFORM STYLE:
				</label>
				<select
					value={style}
					onChange={(e) => setStyle(e.target.value as typeof style)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					<option value="metal">Metal</option>
					<option value="wood">Wood</option>
					<option value="glass">Glass</option>
					<option value="concrete">Concrete</option>
				</select>
			</div>

			<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
				<input
					type="checkbox"
					checked={showRailings}
					onChange={(e) => setShowRailings(e.target.checked)}
				/>
				Show Railings
			</label>

			<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
				<input
					type="checkbox"
					checked={showNeon}
					onChange={(e) => setShowNeon(e.target.checked)}
				/>
				Neon Edge Lighting
			</label>

			<div style={{ marginTop: "1rem" }}>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem", color: "#ffff00" }}>
					FERRY CONTROLS:
				</label>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<button
						onClick={toggleAnimation}
						style={{
							flex: 1,
							padding: "0.5rem",
							background: isAnimating ? "#ff4444" : "#00ff88",
							border: "none",
							color: "#000",
							fontFamily: "inherit",
							cursor: "pointer",
						}}
					>
						{isAnimating ? "PAUSE" : "START"}
					</button>
					<button
						onClick={stopAnimation}
						style={{
							flex: 1,
							padding: "0.5rem",
							background: "#666",
							border: "none",
							color: "#fff",
							fontFamily: "inherit",
							cursor: "pointer",
						}}
					>
						RESET
					</button>
				</div>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Platform follows rail path</li>
					<li>☐ Smooth movement</li>
					<li>☐ Railings visible</li>
					<li>☐ Neon glows with bloom</li>
					<li>☐ Start/Stop works</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// PLATFORM"
			description="Rideable platform - static or animated on rail. Test ferry movement, styles, controls."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={30}
			cameraTarget={new Vector3(0, 2, 0)}
			controls={controls}
		>
			{/* Water surface */}
			<Water
				id="water"
				position={new Vector3(0, -0.5, 0)}
				size={{ width: 50, depth: 30 }}
				color={new Color3(0.02, 0.08, 0.15)}
				opacity={0.85}
				reflectivity={0.8}
				depth={8}
			/>

			{/* Rail path (debug visible) */}
			<RailPath
				id="ferry_path"
				points={ferryPathPoints}
				pathType="catmullrom"
				debug={true}
				debugColor={new Color3(1, 1, 0)}
				onPathReady={handlePathReady}
			/>

			{/* Animated ferry platform */}
			{pathData && (
				<Platform
					id="ferry"
					position={ferryPathPoints[0]}
					size={{ width: 4, length: 6, height: 0.2 }}
					style={style}
					railings={showRailings}
					neonEdge={showNeon ? new Color3(0, 1, 0.5) : null}
					path={pathData}
					travelTime={8}
					autoStart={false}
					pingPong={true}
					onAnimationReady={handleAnimationReady}
				/>
			)}

			{/* Dock A - left side */}
			<TexturedWall
				id="dock_a"
				position={new Vector3(-15, -0.5, 0)}
				size={{ width: 6, height: 4, depth: 8 }}
				textureType="concrete_dirty"
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			{/* Static platform at dock A */}
			<Platform
				id="dock_a_platform"
				position={new Vector3(-13, 0.3, 0)}
				size={{ width: 3, length: 5, height: 0.15 }}
				style="concrete"
				railings={false}
				neonEdge={new Color3(0, 0.5, 1)}
			/>

			{/* Dock B - right side */}
			<TexturedWall
				id="dock_b"
				position={new Vector3(15, -0.5, 0)}
				size={{ width: 6, height: 4, depth: 8 }}
				textureType="concrete_dirty"
				neonAccent={new Color3(1, 0, 0.5)}
			/>

			{/* Static platform at dock B */}
			<Platform
				id="dock_b_platform"
				position={new Vector3(13, 0.3, 0)}
				size={{ width: 3, length: 5, height: 0.15 }}
				style="concrete"
				railings={false}
				neonEdge={new Color3(1, 0.3, 0)}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<PlatformTestScene />);
