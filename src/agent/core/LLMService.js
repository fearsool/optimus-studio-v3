"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const ModelRouter_1 = require("../router/ModelRouter");
class LLMService {
    constructor(baseUrl = 'http://127.0.0.1:11434') {
        this.baseUrl = baseUrl;
    }
    async chat(messages, model) {
        var _a;
        // En iyi modeli seç (eğer belirtilmediyse)
        if (!model) {
            const routing = await ModelRouter_1.modelRouter.route('chat');
            model = routing.model;
            // Fallback to a default if routing fails or returns empty
            if (!model)
                model = 'mistral:latest';
        }
        try {
            console.log(`🤖 [LLMService] Calling Ollama with model: ${model}`);
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: false,
                    options: {
                        num_ctx: 4096, // CRITICAL: Keep 4096 for 7B model safety on 32GB RAM
                        temperature: 0.7
                    }
                })
            });
            if (!response.ok) {
                throw new Error(`Ollama API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return ((_a = data.message) === null || _a === void 0 ? void 0 : _a.content) || 'No response content';
        }
        catch (error) {
            console.error('❌ [LLMService] Error calling Ollama:', error);
            return `AI Error: ${error.message}. Is Ollama running on port 11434?`;
        }
    }
}
exports.LLMService = LLMService;
