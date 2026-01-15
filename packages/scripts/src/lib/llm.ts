import Anthropic from '@anthropic-ai/sdk';
import type { GeminiResponse } from '../types/llm.js';
import { CONFIG } from './config.js';

export async function callGemini(prompt: string): Promise<string | null> {
    const apiKey = CONFIG.LLM.GEMINI.API_KEY;
    if (!apiKey) return null;

    try {
        const url = `${CONFIG.LLM.GEMINI.BASE_URL}/${CONFIG.LLM.GEMINI.MODEL}:generateContent`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey // Send API Key in header for better security
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = (await response.json()) as GeminiResponse;
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
}

export async function callAnthropic(prompt: string): Promise<string | null> {
    const apiKey = CONFIG.LLM.ANTHROPIC.API_KEY;
    if (!apiKey) return null;

    try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
            max_tokens: CONFIG.LLM.ANTHROPIC.MAX_TOKENS,
            messages: [{ role: 'user', content: prompt }],
            model: CONFIG.LLM.ANTHROPIC.MODEL,
        });

        if (message.content && message.content.length > 0 && message.content[0].type === 'text') {
             return message.content[0].text;
        }
        return null;
    } catch (e) {
        console.error("Anthropic Error:", e);
        return null;
    }
}

export async function callLLM(prompt: string): Promise<string | null> {
    const providers = [];
    if (CONFIG.LLM.GEMINI.API_KEY) providers.push('gemini');
    if (CONFIG.LLM.ANTHROPIC.API_KEY) providers.push('anthropic');

    if (providers.length === 0) {
        console.log("No API keys found.");
        return null;
    }

    const choice = providers[Math.floor(Math.random() * providers.length)];
    let result = null;

    if (choice === 'gemini') {
        result = await callGemini(prompt);
        if (!result && providers.includes('anthropic')) result = await callAnthropic(prompt);
    } else {
        result = await callAnthropic(prompt);
        if (!result && providers.includes('gemini')) result = await callGemini(prompt);
    }
    return result;
}
