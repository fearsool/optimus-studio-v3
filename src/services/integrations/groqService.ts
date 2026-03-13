
import { integrationManager } from '../integrationService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const groqService = {
    getApiKey(): string | null {
        // 1. Env Variable
        if (typeof process !== 'undefined' && process.env?.VITE_GROQ_API_KEY) {
            return process.env.VITE_GROQ_API_KEY;
        }
        if ((import.meta as any).env?.VITE_GROQ_API_KEY) {
            return (import.meta as any).env.VITE_GROQ_API_KEY;
        }
        // 2. Integration Manager
        const integration = integrationManager.getIntegrations().find(i => i.type === 'groq');
        return integration?.credentials?.apiKey || null;
    },

    async generateText(messages: GroqMessage[], model: string = 'llama3-70b-8192', jsonMode: boolean = false): Promise<string | null> {
        const apiKey = this.getApiKey();

        if (!apiKey) {
            console.warn('[Groq] No API Key found.');
            return null;
        }

        try {
            const body: any = {
                messages,
                model,
                temperature: 0.7
            };

            if (jsonMode) {
                body.response_format = { type: 'json_object' };
            }

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error('[Groq] API Error:', response.status, err);
                return null;
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || null;
        } catch (error) {
            console.error('[Groq] Network Error:', error);
            return null;
        }
    },

    /**
     * Specialized method for JSON generation (robust fallback)
     */
    async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T | null> {
        const messages: GroqMessage[] = [
            { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON. No markdown ticks.' },
            { role: 'user', content: userPrompt }
        ];

        const text = await this.generateText(messages, 'llama3-70b-8192', true);
        if (!text) return null;

        try {
            // Clean markdown if present (Groq sometimes adds backticks even in JSON mode)
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText) as T;
        } catch (e) {
            console.error('[Groq] JSON Parse Error:', e, text);
            return null;
        }
    }
};
