/**
 * StreamingTest - Placeholder for cell streaming testing
 * TODO: Implement cell streaming/loading system
 */

import { Vector3 } from "@babylonjs/core";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";

function StreamingTestScene() {
	return (
		<TestHarness
			title="// CELL STREAMING"
			description="Placeholder - cell streaming system not yet implemented."
			cameraDistance={30}
			cameraTarget={new Vector3(0, 5, 0)}
		>
			{/* TODO: Cell streaming components */}
		</TestHarness>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<StreamingTestScene />);
