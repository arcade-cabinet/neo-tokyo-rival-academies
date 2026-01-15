import { CONFIG } from './config.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function githubRequest<T = any>(endpoint: string, method = 'GET', body: Record<string, unknown> | null = null): Promise<T | null> {
    const { TOKEN, REPO, BASE_URL } = CONFIG.GITHUB;

    if (!TOKEN || !REPO) {
        console.log("Missing GITHUB_TOKEN or GITHUB_REPOSITORY");
        return null;
    }
    const url = `${BASE_URL}/repos/${REPO}/${endpoint}`;
    const opts: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Jules-Triage-Script'
        }
    };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(url, opts);
        if (!res.ok) {
            console.error(`GitHub API Error: ${res.status} ${res.statusText} for ${endpoint}`);
            // Attempt to read body for more info
            try {
                const errBody = await res.text();
                console.error(`Error details: ${errBody}`);
            } catch { /* ignore */ }
            return null;
        }
        return (await res.json()) as T;
    } catch (e) {
        console.error("GitHub Request Failed:", e);
        return null;
    }
}
