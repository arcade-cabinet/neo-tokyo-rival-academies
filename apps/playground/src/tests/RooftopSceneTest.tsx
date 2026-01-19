/**
 * RooftopSceneTest - Full integration demo
 *
 * Combines ALL playground components into a cohesive flooded Neo-Tokyo scene:
 * - Multiple rooftop platforms connected by walkways
 * - Water flooding the lower areas
 * - Platform ferry crossing the main gap
 * - Neon signs and atmospheric farground
 * - Hero controller for exploration
 * - NavMesh for AI pathfinding
 *
 * This is the proof-of-concept for the flooded city world.
 */

import { Color3, Vector3, Path3D } from "@babylonjs/core";
import { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";

// All components
import { Water } from "../components";
import { Floor } from "../components";
import { TexturedWall } from "../components";
import { Roof } from "../components";
import { NeonSign } from "../components";
import { RailPath } from "../components";
import { Platform, type PlatformAnimationControls } from "../components";
import { DockingStation } from "../components";
import { Farground } from "../components";
import { Hero, type HeroControls } from "../components";
import { NavMesh, type NavMeshController, createNavAreasFromFloors } from "../components";

function RooftopSceneTestScene() {
	const [seed, setSeed] = useState("rooftop-scene-001");
	const [showNavDebug, setShowNavDebug] = useState(false);
	const [ferryPathData, setFerryPathData] = useState<Path3D | null>(null);
	const ferryControlsRef = useRef<PlatformAnimationControls | null>(null);
	const heroControlsRef = useRef<HeroControls | null>(null);
	const navMeshRef = useRef<NavMeshController | null>(null);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const handleFerryPathReady = useCallback((path: Path3D) => {
		setFerryPathData(path);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	// Ferry path points - connects the two main platforms across water
	const ferryPathPoints = [
		new Vector3(-8, 0.1, 0),
		new Vector3(8, 0.1, 0),
	];

	// Floor definitions for NavMesh
	const floors = [
		// Main western rooftop
		{ id: "west_main", position: new Vector3(-15, 0, 0), size: { width: 10, depth: 12 } },
		{ id: "west_lower", position: new Vector3(-15, 0, -10), size: { width: 10, depth: 6 } },
		// Bridge to ferry
		{ id: "west_dock", position: new Vector3(-8, 0, 0), size: { width: 3, depth: 4 } },
		// Ferry platform (dynamic - not in navmesh)
		// Eastern rooftop
		{ id: "east_main", position: new Vector3(15, 0, 0), size: { width: 10, depth: 12 } },
		{ id: "east_upper", position: new Vector3(15, 3, 8), size: { width: 8, depth: 6 } },
		// Bridge to ferry
		{ id: "east_dock", position: new Vector3(8, 0, 0), size: { width: 3, depth: 4 } },
		// Stepping stones
		{ id: "stone_1", position: new Vector3(-5, 0, 8), size: { width: 2, depth: 2 } },
		{ id: "stone_2", position: new Vector3(-2, 0, 10), size: { width: 2, depth: 2 } },
	];

	const navAreas = createNavAreasFromFloors(floors, true, 5);

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div
				style={{
					padding: "0.5rem",
					background: "#1a1a2e",
					border: "1px solid #ff0088",
					fontSize: "0.65rem",
				}}
			>
				<div style={{ color: "#ff0088", marginBottom: "0.25rem" }}>
					INTEGRATION DEMO
				</div>
				<div style={{ color: "#aaa" }}>
					All playground components working together
				</div>
			</div>

			<div
				style={{
					fontSize: "0.65rem",
					color: "#00aaff",
					marginTop: "0.5rem",
				}}
			>
				<p>CONTROLS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>WASD / Arrows: Move</li>
					<li>Space: Jump</li>
					<li>Mouse: Orbit camera</li>
				</ul>
			</div>

			<label
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.25rem",
					fontSize: "0.7rem",
				}}
			>
				<input
					type="checkbox"
					checked={showNavDebug}
					onChange={(e) => setShowNavDebug(e.target.checked)}
				/>
				Show NavMesh
			</label>

			<div style={{ marginTop: "0.5rem" }}>
				<div style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>
					FERRY CONTROLS:
				</div>
				<button
					onClick={() => ferryControlsRef.current?.start()}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: "#00ff88",
						color: "#000",
						border: "none",
						cursor: "pointer",
						fontSize: "0.7rem",
						fontWeight: "bold",
						marginBottom: "0.25rem",
					}}
				>
					START FERRY
				</button>
				<button
					onClick={() => ferryControlsRef.current?.stop()}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: "#ff4444",
						color: "#fff",
						border: "none",
						cursor: "pointer",
						fontSize: "0.7rem",
					}}
				>
					STOP
				</button>
			</div>

			<div style={{ marginTop: "0.5rem" }}>
				<div style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>
					TELEPORT:
				</div>
				<button
					onClick={() => heroControlsRef.current?.moveTo(new Vector3(-15, 0, 0))}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: "#ff0088",
						color: "#fff",
						border: "none",
						cursor: "pointer",
						fontSize: "0.7rem",
						marginBottom: "0.25rem",
					}}
				>
					WEST ROOFTOP
				</button>
				<button
					onClick={() => heroControlsRef.current?.moveTo(new Vector3(15, 0, 0))}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: "#00aaff",
						color: "#fff",
						border: "none",
						cursor: "pointer",
						fontSize: "0.7rem",
					}}
				>
					EAST ROOFTOP
				</button>
			</div>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#00ff88",
				}}
			>
				<p>COMPONENTS USED:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Water</li>
					<li>Floor</li>
					<li>TexturedWall</li>
					<li>Roof</li>
					<li>NeonSign</li>
					<li>RailPath</li>
					<li>Platform</li>
					<li>DockingStation</li>
					<li>Farground</li>
					<li>Hero</li>
					<li>NavMesh</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// ROOFTOP SCENE"
			description="Full integration demo - flooded Neo-Tokyo rooftops with ferry crossing."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={30}
			cameraTarget={new Vector3(0, 5, 0)}
			controls={controls}
		>
			{/* ========== WATER & FARGROUND ========== */}

			{/* Flooded water level */}
			<Water
				id="flood_water"
				position={new Vector3(0, -2, 0)}
				size={{ width: 120, depth: 120 }}
				color={new Color3(0.015, 0.04, 0.08)}
				opacity={0.92}
				reflectivity={0.7}
				depth={20}
			/>

			{/* Distant city skyline */}
			<Farground
				id="skyline"
				position={new Vector3(0, 0, 0)}
				width={200}
				distance={80}
				density={10}
				atmosphereColor={new Color3(0.02, 0.025, 0.05)}
				buildingColor={new Color3(0.04, 0.05, 0.08)}
				distantNeon={true}
				seed={seedNumber}
			/>

			{/* Navigation Mesh */}
			<NavMesh
				id="navmesh"
				areas={navAreas}
				cellSize={1}
				debug={showNavDebug}
				debugColor={new Color3(0, 0.5, 0.3)}
				onReady={(nm) => { navMeshRef.current = nm; }}
			/>

			{/* ========== HERO ========== */}

			<Hero
				id="player"
				position={new Vector3(-15, 0, 0)}
				height={1.8}
				radius={0.4}
				speed={6}
				jumpForce={10}
				gravity={25}
				groundLevel={0}
				color={new Color3(0.15, 0.2, 0.3)}
				glowColor={new Color3(0, 1, 0.8)}
				enableCamera={true}
				cameraDistance={12}
				enableControls={true}
				onReady={(_mesh, controls) => { heroControlsRef.current = controls; }}
			/>

			{/* ========== WESTERN DISTRICT ========== */}

			{/* Main rooftop */}
			<Floor
				id="west_main"
				position={new Vector3(-15, 0, 0)}
				size={{ width: 10, depth: 12 }}
				surface="concrete"
				edgeTrim={true}
			/>

			{/* Lower platform */}
			<Floor
				id="west_lower"
				position={new Vector3(-15, 0, -10)}
				size={{ width: 10, depth: 6 }}
				surface="gravel"
				edgeTrim={true}
			/>

			{/* Western building facade */}
			<TexturedWall
				id="west_building"
				position={new Vector3(-15, -5, 7)}
				size={{ width: 10, height: 10, depth: 1 }}
				textureType="concrete_dirty"
			/>

			<TexturedWall
				id="west_side_1"
				position={new Vector3(-20.5, -5, 0)}
				size={{ width: 1, height: 10, depth: 12 }}
				textureType="brick_grey"
			/>

			<TexturedWall
				id="west_side_2"
				position={new Vector3(-9.5, -5, 0)}
				size={{ width: 1, height: 10, depth: 12 }}
				textureType="brick_grey"
			/>

			{/* Rooftop structures - west */}
			<Roof
				id="west_awning"
				position={new Vector3(-17, 3, 4)}
				size={{ width: 4, depth: 2, thickness: 0.1 }}
				style="canopy"
				edgeGlow={new Color3(1, 0.5, 0)}
				supportBeams={true}
				beamCount={2}
			/>

			<Roof
				id="west_shed"
				position={new Vector3(-12, 3, -8)}
				size={{ width: 4, depth: 3, thickness: 0.15 }}
				style="industrial"
				equipment={true}
				equipmentDensity={2}
				seed={seedNumber + 1}
			/>

			{/* Neon signs - west */}
			<NeonSign
				id="west_sign_1"
				position={new Vector3(-15, 5, 6.5)}
				color={new Color3(1, 0, 0.5)}
				shape="rectangle"
				size={{ width: 3, height: 1.5 }}
				mount="wall"
			/>

			<NeonSign
				id="west_sign_2"
				position={new Vector3(-18, 2, 6.5)}
				color={new Color3(0, 1, 0.8)}
				shape="circle"
				size={{ width: 1.2, height: 1.2 }}
				mount="wall"
			/>

			{/* ========== FERRY CROSSING ========== */}

			{/* Western dock */}
			<Floor
				id="west_dock"
				position={new Vector3(-8, 0, 0)}
				size={{ width: 3, depth: 4 }}
				surface="metal_grating"
			/>

			<DockingStation
				id="west_station"
				position={new Vector3(-8, 0, 0)}
				dockType="ferry"
				size={{ width: 3, depth: 4 }}
				neonColor={new Color3(0, 1, 0.5)}
			/>

			{/* Rail path (underwater) */}
			<RailPath
				id="ferry_rail"
				points={ferryPathPoints}
				pathType="linear"
				debug={false}
				onPathReady={handleFerryPathReady}
			/>

			{/* Ferry platform */}
			{ferryPathData && (
				<Platform
					id="ferry"
					position={ferryPathPoints[0]}
					size={{ width: 4, length: 3, height: 0.15 }}
					style="metal"
					railings={true}
					path={ferryPathData}
					travelTime={8}
					autoStart={false}
					pingPong={true}
					neonEdge={new Color3(0, 0.8, 1)}
					onAnimationReady={(controls) => {
						ferryControlsRef.current = controls;
					}}
				/>
			)}

			{/* Eastern dock */}
			<Floor
				id="east_dock"
				position={new Vector3(8, 0, 0)}
				size={{ width: 3, depth: 4 }}
				surface="metal_grating"
			/>

			<DockingStation
				id="east_station"
				position={new Vector3(8, 0, 0)}
				dockType="ferry"
				size={{ width: 3, depth: 4 }}
				neonColor={new Color3(0, 1, 0.5)}
			/>

			{/* ========== EASTERN DISTRICT ========== */}

			{/* Main rooftop */}
			<Floor
				id="east_main"
				position={new Vector3(15, 0, 0)}
				size={{ width: 10, depth: 12 }}
				surface="concrete"
				edgeTrim={true}
			/>

			{/* Upper level */}
			<Floor
				id="east_upper"
				position={new Vector3(15, 3, 8)}
				size={{ width: 8, depth: 6 }}
				surface="tile"
				edgeTrim={true}
			/>

			{/* Eastern building facade */}
			<TexturedWall
				id="east_building"
				position={new Vector3(15, -5, -7)}
				size={{ width: 10, height: 10, depth: 1 }}
				textureType="brick_grey"
			/>

			<TexturedWall
				id="east_side_1"
				position={new Vector3(9.5, -5, 0)}
				size={{ width: 1, height: 10, depth: 12 }}
				textureType="concrete_dirty"
			/>

			<TexturedWall
				id="east_side_2"
				position={new Vector3(20.5, -5, 0)}
				size={{ width: 1, height: 10, depth: 12 }}
				textureType="metal_rusted"
			/>

			{/* Tall building for upper level */}
			<TexturedWall
				id="east_tower"
				position={new Vector3(15, -1, 12)}
				size={{ width: 8, height: 8, depth: 1 }}
				textureType="concrete_dirty"
			/>

			{/* Rooftop structures - east */}
			<Roof
				id="east_skylight"
				position={new Vector3(17, 5, 8)}
				size={{ width: 3, depth: 3, thickness: 0.1 }}
				style="glass"
				edgeGlow={new Color3(0, 0.8, 1)}
			/>

			<Roof
				id="east_overhang"
				position={new Vector3(12, 2.5, -4)}
				size={{ width: 5, depth: 3, thickness: 0.12 }}
				style="flat"
				supportBeams={true}
				edgeTrim={true}
			/>

			{/* Neon signs - east */}
			<NeonSign
				id="east_sign_1"
				position={new Vector3(15, 5, -6.5)}
				color={new Color3(0, 0.8, 1)}
				shape="rectangle"
				size={{ width: 4, height: 2 }}
				mount="wall"
			/>

			<NeonSign
				id="east_arrow"
				position={new Vector3(10, 2, 0)}
				color={new Color3(1, 0.8, 0)}
				shape="arrow"
				size={{ width: 1.5, height: 0.8 }}
				rotation={Math.PI}
				mount="pole"
			/>

			<NeonSign
				id="east_bar"
				position={new Vector3(15, 6, 11.5)}
				color={new Color3(1, 0, 0.5)}
				shape="bar"
				size={{ width: 6, height: 0.1 }}
				mount="wall"
			/>

			{/* ========== STEPPING STONES ========== */}

			<Floor
				id="stone_1"
				position={new Vector3(-5, 0, 8)}
				size={{ width: 2, depth: 2 }}
				surface="concrete"
			/>

			<Floor
				id="stone_2"
				position={new Vector3(-2, 0, 10)}
				size={{ width: 2, depth: 2 }}
				surface="concrete"
			/>

			{/* ========== SUBMERGED HINTS ========== */}

			{/* Partially submerged structures */}
			<TexturedWall
				id="submerged_1"
				position={new Vector3(-3, -4, -8)}
				size={{ width: 5, height: 4, depth: 4 }}
				textureType="concrete_dirty"
			/>

			<TexturedWall
				id="submerged_2"
				position={new Vector3(5, -5, 10)}
				size={{ width: 6, height: 6, depth: 5 }}
				textureType="brick_grey"
			/>

			<NeonSign
				id="submerged_sign"
				position={new Vector3(-3, -1.5, -5.5)}
				color={new Color3(0, 1, 0.5)}
				shape="rectangle"
				size={{ width: 2, height: 1 }}
				mount="wall"
				intensity={1.5}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<RooftopSceneTestScene />);
