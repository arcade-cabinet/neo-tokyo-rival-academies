import type { FC } from "react";
import styles from "./MainMenu.module.css";

interface MainMenuProps {
	onStart: () => void;
}

export const MainMenu: FC<MainMenuProps> = ({ onStart }) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(5, 2, 2, 0.4)", // More transparent to see 3D bg
				zIndex: 20,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				pointerEvents: "auto",
			}}
		>
			<h1
				className={styles["title-glitch"]}
				style={{
					color: "#fff",
					fontSize: "5rem",
					margin: "0 0 20px 0",
					textAlign: "center",
					fontStyle: "italic",
					textShadow: "3px 3px 0px #f00, -3px -3px 0px #500",
					transform: "skewX(-10deg)",
					lineHeight: 0.9,
				}}
			>
				NEO-TOKYO
				<br />
				<span style={{ fontSize: "3rem", color: "#f00" }}>RIVAL ACADEMIES</span>
			</h1>

			<div className={styles["story-text"]}>
				<p style={{ margin: 0 }}>
					&gt; DATE: 2084.11.02
					<br />
					&gt; LOCATION: SECTOR 7 (OLD SHIBUYA)
					<br />
					&gt; MISSION: MIDNIGHT EXAM
					<br />
					<br />
					The rivalry between Kurenai High and Azure Tech has reached boiling
					point. Pass the exam by outrunning the competition while fighting off
					the local Yakuza and Biker Gangs controlling the rooftops.
				</p>
			</div>

			<button type="button" onClick={onStart} className={styles["menu-btn"]}>
				INITIATE STORY MODE
			</button>

			<button
				type="button"
				className={styles["menu-btn"]}
				style={{ opacity: 0.5, cursor: "not-allowed" }}
				disabled
				tabIndex={-1}
				aria-disabled="true"
			>
				ARCHIVES [LOCKED]
			</button>
		</div>
	);
};
