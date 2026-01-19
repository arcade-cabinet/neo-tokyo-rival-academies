/**
 * CellTest - Placeholder for cell generation testing
 * TODO: Implement procedural cell generation
 */

import { Vector3 } from "@babylonjs/core";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";

function CellTestScene() {
	return (
		<TestHarness
			title="// CELL GENERATION"
			description="Placeholder - cell generation system not yet implemented."
			cameraDistance={30}
			cameraTarget={new Vector3(0, 5, 0)}
		>
			{/* TODO: Cell generation components */}
		</TestHarness>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<CellTestScene />);
