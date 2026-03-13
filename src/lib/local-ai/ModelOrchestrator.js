"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelOrchestrator = void 0;
const OllamaService_1 = require("./OllamaService");
class ModelOrchestrator {
    constructor() {
        this.ollama = new OllamaService_1.OllamaService();
        this.modelRegistry = new Map([
            ['coding', {
                    name: 'Qwen2.5-Coder-7B-Q4_K_M',
                    provider: 'ollama',
                    quantization: 'Q4_K_M',
                    context: 32768,
                    temperature: 0.1,
                    maxTokens: 4096
                }],
            ['planning', {
                    name: 'DeepSeek-Coder-33B-Q4_K_M',
                    provider: 'ollama',
                    quantization: 'Q4_K_M',
                    context: 64000,
                    temperature: 0.3,
                    maxTokens: 8192
                }],
            ['turkish', {
                    name: 'Mistral-7B-TR-Q4_K_M',
                    provider: 'ollama',
                    quantization: 'Q4_K_M',
                    context: 32000,
                    temperature: 0.7,
                    maxTokens: 2048
                }],
            ['video_script', {
                    name: 'Mixtral-8x7B-Q4_K_M',
                    provider: 'ollama',
                    quantization: 'Q4_K_M',
                    context: 32000,
                    temperature: 0.8,
                    maxTokens: 4096
                }],
            ['long_context', {
                    name: 'Llama-3.1-70B-Q2_K',
                    provider: 'ollama',
                    quantization: 'Q2_K',
                    context: 128000,
                    temperature: 0.5,
                    maxTokens: 16384
                }],
            ['creative', {
                    name: 'Dolphin-2.9-Mixtral-8x7B',
                    provider: 'ollama',
                    quantization: 'Q4_K_M',
                    context: 32000,
                    temperature: 0.9,
                    maxTokens: 4096
                }]
        ]);
    }
    async routeRequest(task, prompt, context) {
        const config = this.modelRegistry.get(task);
        if (!config)
            throw new Error(`No model configured for task: ${task}`);
        console.log(`[Orchestrator] Routing '${task}' task to ${config.name}...`);
        const engineeredPrompt = this.engineerPrompt(task, prompt, context);
        try {
            // Attempt generation
            const response = await this.ollama.generate(config.name, engineeredPrompt);
            return response.response; // Ollama API returns { response: "text", ... }
        }
        catch (error) {
            console.error(`[Orchestrator] Failed to run ${config.name}:`, error);
            // Fallback logic could go here
            throw error;
        }
    }
    engineerPrompt(task, prompt, context) {
        switch (task) {
            case 'coding':
                return `[INST] You are Qwen2.5-Coder, an expert programming assistant.
Task: ${prompt}
Requirements: Production-ready code, Error handling, TypeScript/JavaScript.
Context: ${JSON.stringify(context || {})}
Respond with ONLY code. [/INST]`;
            case 'planning':
                return `[INST] You are DeepSeek-Coder, a strategic planning expert.
Task: ${prompt}
Output format: JSON with steps. [/INST]`;
            case 'turkish':
                return `[INST] Sen Mistral'sin. Türkçe içerik uzmanısın.
Görev: ${prompt}
Ton: Doğal, akıcı, modern.
Bağlam: ${(context === null || context === void 0 ? void 0 : context.audience) || 'genel'} [/INST]`;
            case 'video_script':
                return `[INST] You are Mixtral-8x7B, a creative script writer.
Create a 30s viral script about: ${prompt}
Structure: Hook (0-3s), Body (3-20s), Call To Action (20-30s).
Style: ${(context === null || context === void 0 ? void 0 : context.style) || 'Energetic'} [/INST]`;
            default:
                return prompt;
        }
    }
    async getAvailableModels() {
        return this.ollama.listModels();
    }
}
exports.ModelOrchestrator = ModelOrchestrator;
