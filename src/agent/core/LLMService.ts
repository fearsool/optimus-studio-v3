import { modelRouter } from '../router/ModelRouter';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class LLMService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://127.0.0.1:11434') {
        this.baseUrl = baseUrl;
    }

    async chat(messages: ChatMessage[], model?: string): Promise<string> {
        // En iyi modeli seç (eğer belirtilmediyse)
        if (!model) {
            const routing = await modelRouter.route('chat');
            model = routing.model;
            // Fallback to a default if routing fails or returns empty
            if (!model) model = 'mistral:latest';
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
            return data.message?.content || 'No response content';

        } catch (error: any) {
            console.error('❌ [LLMService] Error calling Ollama:', error);
            return `AI Error: ${error.message}. Is Ollama running on port 11434?`;
        }
    }
}
