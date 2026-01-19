/**
 * HeroTest - Test basic character controller
 *
 * Testing:
 * - WASD movement
 * - Jump mechanics
 * - Third-person camera
 * - Ground collision
 * - Movement on platforms/rooftops
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Hero, type HeroControls } from "../components/Hero";
import { Floor } from "../components/Floor";
import { TexturedWall } from "../components/TexturedWall";
import { Water } from "../components/Water";
import { NeonSign } from "../components/NeonSign";
import { Roof } from "../components/Roof";

function HeroTestScene() {
	const [seed, setSeed] = useState("hero-001");
	const [heroPosition, setHeroPosition] = useState(new Vector3(0, 0, 0));
	const [isGrounded, setIsGrounded] = useState(true);
	const heroControlsRef = useRef<HeroControls | null>(null);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const handleHeroMove = useCallback((position: Vector3) => {
		setHeroPosition(position.clone());
	}, []);

	const handleHeroReady = useCallback(
		(_mesh: unknown, controls: HeroControls) => {
			heroControlsRef.current = controls;
			// Update grounded status periodically
			setInterval(() => {
				if (heroControlsRef.current) {
					setIsGrounded(heroControlsRef.current.isGrounded());
				}
			}, 100);
		},
		[],
	);

	const teleportToStart = () => {
		heroControlsRef.current?.moveTo(new Vector3(0, 0, 0));
	};

	const teleportToPlatform = () => {
		heroControlsRef.current?.moveTo(new Vector3(10, 3, 0));
	};

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div
				style={{
					padding: "0.5rem",
					background: "#1a1a2e",
					border: "1px solid #00ff88",
					fontSize: "0.65rem",
				}}
			>
				<div style={{ color: "#00ff88", marginBottom: "0.25rem" }}>
					POSITION:
				</div>
				<div>
					X: {heroPosition.x.toFixed(2)}
					<br />
					Y: {heroPosition.y.toFixed(2)}
					<br />
					Z: {heroPosition.z.toFixed(2)}
				</div>
				<div
					style={{
						marginTop: "0.25rem",
						color: isGrounded ? "#00ff88" : "#ff0088",
					}}
				>
					{isGrounded ? "GROUNDED" : "AIRBORNE"}
				</div>
			</div>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "0.5rem",
					color: "#00aaff",
				}}
			>
				<p>CONTROLS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>WASD / Arrows: Move</li>
					<li>Space: Jump</li>
					<li>Mouse: Orbit camera</li>
					<li>Scroll: Zoom</li>
				</ul>
			</div>

			<button
				onClick={teleportToStart}
				style={{
					marginTop: "0.5rem",
					padding: "0.5rem",
					background: "#00ff88",
					color: "#000",
					border: "none",
					cursor: "pointer",
					fontSize: "0.7rem",
					fontWeight: "bold",
				}}
			>
				TELEPORT: START
			</button>

			<button
				onClick={teleportToPlatform}
				style={{
					padding: "0.5rem",
					background: "#ff0088",
					color: "#fff",
					border: "none",
					cursor: "pointer",
					fontSize: "0.7rem",
					fontWeight: "bold",
				}}
			>
				TELEPORT: PLATFORM
			</button>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#ff0088",
				}}
			>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ WASD movement works</li>
					<li>☐ Jump and gravity work</li>
					<li>☐ Camera follows hero</li>
					<li>☐ Stays on platforms</li>
					<li>☐ Falls off edges</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// HERO CONTROLLER"
			description="Basic character controller. WASD to move, Space to jump, mouse to orbit camera."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={15}
			cameraTarget={new Vector3(0, 2, 0)}
			controls={controls}
		>
			{/* The Hero - with its own camera */}
			<Hero
				id="player"
				position={new Vector3(0, 0, 0)}
				height={1.8}
				radius={0.4}
				speed={6}
				jumpForce={10}
				gravity={25}
				groundLevel={0}
				color={new Color3(0.15, 0.2, 0.3)}
				glowColor={new Color3(0, 1, 0.8)}
				enableCamera={true}
				cameraDistance={10}
				enableControls={true}
				onMove={handleHeroMove}
				onReady={handleHeroReady}
			/>

			{/* Water below */}
			<Water
				id="water"
				position={new Vector3(0, -2, 0)}
				size={{ width: 80, depth: 80 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.6}
				depth={15}
			/>

			{/* Main rooftop platform */}
			<Floor
				id="main_rooftop"
				position={new Vector3(0, 0, 0)}
				size={{ width: 12, depth: 12 }}
				surface="concrete"
				edgeTrim={true}
			/>

			{/* Elevated platform */}
			<Floor
				id="elevated_platform"
				position={new Vector3(10, 3, 0)}
				size={{ width: 6, depth: 6 }}
				surface="metal_grating"
				edgeTrim={true}
			/>

			{/* Ramp connecting platforms */}
			<Floor
				id="ramp"
				position={new Vector3(5, 1.5, 0)}
				size={{ width: 4, depth: 4 }}
				surface="concrete"
			/>

			{/* Second rooftop */}
			<Floor
				id="rooftop_2"
				position={new Vector3(-12, 1, 0)}
				size={{ width: 8, depth: 8 }}
				surface="gravel"
				edgeTrim={true}
			/>

			{/* Jump gap to second rooftop (small platform) */}
			<Floor
				id="stepping_stone"
				position={new Vector3(-7, 0.5, 0)}
				size={{ width: 2, depth: 2 }}
				surface="tile"
			/>

			{/* Buildings for visual context */}
			<TexturedWall
				id="building_1"
				position={new Vector3(0, -4, 8)}
				size={{ width: 12, height: 8, depth: 1 }}
				textureType="concrete_dirty"
				neonAccent={new Color3(1, 0, 0.5)}
			/>

			<TexturedWall
				id="building_2"
				position={new Vector3(-12, -2, 5)}
				size={{ width: 8, height: 6, depth: 1 }}
				textureType="brick_grey"
				neonAccent={new Color3(0, 0.5, 1)}
			/>

			<TexturedWall
				id="building_3"
				position={new Vector3(10, -1, 5)}
				size={{ width: 6, height: 8, depth: 1 }}
				textureType="metal_rusted"
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			{/* Rooftop structures */}
			<Roof
				id="awning"
				position={new Vector3(0, 4, 4)}
				size={{ width: 8, depth: 3, thickness: 0.1 }}
				style="flat"
				edgeGlow={new Color3(1, 0.5, 0)}
				supportBeams={true}
				beamCount={3}
			/>

			<Roof
				id="shed"
				position={new Vector3(-12, 5, -2)}
				size={{ width: 4, depth: 4, thickness: 0.15 }}
				style="industrial"
				equipment={true}
				equipmentDensity={2}
			/>

			{/* Neon signs for atmosphere */}
			<NeonSign
				id="sign_1"
				position={new Vector3(-3, 3.5, 7.5)}
				color={new Color3(1, 0, 0.5)}
				shape="rectangle"
				size={{ width: 2, height: 1.2 }}
				mount="wall"
			/>

			<NeonSign
				id="sign_2"
				position={new Vector3(3, 4, 7.5)}
				color={new Color3(0, 1, 0.8)}
				shape="circle"
				size={{ width: 1.5, height: 1.5 }}
				mount="wall"
			/>

			<NeonSign
				id="arrow"
				position={new Vector3(5, 2.5, 0)}
				color={new Color3(1, 0.8, 0)}
				shape="arrow"
				size={{ width: 1.5, height: 0.8 }}
				mount="pole"
			/>

			{/* Edge markers */}
			<NeonSign
				id="edge_1"
				position={new Vector3(6, 0.1, 0)}
				color={new Color3(1, 0, 0)}
				shape="bar"
				size={{ width: 12, height: 0.1 }}
				mount="ground"
			/>

			<NeonSign
				id="edge_2"
				position={new Vector3(-6, 0.1, 0)}
				color={new Color3(1, 0, 0)}
				shape="bar"
				size={{ width: 12, height: 0.1 }}
				rotation={Math.PI / 2}
				mount="ground"
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<HeroTestScene />);
