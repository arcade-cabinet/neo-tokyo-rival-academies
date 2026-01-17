import type { FC } from "react";
import { useEffect, useState } from "react";

interface DialogueLine {
	speaker: string;
	text: string;
	image?: string; // Add image support
}

interface NarrativeOverlayProps {
	script: DialogueLine[];
	onComplete: () => void;
}

export const NarrativeOverlay: FC<NarrativeOverlayProps> = ({
	script,
	onComplete,
}) => {
	const [index, setIndex] = useState(0);
	const [displayText, setDisplayText] = useState("");
	const [charIndex, setCharIndex] = useState(0);

	const currentLine =
		script && script.length > 0
			? script[index]
			: { speaker: "ERROR", text: "Script missing." };

	// Handle empty script or completion
	useEffect(() => {
		if (!script || script.length === 0) {
			onComplete();
		}
	}, [script, onComplete]);

	// Typewriter effect with auto-advance
	useEffect(() => {
		if (!script || script.length === 0) return;

		if (charIndex < currentLine.text.length) {
			// Still typing
			const timeout = setTimeout(() => {
				setDisplayText((prev) => prev + currentLine.text[charIndex]);
				setCharIndex((prev) => prev + 1);
			}, 25); // Faster typing speed
			return () => clearTimeout(timeout);
		} else {
			// Text finished - auto-advance after reading time
			// ~80ms per word for comfortable reading
			const wordCount = currentLine.text.split(" ").length;
			const readingDelay = Math.max(1500, wordCount * 80);

			const autoAdvance = setTimeout(() => {
				if (index < script.length - 1) {
					setIndex(index + 1);
					setDisplayText("");
					setCharIndex(0);
				} else {
					onComplete();
				}
			}, readingDelay);
			return () => clearTimeout(autoAdvance);
		}
	}, [charIndex, currentLine.text, script, index, onComplete]);

	const handleNext = () => {
		if (charIndex < currentLine.text.length) {
			// Instant finish
			setDisplayText(currentLine.text);
			setCharIndex(currentLine.text.length);
		} else {
			if (index < script.length - 1) {
				setIndex(index + 1);
				setDisplayText("");
				setCharIndex(0);
			} else {
				onComplete();
			}
		}
	};

	if (!script || script.length === 0) return null;

	return (
		<button
			type="button"
			onClick={handleNext}
			style={{
				position: "absolute",
				background: "transparent",
				border: "none",
				padding: 0,
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 50,
				cursor: "pointer",
			}}
		>
			{/* Background Image (Narrative Panel) */}
			{currentLine.image && (
				<div
					style={{
						position: "absolute",
						top: "10%",
						left: 0,
						width: "100%",
						height: "80%",
						backgroundImage: `url(${currentLine.image})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						zIndex: -1,
						animation: "pan-zoom 20s linear infinite alternate",
					}}
				/>
			)}

			{/* Skip Button */}
			<div
				onClick={(e) => {
					e.stopPropagation();
					onComplete();
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.stopPropagation();
						onComplete();
					}
				}}
				role="button"
				tabIndex={0}
				style={{
					position: "absolute",
					top: "20px",
					right: "20px",
					padding: "8px 16px",
					background: "rgba(0,0,0,0.7)",
					border: "1px solid #666",
					borderRadius: "4px",
					color: "#aaa",
					fontSize: "0.9rem",
					cursor: "pointer",
					zIndex: 100,
					transition: "all 0.2s ease",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = "rgba(255,0,0,0.3)";
					e.currentTarget.style.borderColor = "#f00";
					e.currentTarget.style.color = "#fff";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = "rgba(0,0,0,0.7)";
					e.currentTarget.style.borderColor = "#666";
					e.currentTarget.style.color = "#aaa";
				}}
			>
				SKIP INTRO &gt;&gt;
			</div>

			{/* Letterbox Bars */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "10%",
					background: "black",
					zIndex: 1,
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					width: "100%",
					height: "10%",
					background: "black",
					zIndex: 1,
				}}
			/>

			{/* Dialogue Box */}
			<div
				style={{
					position: "absolute",
					bottom: "10%",
					left: "50%",
					transform: "translateX(-50%)",
					width: "80%",
					height: "25%",
					background: "rgba(0,0,0,0.8)",
					border: "2px solid #fff",
					display: "flex",
					flexDirection: "column",
					padding: "20px",
					boxSizing: "border-box",
				}}
			>
				<h3
					style={{
						color: currentLine.speaker === "Kai" ? "#f00" : "#0ff",
						margin: "0 0 10px 0",
						fontSize: "1.5rem",
						fontFamily: "sans-serif",
					}}
				>
					{currentLine.speaker}
				</h3>
				<p
					style={{
						color: "#fff",
						fontSize: "1.2rem",
						margin: 0,
						fontFamily: "monospace",
						lineHeight: 1.5,
					}}
				>
					{displayText}
					{charIndex === currentLine.text.length && (
						<span className="blink">_</span>
					)}
				</p>

				<div
					style={{
						position: "absolute",
						bottom: "10px",
						right: "20px",
						color: "#666",
						fontSize: "0.75rem",
					}}
				>
					{charIndex < currentLine.text.length ? "" : `${index + 1} / ${script.length}`}
				</div>
			</div>

			<style>{`
           .blink { animation: blink 1s infinite; }
           @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
           @keyframes pan-zoom {
             0% { transform: scale(1) translate(0, 0); }
             100% { transform: scale(1.1) translate(-2%, -2%); }
           }
       `}</style>
		</button>
	);
};
