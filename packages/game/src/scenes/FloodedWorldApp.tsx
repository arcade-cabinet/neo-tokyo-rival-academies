/**
 * FloodedWorldApp - ALPHA Entry Point
 *
 * State machine: Menu → Game → (Exit back to Menu)
 */

import { useCallback, useState } from "react";
import type { SeedPhrase } from "@neo-tokyo/diorama";
import { FloodedWorldMenu } from "../components/react/ui/FloodedWorldMenu";
import { FloodedWorldScene } from "./FloodedWorldScene";

type AppState = "menu" | "playing";

export function FloodedWorldApp() {
	const [appState, setAppState] = useState<AppState>("menu");
	const [currentSeed, setCurrentSeed] = useState<SeedPhrase | null>(null);

	const handleStartGame = useCallback((seedPhrase: SeedPhrase) => {
		setCurrentSeed(seedPhrase);
		setAppState("playing");
	}, []);

	const handleExitGame = useCallback(() => {
		setAppState("menu");
	}, []);

	if (appState === "menu") {
		return <FloodedWorldMenu onStartGame={handleStartGame} />;
	}

	if (appState === "playing" && currentSeed) {
		return (
			<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
				{/* Seed display overlay */}
				<div
					style={{
						position: "absolute",
						top: 16,
						left: 16,
						padding: "8px 16px",
						background: "rgba(0, 0, 0, 0.7)",
						color: "#00d4ff",
						fontFamily: "'Courier New', monospace",
						fontSize: "14px",
						borderRadius: 4,
						zIndex: 100,
						letterSpacing: "0.1em",
					}}
				>
					SEED: {currentSeed}
				</div>

				{/* Exit button */}
				<button
					type="button"
					onClick={handleExitGame}
					style={{
						position: "absolute",
						top: 16,
						right: 16,
						padding: "8px 16px",
						background: "rgba(100, 0, 0, 0.7)",
						color: "#fff",
						fontFamily: "'Courier New', monospace",
						fontSize: "12px",
						border: "1px solid rgba(255, 100, 100, 0.5)",
						borderRadius: 4,
						cursor: "pointer",
						zIndex: 100,
						textTransform: "uppercase",
						letterSpacing: "0.1em",
					}}
				>
					Exit
				</button>

				{/* 3D Scene would be rendered here via Reactylon */}
				<FloodedWorldScene seedPhrase={currentSeed} onExit={handleExitGame} />
			</div>
		);
	}

	return null;
}

export default FloodedWorldApp;
