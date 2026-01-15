export const CONFIG = {
    LLM: {
        GEMINI: {
            API_KEY: process.env.GEMINI_API_KEY,
            MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
        },
        ANTHROPIC: {
            API_KEY: process.env.ANTHROPIC_API_KEY,
            MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
            MAX_TOKENS: 1024
        }
    },
    GITHUB: {
        TOKEN: process.env.GITHUB_TOKEN,
        REPO: process.env.GITHUB_REPOSITORY,
        BASE_URL: 'https://api.github.com'
    },
    VERIFICATION: {
        BASE_URL: process.env.GAME_URL || 'http://localhost:4323/neo-tokyo-rival-academies',
        TIMEOUT_MS: 30000,
        VIEWPORT: { width: 1280, height: 720 }
    }
};
