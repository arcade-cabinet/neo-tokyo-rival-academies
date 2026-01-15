export interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
}

export interface AnthropicResponse {
    content: Array<{
        text: string;
        type: 'text';
    }>;
    id: string;
    model: string;
    role: string;
    type: 'message';
}
