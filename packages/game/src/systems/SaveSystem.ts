const KEY = "neo_tokyo_save";

export const SaveSystem = {
	save(stageId: string, rep: number) {
		if (typeof window === "undefined") return;
		const data = { stageId, rep, timestamp: Date.now() };
		localStorage.setItem(KEY, JSON.stringify(data));
		console.log("Game Saved:", data);
	},

	load(): { stageId: string; rep: number } | null {
		if (typeof window === "undefined") return null;
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch {
			return null;
		}
	},

	clear() {
		if (typeof window === "undefined") return;
		localStorage.removeItem(KEY);
	},
};
