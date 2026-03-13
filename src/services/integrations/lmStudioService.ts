
import { OptimusResponse } from '../optimus/core/optimusTypes';

const LM_STUDIO_URL = 'http://localhost:1234/v1';

export interface LocalAIConfig {
    enabled: boolean;
    temperature: number;
    maxTokens: number;
}

export const lmStudioService = {
    /**
     * Check if LM Studio is running and ready
     */
    async isAvailable(): Promise<boolean> {
        try {
            // Models endpoint is a lightweight check
            const response = await fetch(`${LM_STUDIO_URL}/models`, {
                method: 'GET',
            });
            return response.status === 200;
        } catch (e) {
            return false;
        }
    },

    /**
     * Generate text completion using local model
     */
    async chatComplete(
        messages: Array<{ role: string; content: string }>,
        config: Partial<LocalAIConfig> = {}
    ): Promise<string | null> {
        try {
            console.log('🧠 [LM Studio] Thinking locally...');

            const response = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // CORS workaround might be needed if not enabled in LM Studio app
                },
                body: JSON.stringify({
                    messages,
                    temperature: config.temperature || 0.7,
                    max_tokens: config.maxTokens || -1,
                    stream: false
                })
            });

            if (!response.ok) {
                console.error('[LM Studio] Error:', response.statusText);
                return null;
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || null;

        } catch (error) {
            console.error('[LM Studio] Connection failed. Make sure server is running.', error);
            return null;
        }
    },

    /**
     * Specialized Optimus Processor
     * Converts Optimus Intents into LM Studio prompts
     */
    async processOptimusTask(task: string, context: string): Promise<string | null> {
        const systemPrompt = `You are OPTIMUS, an advanced autonomous factory operating system.
Current Context: ${context}
Style: Professional, efficient, analytical.
Task: Execute the user command or answer the question.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: task }
        ];

        return this.chatComplete(messages);
    }
};
