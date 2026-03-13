"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqService = void 0;
const integrationService_1 = require("../integrationService");
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
exports.groqService = {
    getApiKey() {
        var _a, _b, _c;
        // 1. Env Variable
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.VITE_GROQ_API_KEY)) {
            return process.env.VITE_GROQ_API_KEY;
        }
        if ((_b = import.meta.env) === null || _b === void 0 ? void 0 : _b.VITE_GROQ_API_KEY) {
            return import.meta.env.VITE_GROQ_API_KEY;
        }
        // 2. Integration Manager
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'groq');
        return ((_c = integration === null || integration === void 0 ? void 0 : integration.credentials) === null || _c === void 0 ? void 0 : _c.apiKey) || null;
    },
    async generateText(messages, model = 'llama3-70b-8192', jsonMode = false) {
        var _a, _b;
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.warn('[Groq] No API Key found.');
            return null;
        }
        try {
            const body = {
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
            return ((_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || null;
        }
        catch (error) {
            console.error('[Groq] Network Error:', error);
            return null;
        }
    },
    /**
     * Specialized method for JSON generation (robust fallback)
     */
    async generateJSON(systemPrompt, userPrompt) {
        const messages = [
            { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON. No markdown ticks.' },
            { role: 'user', content: userPrompt }
        ];
        const text = await this.generateText(messages, 'llama3-70b-8192', true);
        if (!text)
            return null;
        try {
            // Clean markdown if present (Groq sometimes adds backticks even in JSON mode)
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        }
        catch (e) {
            console.error('[Groq] JSON Parse Error:', e, text);
            return null;
        }
    }
};
