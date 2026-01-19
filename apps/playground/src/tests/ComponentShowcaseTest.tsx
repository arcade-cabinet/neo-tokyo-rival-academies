/**
 * ComponentShowcaseTest - Visual verification of all 100+ playground components
 *
 * Renders every component type in a grid layout for visual inspection.
 * Use Chrome DevTools and MCP to verify each component renders correctly.
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";

// Import ALL components for verification
import { Floor } from "../components/Floor";
import { Water } from "../components/Water";

// Structural
import { Stairs } from "../components/Stairs";
import { Ramp } from "../components/Ramp";
import { Door } from "../components/Door";
import { Window } from "../components/Window";
import { Balcony } from "../components/Balcony";
import { Pillar } from "../components/Pillar";
import { Railing } from "../components/Railing";
import { Awning } from "../components/Awning";
import { Fence } from "../components/Fence";
import { Ladder } from "../components/Ladder";
import { FireEscape } from "../components/FireEscape";
import { Catwalk } from "../components/Catwalk";
import { Scaffolding } from "../components/Scaffolding";
import { Gutter } from "../components/Gutter";
import { Shutter } from "../components/Shutter";
import { Chimney } from "../components/Chimney";
import { Skylight } from "../components/Skylight";

// Water & Flooded
import { FloatingPlatform } from "../components/FloatingPlatform";
import { Houseboat } from "../components/Houseboat";
import { Bridge } from "../components/Bridge";
import { Canal } from "../components/Canal";
import { Boat } from "../components/Boat";
import { Buoy } from "../components/Buoy";
import { Puddle } from "../components/Puddle";
import { RainCollector } from "../components/RainCollector";
import { FishingNet } from "../components/FishingNet";
import { Anchor } from "../components/Anchor";

// Transport
import { Bicycle } from "../components/Bicycle";
import { BicycleRack } from "../components/BicycleRack";
import { Carcass } from "../components/Carcass";

// Signage & Lighting
import { NeonSign } from "../components/NeonSign";
import { StreetLight } from "../components/StreetLight";
import { Billboard } from "../components/Billboard";
import { Poster } from "../components/Poster";
import { TrafficSign } from "../components/TrafficSign";
import { Signpost } from "../components/Signpost";
import { Lamppost } from "../components/Lamppost";
import { Graffiti } from "../components/Graffiti";
import { Lantern } from "../components/Lantern";
import { Flagpole } from "../components/Flagpole";

// Urban Furniture
import { VendingMachine } from "../components/VendingMachine";
import { Bench } from "../components/Bench";
import { TrashCan } from "../components/TrashCan";
import { Mailbox } from "../components/Mailbox";
import { Planter } from "../components/Planter";
import { PhoneBooth } from "../components/PhoneBooth";
import { FireHydrant } from "../components/FireHydrant";
import { ParkingMeter } from "../components/ParkingMeter";
import { BollardPost } from "../components/BollardPost";
import { Manhole } from "../components/Manhole";
import { DrainGrate } from "../components/DrainGrate";
import { ShoppingCart } from "../components/ShoppingCart";
import { Umbrella } from "../components/Umbrella";
import { Newspaper } from "../components/Newspaper";

// Utilities & Infrastructure
import { Pipe } from "../components/Pipe";
import { ACUnit } from "../components/ACUnit";
import { AirConditioner } from "../components/AirConditioner";
import { PowerLine } from "../components/PowerLine";
import { Antenna } from "../components/Antenna";
import { SatelliteDish } from "../components/SatelliteDish";
import { WaterTank } from "../components/WaterTank";
import { StorageTank } from "../components/StorageTank";
import { Generator } from "../components/Generator";
import { Dumpster } from "../components/Dumpster";
import { Elevator } from "../components/Elevator";
import { Vent } from "../components/Vent";
import { SolarPanel } from "../components/SolarPanel";
import { CoolingTower } from "../components/CoolingTower";
import { HeliPad } from "../components/HeliPad";
import { Rope } from "../components/Rope";

// Vegetation
import { Tree } from "../components/Tree";
import { Shrub } from "../components/Shrub";
import { GrassClump } from "../components/GrassClump";
import { Vine } from "../components/Vine";
import { Mushroom } from "../components/Mushroom";
import { FlowerBed } from "../components/FlowerBed";

// Props & Clutter
import { Crate } from "../components/Crate";
import { CrateStack } from "../components/CrateStack";
import { Barrel } from "../components/Barrel";
import { Debris } from "../components/Debris";
import { PalletStack } from "../components/PalletStack";
import { Tarp } from "../components/Tarp";
import { Tarpaulin } from "../components/Tarpaulin";
import { Clothesline } from "../components/Clothesline";
import { TentStructure } from "../components/TentStructure";

// Atmospheric
import { SteamVent } from "../components/SteamVent";
import { Fog } from "../components/Fog";

function ComponentShowcaseTestScene() {
	const [seed, setSeed] = useState("showcase-001");
	const [currentPage, setCurrentPage] = useState(0);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	// Grid layout helper - components are placed in a grid
	const gridSpacing = 6;
	const gridCols = 8;

	const gridPos = (index: number, yOffset = 0) => {
		const row = Math.floor(index / gridCols);
		const col = index % gridCols;
		return new Vector3(
			(col - gridCols / 2) * gridSpacing,
			yOffset,
			row * gridSpacing
		);
	};

	// Component categories for pagination
	const pages = [
		"Structural",
		"Water & Maritime",
		"Urban Furniture",
		"Infrastructure",
		"Vegetation & Props",
		"Signage & Lighting"
	];

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
					COMPONENT SHOWCASE
				</div>
				<div style={{ color: "#aaa" }}>
					Visual verification of all 100+ components
				</div>
			</div>

			<div style={{ marginTop: "0.5rem" }}>
				<div style={{ fontSize: "0.7rem", marginBottom: "0.25rem", color: "#ff0088" }}>
					CATEGORY: {pages[currentPage]}
				</div>
				<div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
					{pages.map((page, i) => (
						<button
							key={page}
							onClick={() => setCurrentPage(i)}
							style={{
								padding: "0.25rem 0.5rem",
								background: currentPage === i ? "#00ff88" : "#333",
								color: currentPage === i ? "#000" : "#aaa",
								border: "none",
								cursor: "pointer",
								fontSize: "0.6rem",
							}}
						>
							{page}
						</button>
					))}
				</div>
			</div>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#00aaff",
				}}
			>
				<p>VERIFICATION TIPS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Check console for errors</li>
					<li>Verify meshes render</li>
					<li>Check material appearance</li>
					<li>Orbit camera to inspect</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// COMPONENT SHOWCASE"
			description={`Viewing: ${pages[currentPage]} components - Seed: ${seed}`}
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={40}
			cameraTarget={new Vector3(0, 2, 15)}
			controls={controls}
		>
			{/* Ground plane */}
			<Floor
				id="ground"
				position={new Vector3(0, -0.1, 20)}
				size={{ width: 60, depth: 50 }}
				surface="concrete"
			/>

			{/* Water for water components */}
			{currentPage === 1 && (
				<Water
					id="showcase_water"
					position={new Vector3(0, -0.5, 20)}
					size={{ width: 60, depth: 50 }}
					color={new Color3(0.02, 0.05, 0.1)}
					opacity={0.85}
				/>
			)}

			{/* ========== PAGE 0: STRUCTURAL ========== */}
			{currentPage === 0 && (
				<>
					<Stairs id="stairs_1" position={gridPos(0)} type="straight" material="concrete" width={2} height={2} steps={8} seed={seedNumber} />
					<Stairs id="stairs_2" position={gridPos(1)} type="spiral" material="metal" width={2} height={3} steps={12} seed={seedNumber+1} />
					<Ramp id="ramp_1" position={gridPos(2)} style="straight" material="concrete" width={2} length={4} height={1} seed={seedNumber+2} />
					<Door id="door_1" position={gridPos(3, 1)} type="single" material="wood" state="closed" seed={seedNumber+3} />
					<Door id="door_2" position={gridPos(4, 1)} type="sliding" material="metal" state="open" seed={seedNumber+4} />
					<Window id="window_1" position={gridPos(5, 1.5)} type="single" state="closed" seed={seedNumber+5} />
					<Window id="window_2" position={gridPos(6, 1.5)} type="broken" state="open" seed={seedNumber+6} />
					<Balcony id="balcony_1" position={gridPos(7, 2)} type="simple" material="concrete" width={3} depth={1.5} seed={seedNumber+7} />
					<Pillar id="pillar_1" position={gridPos(8)} shape="round" material="concrete" height={4} diameter={0.5} seed={seedNumber+8} />
					<Pillar id="pillar_2" position={gridPos(9)} shape="square" material="stone" height={3} diameter={0.6} seed={seedNumber+9} />
					<Railing id="railing_1" position={gridPos(10)} style="metal" length={4} height={1} seed={seedNumber+10} />
					<Awning id="awning_1" position={gridPos(11, 2.5)} style="fabric" width={3} depth={1.5} seed={seedNumber+11} />
					<Fence id="fence_1" position={gridPos(12)} style="chain_link" length={4} height={2} seed={seedNumber+12} />
					<Ladder id="ladder_1" position={gridPos(13)} type="fixed" material="metal" height={4} seed={seedNumber+13} />
					<FireEscape id="fireescape_1" position={gridPos(14)} style="zigzag" floors={3} seed={seedNumber+14} />
					<Catwalk id="catwalk_1" position={gridPos(15, 3)} style="industrial" length={5} seed={seedNumber+15} />
					<Scaffolding id="scaffolding_1" position={gridPos(16)} type="frame" levels={2} seed={seedNumber+16} />
					<Gutter id="gutter_1" position={gridPos(17, 3)} type="half_round" length={4} seed={seedNumber+17} />
					<Shutter id="shutter_1" position={gridPos(18, 1.5)} type="louvered" state="closed" seed={seedNumber+18} />
					<Chimney id="chimney_1" position={gridPos(19)} type="brick" height={3} seed={seedNumber+19} />
					<Skylight id="skylight_1" position={gridPos(20, 0.1)} type="dome" size={2} seed={seedNumber+20} />
				</>
			)}

			{/* ========== PAGE 1: WATER & MARITIME ========== */}
			{currentPage === 1 && (
				<>
					<FloatingPlatform id="floatplat_1" position={gridPos(0, 0)} type="wooden" size={3} seed={seedNumber} />
					<FloatingPlatform id="floatplat_2" position={gridPos(1, 0)} type="plastic" size={2.5} seed={seedNumber+1} />
					<Houseboat id="houseboat_1" position={gridPos(2, 0)} type="traditional" condition={0.8} seed={seedNumber+2} />
					<Houseboat id="houseboat_2" position={gridPos(3, 0)} type="modern" condition={0.6} seed={seedNumber+3} />
					<Bridge id="bridge_1" position={gridPos(4, 1)} type="wooden" length={5} seed={seedNumber+4} />
					<Canal id="canal_1" position={gridPos(5)} type="stone" length={5} width={2} seed={seedNumber+5} />
					<Boat id="boat_1" position={gridPos(6, 0)} type="rowboat" state="floating" seed={seedNumber+6} />
					<Boat id="boat_2" position={gridPos(7, 0)} type="kayak" state="floating" seed={seedNumber+7} />
					<Boat id="boat_3" position={gridPos(8, 0)} type="sampan" state="beached" seed={seedNumber+8} />
					<Buoy id="buoy_1" position={gridPos(9, 0)} type="marker" seed={seedNumber+9} />
					<Buoy id="buoy_2" position={gridPos(10, 0)} type="channel" hasLight={true} seed={seedNumber+10} />
					<Puddle id="puddle_1" position={gridPos(11, 0.01)} type="rain" size={2} seed={seedNumber+11} />
					<RainCollector id="raincoll_1" position={gridPos(12)} type="barrel" seed={seedNumber+12} />
					<RainCollector id="raincoll_2" position={gridPos(13)} type="tarp" seed={seedNumber+13} />
					<FishingNet id="fishnet_1" position={gridPos(14, 1)} type="cast" size={2} seed={seedNumber+14} />
					<FishingNet id="fishnet_2" position={gridPos(15, 0)} type="trap" size={1.5} seed={seedNumber+15} />
					<Anchor id="anchor_1" position={gridPos(16)} type="traditional" size={1} seed={seedNumber+16} />
					<Anchor id="anchor_2" position={gridPos(17)} type="mushroom" size={0.8} seed={seedNumber+17} />
				</>
			)}

			{/* ========== PAGE 2: URBAN FURNITURE ========== */}
			{currentPage === 2 && (
				<>
					<VendingMachine id="vending_1" position={gridPos(0)} type="drink" seed={seedNumber} />
					<VendingMachine id="vending_2" position={gridPos(1)} type="snack" seed={seedNumber+1} />
					<Bench id="bench_1" position={gridPos(2)} style="park" seed={seedNumber+2} />
					<Bench id="bench_2" position={gridPos(3)} style="modern" condition="weathered" seed={seedNumber+3} />
					<TrashCan id="trash_1" position={gridPos(4)} style="municipal" seed={seedNumber+4} />
					<TrashCan id="trash_2" position={gridPos(5)} style="bin" condition="damaged" seed={seedNumber+5} />
					<Mailbox id="mailbox_1" position={gridPos(6)} type="post" seed={seedNumber+6} />
					<Mailbox id="mailbox_2" position={gridPos(7)} type="wall" seed={seedNumber+7} />
					<Planter id="planter_1" position={gridPos(8)} style="rectangular" seed={seedNumber+8} />
					<PhoneBooth id="phone_1" position={gridPos(9)} type="classic" condition={0.6} seed={seedNumber+9} />
					<PhoneBooth id="phone_2" position={gridPos(10)} type="modern" condition={0.9} seed={seedNumber+10} />
					<FireHydrant id="hydrant_1" position={gridPos(11)} type="standard" seed={seedNumber+11} />
					<FireHydrant id="hydrant_2" position={gridPos(12)} type="flush" seed={seedNumber+12} />
					<ParkingMeter id="meter_1" position={gridPos(13)} type="single" seed={seedNumber+13} />
					<ParkingMeter id="meter_2" position={gridPos(14)} type="digital" state="expired" seed={seedNumber+14} />
					<BollardPost id="bollard_1" position={gridPos(15)} type="steel" seed={seedNumber+15} />
					<BollardPost id="bollard_2" position={gridPos(16)} type="concrete" seed={seedNumber+16} />
					<Manhole id="manhole_1" position={gridPos(17, 0.01)} type="round" state="closed" seed={seedNumber+17} />
					<Manhole id="manhole_2" position={gridPos(18, 0.01)} type="square" state="open" seed={seedNumber+18} />
					<DrainGrate id="drain_1" position={gridPos(19, 0.01)} type="linear" seed={seedNumber+19} />
					<ShoppingCart id="cart_1" position={gridPos(20)} state="abandoned" seed={seedNumber+20} />
					<Umbrella id="umbrella_1" position={gridPos(21)} type="patio" state="open" seed={seedNumber+21} />
					<Newspaper id="news_1" position={gridPos(22)} type="stack" state="scattered" seed={seedNumber+22} />
				</>
			)}

			{/* ========== PAGE 3: INFRASTRUCTURE ========== */}
			{currentPage === 3 && (
				<>
					<Pipe id="pipe_1" position={gridPos(0, 1)} material="metal" size="large" length={4} seed={seedNumber} />
					<Pipe id="pipe_2" position={gridPos(1, 0.5)} material="pvc" size="medium" length={3} seed={seedNumber+1} />
					<ACUnit id="acunit_1" position={gridPos(2)} size="large" seed={seedNumber+2} />
					<AirConditioner id="aircond_1" position={gridPos(3, 2)} type="window" isRunning={true} seed={seedNumber+3} />
					<AirConditioner id="aircond_2" position={gridPos(4, 1)} type="split" seed={seedNumber+4} />
					<PowerLine id="powerline_1" position={gridPos(5, 4)} type="utility" length={5} seed={seedNumber+5} />
					<Antenna id="antenna_1" position={gridPos(6)} type="tv" seed={seedNumber+6} />
					<Antenna id="antenna_2" position={gridPos(7)} type="satellite" seed={seedNumber+7} />
					<SatelliteDish id="satdish_1" position={gridPos(8)} type="residential" seed={seedNumber+8} />
					<SatelliteDish id="satdish_2" position={gridPos(9)} type="commercial" seed={seedNumber+9} />
					<WaterTank id="watertank_1" position={gridPos(10)} type="rooftop" seed={seedNumber+10} />
					<StorageTank id="storage_1" position={gridPos(11)} type="cylindrical" content="water" seed={seedNumber+11} />
					<Generator id="gen_1" position={gridPos(12)} type="diesel" seed={seedNumber+12} />
					<Generator id="gen_2" position={gridPos(13)} type="portable" seed={seedNumber+13} />
					<Dumpster id="dumpster_1" position={gridPos(14)} type="commercial" condition="rusted" seed={seedNumber+14} />
					<Elevator id="elevator_1" position={gridPos(15)} type="freight" state="closed" seed={seedNumber+15} />
					<Vent id="vent_1" position={gridPos(16)} type="exhaust" state="running" seed={seedNumber+16} />
					<Vent id="vent_2" position={gridPos(17)} type="intake" seed={seedNumber+17} />
					<SolarPanel id="solar_1" position={gridPos(18, 0.1)} type="residential" seed={seedNumber+18} />
					<SolarPanel id="solar_2" position={gridPos(19, 0.1)} type="commercial" seed={seedNumber+19} />
					<CoolingTower id="cooling_1" position={gridPos(20)} type="evaporative" seed={seedNumber+20} />
					<HeliPad id="helipad_1" position={gridPos(21, 0.1)} type="corporate" diameter={8} seed={seedNumber+21} />
					<Rope id="rope_1" position={gridPos(22, 2)} type="hemp" length={3} seed={seedNumber+22} />
				</>
			)}

			{/* ========== PAGE 4: VEGETATION & PROPS ========== */}
			{currentPage === 4 && (
				<>
					<Tree id="tree_1" position={gridPos(0)} type="deciduous" size="medium" seed={seedNumber} />
					<Tree id="tree_2" position={gridPos(1)} type="palm" size="large" seed={seedNumber+1} />
					<Shrub id="shrub_1" position={gridPos(2)} type="boxwood" size="medium" seed={seedNumber+2} />
					<Shrub id="shrub_2" position={gridPos(3)} type="flowering" size="small" seed={seedNumber+3} />
					<GrassClump id="grass_1" position={gridPos(4)} type="wild" size="medium" seed={seedNumber+4} />
					<GrassClump id="grass_2" position={gridPos(5)} type="ornamental" size="large" seed={seedNumber+5} />
					<Vine id="vine_1" position={gridPos(6, 2)} type="ivy" growth="mature" seed={seedNumber+6} />
					<Mushroom id="mush_1" position={gridPos(7)} type="cluster" seed={seedNumber+7} />
					<Mushroom id="mush_2" position={gridPos(8)} type="giant" state="glowing" seed={seedNumber+8} />
					<FlowerBed id="flower_1" position={gridPos(9)} type="rectangular" seed={seedNumber+9} />
					<Crate id="crate_1" position={gridPos(10)} type="wooden" size="medium" seed={seedNumber+10} />
					<Crate id="crate_2" position={gridPos(11)} type="plastic" size="small" seed={seedNumber+11} />
					<CrateStack id="cratestack_1" position={gridPos(12)} type="mixed" seed={seedNumber+12} />
					<Barrel id="barrel_1" position={gridPos(13)} type="metal" content="oil" seed={seedNumber+13} />
					<Barrel id="barrel_2" position={gridPos(14)} type="plastic" content="water" seed={seedNumber+14} />
					<Debris id="debris_1" position={gridPos(15)} type="rubble" size="medium" seed={seedNumber+15} />
					<Debris id="debris_2" position={gridPos(16)} type="trash" size="large" seed={seedNumber+16} />
					<PalletStack id="pallet_1" position={gridPos(17)} type="wooden" seed={seedNumber+17} />
					<Tarp id="tarp_1" position={gridPos(18)} type="flat" state="draped" seed={seedNumber+18} />
					<Tarpaulin id="tarpaulin_1" position={gridPos(19)} color="blue" state="covering" seed={seedNumber+19} />
					<Clothesline id="clothesline_1" position={gridPos(20, 2)} type="residential" length={4} itemCount={5} seed={seedNumber+20} />
					<TentStructure id="tent_1" position={gridPos(21)} type="camping" size={2} seed={seedNumber+21} />
					<TentStructure id="tent_2" position={gridPos(22)} type="refugee" size={2.5} color="tan" seed={seedNumber+22} />
				</>
			)}

			{/* ========== PAGE 5: SIGNAGE & LIGHTING ========== */}
			{currentPage === 5 && (
				<>
					<NeonSign id="neon_1" position={gridPos(0, 2)} color={new Color3(1, 0, 0.5)} shape="rectangle" size={{ width: 2, height: 1 }} />
					<NeonSign id="neon_2" position={gridPos(1, 2)} color={new Color3(0, 1, 0.8)} shape="circle" size={{ width: 1.5, height: 1.5 }} />
					<StreetLight id="streetlight_1" position={gridPos(2)} style="modern" state="on" seed={seedNumber+2} />
					<StreetLight id="streetlight_2" position={gridPos(3)} style="vintage" state="flickering" seed={seedNumber+3} />
					<Billboard id="billboard_1" position={gridPos(4, 3)} type="rooftop" size="large" seed={seedNumber+4} />
					<Billboard id="billboard_2" position={gridPos(5, 2)} type="street" size="medium" seed={seedNumber+5} />
					<Poster id="poster_1" position={gridPos(6, 1.5)} type="movie" condition="torn" seed={seedNumber+6} />
					<Poster id="poster_2" position={gridPos(7, 1.5)} type="advertisement" condition="faded" seed={seedNumber+7} />
					<TrafficSign id="traffic_1" position={gridPos(8)} type="stop" seed={seedNumber+8} />
					<TrafficSign id="traffic_2" position={gridPos(9)} type="warning" condition="damaged" seed={seedNumber+9} />
					<Signpost id="signpost_1" position={gridPos(10)} type="directional" seed={seedNumber+10} />
					<Signpost id="signpost_2" position={gridPos(11)} type="street" seed={seedNumber+11} />
					<Lamppost id="lamppost_1" position={gridPos(12)} style="classic" seed={seedNumber+12} />
					<Lamppost id="lamppost_2" position={gridPos(13)} style="industrial" seed={seedNumber+13} />
					<Graffiti id="graffiti_1" position={gridPos(14, 1.5)} style="tag" size="medium" seed={seedNumber+14} />
					<Graffiti id="graffiti_2" position={gridPos(15, 1.5)} style="mural" size="large" seed={seedNumber+15} />
					<Lantern id="lantern_1" position={gridPos(16, 2)} type="paper" color="red" isLit={true} seed={seedNumber+16} />
					<Lantern id="lantern_2" position={gridPos(17, 0.5)} type="stone" isLit={true} seed={seedNumber+17} />
					<Lantern id="lantern_3" position={gridPos(18, 2)} type="festival" color="yellow" isLit={true} seed={seedNumber+18} />
					<Flagpole id="flagpole_1" position={gridPos(19)} type="national" height={5} flagColor="red" seed={seedNumber+19} />
					<Flagpole id="flagpole_2" position={gridPos(20)} type="banner" height={4} flagColor="blue" seed={seedNumber+20} />
					<SteamVent id="steam_1" position={gridPos(21)} type="grate" seed={seedNumber+21} />
					<Fog id="fog_1" position={gridPos(22, 0.5)} type="ground" density="medium" seed={seedNumber+22} />
				</>
			)}
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<ComponentShowcaseTestScene />);
