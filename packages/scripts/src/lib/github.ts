const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;

export async function githubRequest(endpoint: string, method = 'GET', body: any = null) {
    if (!GITHUB_TOKEN || !REPO) {
        console.log("Missing GITHUB_TOKEN or GITHUB_REPOSITORY");
        return null;
    }
    const url = `https://api.github.com/repos/${REPO}/${endpoint}`;
    const opts: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Jules-Triage-Script'
        }
    };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(url, opts);
        if (!res.ok) {
            console.error(`GitHub API Error: ${res.status} ${res.statusText}`);
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error("GitHub Request Failed:", e);
        return null;
    }
}
