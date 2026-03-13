"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
class OllamaService {
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }
    async ping() {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`);
            return res.ok;
        }
        catch (e) {
            console.error("Ollama connection failed:", e);
            return false;
        }
    }
    async generate(model, prompt, stream = false) {
        try {
            const res = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, stream })
            });
            return stream ? res.body : await res.json();
        }
        catch (e) {
            console.error("Generation failed:", e);
            throw e;
        }
    }
    async listModels() {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`);
            const data = await res.json();
            return data.models.map((m) => m.name);
        }
        catch (e) {
            return [];
        }
    }
}
exports.OllamaService = OllamaService;
