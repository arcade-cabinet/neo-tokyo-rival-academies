/**
 * PlaygroundNotes - Human feedback capture system for playground tests
 *
 * Provides a persistent notes panel for capturing human observations:
 * - Notes persist directly to local filesystem via Chrome File System Access API
 * - Captures context: timestamp, seed, FPS, scene info
 * - Allows tagging notes with severity/type markers
 * - DRY component reusable across all playground tests
 *
 * Usage in any playground test:
 *   <PlaygroundNotes testId="block-test" sceneContext={{ seed, renderMode }} />
 *
 * On first use, click "SET FOLDER" to choose a notes directory (e.g., playground-notes/).
 * Chrome will remember this permission for the session.
 */

import { useState, useEffect, useCallback, useRef } from "react";

export type NoteType = "bug" | "feedback" | "idea" | "question" | "observation";
export type NoteSeverity = "critical" | "important" | "minor" | "cosmetic";

export interface PlaygroundNote {
	id: string;
	testId: string;
	timestamp: string;
	type: NoteType;
	severity: NoteSeverity;
	content: string;
	context: {
		seed?: number | string;
		fps?: number;
		renderMode?: string;
		camera?: { x: number; y: number; z: number };
		custom?: Record<string, unknown>;
	};
	devToolsDump?: string;
}

interface PlaygroundNotesProps {
	/** Unique ID for this test (used as localStorage key) */
	testId: string;
	/** Scene context to capture with each note */
	sceneContext?: Record<string, unknown>;
	/** Optional FPS ref for capturing performance */
	fpsRef?: React.RefObject<number>;
	/** Whether panel is initially expanded */
	defaultExpanded?: boolean;
}

const NOTE_COLORS: Record<NoteType, string> = {
	bug: "#ff4444",
	feedback: "#00ff88",
	idea: "#ffff00",
	question: "#00aaff",
	observation: "#aa88ff",
};

const SEVERITY_LABELS: Record<NoteSeverity, string> = {
	critical: "!!",
	important: "!",
	minor: "~",
	cosmetic: ".",
};

// File System Access API types
declare global {
	interface Window {
		showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
	}
}

// Store the directory handle globally so it persists across components
let notesDirectoryHandle: FileSystemDirectoryHandle | null = null;

/**
 * Generate unique ID for notes
 */
function generateId(): string {
	return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Request directory access from user
 */
async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
	if (!window.showDirectoryPicker) {
		alert("File System Access API not supported. Use Chrome 86+");
		return null;
	}
	try {
		notesDirectoryHandle = await window.showDirectoryPicker();
		return notesDirectoryHandle;
	} catch (e) {
		if ((e as Error).name !== "AbortError") {
			console.error("[PlaygroundNotes] Directory access error:", e);
		}
		return null;
	}
}

/**
 * Load notes from filesystem
 */
async function loadNotesFromFS(testId: string): Promise<PlaygroundNote[]> {
	if (!notesDirectoryHandle) return [];
	try {
		const fileHandle = await notesDirectoryHandle.getFileHandle(`${testId}.json`);
		const file = await fileHandle.getFile();
		const text = await file.text();
		return JSON.parse(text);
	} catch (e) {
		// File doesn't exist yet - that's fine
		if ((e as Error).name === "NotFoundError") return [];
		console.error("[PlaygroundNotes] Load error:", e);
		return [];
	}
}

/**
 * Save notes to filesystem
 */
async function saveNotesToFS(testId: string, notes: PlaygroundNote[]): Promise<boolean> {
	if (!notesDirectoryHandle) {
		console.warn("[PlaygroundNotes] No directory handle - notes not saved");
		return false;
	}
	try {
		const fileHandle = await notesDirectoryHandle.getFileHandle(`${testId}.json`, {
			create: true,
		});
		const writable = await fileHandle.createWritable();
		await writable.write(JSON.stringify(notes, null, 2));
		await writable.close();
		console.log(`[PlaygroundNotes] Saved ${notes.length} notes to ${testId}.json`);
		return true;
	} catch (e) {
		console.error("[PlaygroundNotes] Save error:", e);
		return false;
	}
}

export function PlaygroundNotes({
	testId,
	sceneContext = {},
	fpsRef,
	defaultExpanded = false,
}: PlaygroundNotesProps) {
	const [notes, setNotes] = useState<PlaygroundNote[]>([]);
	const [expanded, setExpanded] = useState(defaultExpanded);
	const [noteType, setNoteType] = useState<NoteType>("observation");
	const [severity, setSeverity] = useState<NoteSeverity>("minor");
	const [noteContent, setNoteContent] = useState("");
	const [devToolsDump, setDevToolsDump] = useState("");
	const [hasDirectoryAccess, setHasDirectoryAccess] = useState(!!notesDirectoryHandle);
	const [isSaving, setIsSaving] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Load notes on mount or when directory access is granted
	useEffect(() => {
		if (hasDirectoryAccess) {
			loadNotesFromFS(testId).then(setNotes);
		}
	}, [testId, hasDirectoryAccess]);

	// Request directory access
	const handleRequestAccess = useCallback(async () => {
		const handle = await requestDirectoryAccess();
		if (handle) {
			setHasDirectoryAccess(true);
			const loaded = await loadNotesFromFS(testId);
			setNotes(loaded);
		}
	}, [testId]);

	// Add a new note
	const addNote = useCallback(async () => {
		if (!noteContent.trim()) return;
		if (!hasDirectoryAccess) {
			alert("Set a notes folder first!");
			return;
		}

		setIsSaving(true);
		const note: PlaygroundNote = {
			id: generateId(),
			testId,
			timestamp: new Date().toISOString(),
			type: noteType,
			severity,
			content: noteContent.trim(),
			context: {
				...sceneContext,
				fps: fpsRef?.current,
			},
			devToolsDump: devToolsDump.trim() || undefined,
		};

		const updated = [...notes, note];
		setNotes(updated);
		await saveNotesToFS(testId, updated);
		setNoteContent("");
		setDevToolsDump("");
		setIsSaving(false);
	}, [testId, noteContent, noteType, severity, sceneContext, fpsRef, devToolsDump, notes, hasDirectoryAccess]);

	// Delete a note
	const deleteNote = useCallback(
		async (id: string) => {
			const updated = notes.filter((n) => n.id !== id);
			setNotes(updated);
			await saveNotesToFS(testId, updated);
		},
		[testId, notes]
	);

	// Clear all notes
	const clearNotes = useCallback(async () => {
		if (confirm(`Delete all ${notes.length} notes for ${testId}?`)) {
			setNotes([]);
			await saveNotesToFS(testId, []);
		}
	}, [testId, notes.length]);

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				addNote();
			}
		},
		[addNote]
	);

	if (!expanded) {
		return (
			<button
				onClick={() => setExpanded(true)}
				style={{
					position: "fixed",
					bottom: "1rem",
					right: "1rem",
					padding: "0.5rem 1rem",
					background: "#1a1a2e",
					border: "2px solid #ff0088",
					color: "#ff0088",
					cursor: "pointer",
					fontFamily: "monospace",
					fontSize: "0.8rem",
					zIndex: 1000,
				}}
			>
				NOTES ({notes.length})
			</button>
		);
	}

	return (
		<div
			style={{
				position: "fixed",
				bottom: "1rem",
				right: "1rem",
				width: "400px",
				maxHeight: "60vh",
				background: "rgba(10, 10, 20, 0.95)",
				border: "2px solid #ff0088",
				fontFamily: "monospace",
				fontSize: "0.75rem",
				color: "#e0e0e0",
				display: "flex",
				flexDirection: "column",
				zIndex: 1000,
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: "0.5rem",
					borderBottom: "1px solid #ff0088",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: "#1a1a2e",
				}}
			>
				<span style={{ color: "#ff0088", fontWeight: "bold" }}>
					// NOTES: {testId}
				</span>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<button
						onClick={handleRequestAccess}
						style={{
							padding: "0.25rem 0.5rem",
							background: hasDirectoryAccess ? "#00ff88" : "transparent",
							border: "1px solid #00ff88",
							color: hasDirectoryAccess ? "#0a0a0f" : "#00ff88",
							cursor: "pointer",
							fontSize: "0.65rem",
						}}
						title={hasDirectoryAccess ? "Directory set" : "Choose notes folder"}
					>
						{hasDirectoryAccess ? "✓ FOLDER" : "SET FOLDER"}
					</button>
					<button
						onClick={clearNotes}
						style={{
							padding: "0.25rem 0.5rem",
							background: "transparent",
							border: "1px solid #ff4444",
							color: "#ff4444",
							cursor: "pointer",
							fontSize: "0.65rem",
						}}
						title="Clear all notes"
					>
						CLEAR
					</button>
					<button
						onClick={() => setExpanded(false)}
						style={{
							padding: "0.25rem 0.5rem",
							background: "transparent",
							border: "1px solid #888",
							color: "#888",
							cursor: "pointer",
							fontSize: "0.65rem",
						}}
					>
						_
					</button>
				</div>
			</div>

			{/* Note input */}
			<div
				style={{
					padding: "0.5rem",
					borderBottom: "1px solid #333",
					display: "flex",
					flexDirection: "column",
					gap: "0.5rem",
				}}
			>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<select
						value={noteType}
						onChange={(e) => setNoteType(e.target.value as NoteType)}
						style={{
							flex: 1,
							padding: "0.25rem",
							background: "#1a1a2e",
							border: `1px solid ${NOTE_COLORS[noteType]}`,
							color: NOTE_COLORS[noteType],
							fontSize: "0.7rem",
						}}
					>
						<option value="observation">OBSERVATION</option>
						<option value="bug">BUG</option>
						<option value="feedback">FEEDBACK</option>
						<option value="idea">IDEA</option>
						<option value="question">QUESTION</option>
					</select>
					<select
						value={severity}
						onChange={(e) => setSeverity(e.target.value as NoteSeverity)}
						style={{
							padding: "0.25rem",
							background: "#1a1a2e",
							border: "1px solid #666",
							color: "#aaa",
							fontSize: "0.7rem",
						}}
					>
						<option value="critical">CRITICAL !!</option>
						<option value="important">IMPORTANT !</option>
						<option value="minor">MINOR ~</option>
						<option value="cosmetic">COSMETIC .</option>
					</select>
				</div>

				<textarea
					ref={textareaRef}
					value={noteContent}
					onChange={(e) => setNoteContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Your observation... (Ctrl+Enter to add)"
					style={{
						width: "100%",
						minHeight: "60px",
						padding: "0.5rem",
						background: "#0a0a0f",
						border: "1px solid #333",
						color: "#e0e0e0",
						fontSize: "0.75rem",
						fontFamily: "monospace",
						resize: "vertical",
					}}
				/>

				<details style={{ fontSize: "0.65rem" }}>
					<summary
						style={{ cursor: "pointer", color: "#888", marginBottom: "0.25rem" }}
					>
						+ DevTools dump (optional)
					</summary>
					<textarea
						value={devToolsDump}
						onChange={(e) => setDevToolsDump(e.target.value)}
						placeholder="Paste console output, React DevTools state, etc..."
						style={{
							width: "100%",
							minHeight: "40px",
							padding: "0.5rem",
							background: "#0a0a0f",
							border: "1px solid #333",
							color: "#888",
							fontSize: "0.65rem",
							fontFamily: "monospace",
							resize: "vertical",
						}}
					/>
				</details>

				<button
					onClick={addNote}
					disabled={!noteContent.trim() || !hasDirectoryAccess || isSaving}
					style={{
						padding: "0.5rem",
						background:
							noteContent.trim() && hasDirectoryAccess && !isSaving
								? "#ff0088"
								: "#333",
						border: "none",
						color:
							noteContent.trim() && hasDirectoryAccess && !isSaving
								? "#fff"
								: "#666",
						cursor:
							noteContent.trim() && hasDirectoryAccess && !isSaving
								? "pointer"
								: "not-allowed",
						fontWeight: "bold",
						fontSize: "0.75rem",
					}}
				>
					{isSaving
						? "SAVING..."
						: !hasDirectoryAccess
							? "SET FOLDER FIRST"
							: "ADD NOTE"}
				</button>
			</div>

			{/* Notes list */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "0.5rem",
				}}
			>
				{notes.length === 0 ? (
					<div style={{ color: "#666", textAlign: "center", padding: "1rem" }}>
						No notes yet. Add your observations!
					</div>
				) : (
					notes
						.slice()
						.reverse()
						.map((note) => (
							<div
								key={note.id}
								style={{
									marginBottom: "0.5rem",
									padding: "0.5rem",
									background: "#1a1a2e",
									borderLeft: `3px solid ${NOTE_COLORS[note.type]}`,
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: "0.25rem",
										fontSize: "0.65rem",
									}}
								>
									<span style={{ color: NOTE_COLORS[note.type] }}>
										{SEVERITY_LABELS[note.severity]} {note.type.toUpperCase()}
									</span>
									<span style={{ color: "#666" }}>
										{new Date(note.timestamp).toLocaleTimeString()}
									</span>
								</div>
								<div style={{ marginBottom: "0.25rem" }}>{note.content}</div>
								{note.context && Object.keys(note.context).length > 0 && (
									<div style={{ fontSize: "0.6rem", color: "#666" }}>
										{Object.entries(note.context)
											.filter(([_, v]) => v !== undefined)
											.map(([k, v]) => `${k}:${JSON.stringify(v)}`)
											.join(" | ")}
									</div>
								)}
								{note.devToolsDump && (
									<details style={{ fontSize: "0.6rem", marginTop: "0.25rem" }}>
										<summary style={{ cursor: "pointer", color: "#888" }}>
											DevTools context
										</summary>
										<pre
											style={{
												background: "#0a0a0f",
												padding: "0.25rem",
												overflowX: "auto",
												whiteSpace: "pre-wrap",
												wordBreak: "break-word",
											}}
										>
											{note.devToolsDump}
										</pre>
									</details>
								)}
								<button
									onClick={() => deleteNote(note.id)}
									style={{
										marginTop: "0.25rem",
										padding: "0.125rem 0.25rem",
										background: "transparent",
										border: "1px solid #444",
										color: "#666",
										cursor: "pointer",
										fontSize: "0.6rem",
									}}
								>
									DELETE
								</button>
							</div>
						))
				)}
			</div>

			{/* Context footer */}
			<div
				style={{
					padding: "0.25rem 0.5rem",
					borderTop: "1px solid #333",
					fontSize: "0.6rem",
					color: "#666",
					background: "#0a0a0f",
				}}
			>
				Context:{" "}
				{Object.entries(sceneContext)
					.filter(([_, v]) => v !== undefined)
					.map(([k, v]) => `${k}=${JSON.stringify(v)}`)
					.join(", ") || "none"}
			</div>
		</div>
	);
}

export default PlaygroundNotes;
