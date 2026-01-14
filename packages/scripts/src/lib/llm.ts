import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export async function callGemini(prompt: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        // @ts-ignore
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
}

export async function callAnthropic(prompt: string): Promise<string | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
            model: 'claude-3-haiku-20240307',
        });
        // @ts-ignore
        return message.content[0].text;
    } catch (e) {
        console.error("Anthropic Error:", e);
        return null;
    }
}

export async function callLLM(prompt: string): Promise<string | null> {
    const providers = [];
    if (process.env.GEMINI_API_KEY) providers.push('gemini');
    if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');

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
