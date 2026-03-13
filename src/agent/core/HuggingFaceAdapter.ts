/**
 * 🤗 HUGGINGFACE ADAPTER
 * =====================
 * Free-tier Inference API adapter for all agent task types.
 *
 * Best free models selected (March 2026):
 *  - Chat/Turkish  : mistralai/Mistral-7B-Instruct-v0.3
 *  - Code          : Qwen/Qwen2.5-Coder-7B-Instruct
 *  - Reasoning     : deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
 *  - Summarization : facebook/bart-large-cnn
 *  - Embeddings    : sentence-transformers/all-MiniLM-L6-v2
 *  - Image Gen     : stabilityai/stable-diffusion-xl-base-1.0
 */

import axios, { AxiosError } from 'axios';

// =================== TYPES ===================

export interface HFTextResult {
    content: string;
    model: string;
    tokensUsed?: number;
}

export interface HFImageResult {
    base64: string;
    mimeType: string;
    model: string;
}

export interface HFEmbeddingResult {
    embedding: number[];
    model: string;
}

export type HFTaskType =
    | 'chat'
    | 'chat_turkish'
    | 'code_generation'
    | 'code_review'
    | 'reasoning'
    | 'planning'
    | 'summarization'
    | 'translation'
    | 'video_script'
    | 'vision'
    | 'embedding'
    | 'long_context'
    | 'image_generation';

// =================== MODEL MAP ===================

const HF_MODEL_MAP: Record<HFTaskType, string[]> = {
    // 🇹🇷 Turkish / multilingual chat — primary pick
    chat_turkish: [
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct',
        'tiiuae/falcon-7b-instruct',
    ],
    // 💬 General chat
    chat: [
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct',
        'HuggingFaceH4/zephyr-7b-beta',
    ],
    // 💻 Code generation
    code_generation: [
        'Qwen/Qwen2.5-Coder-7B-Instruct',
        'bigcode/starcoder2-7b',
        'mistralai/Mistral-7B-Instruct-v0.3',
    ],
    // 🔍 Code review
    code_review: [
        'Qwen/Qwen2.5-Coder-7B-Instruct',
        'bigcode/starcoder2-7b',
    ],
    // 🧠 Reasoning / logic
    reasoning: [
        'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct',
    ],
    // 📋 Planning / task breakdown
    planning: [
        'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct',
    ],
    // 📝 Summarize long text
    summarization: [
        'facebook/bart-large-cnn',
        'google/pegasus-xsum',
        'mistralai/Mistral-7B-Instruct-v0.3',
    ],
    // 🌐 Translation
    translation: [
        'Helsinki-NLP/opus-mt-en-tr',
        'Helsinki-NLP/opus-mt-tr-en',
        'mistralai/Mistral-7B-Instruct-v0.3',
    ],
    // 🎬 Video scripts / creative
    video_script: [
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct',
    ],
    // 👁️ Vision (image+text)
    vision: [
        'Salesforce/blip-image-captioning-large',
        'microsoft/Florence-2-large',
    ],
    // 🔢 Embeddings / RAG
    embedding: [
        'sentence-transformers/all-MiniLM-L6-v2',
        'sentence-transformers/all-mpnet-base-v2',
    ],
    // 📚 Long context
    long_context: [
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct',
    ],
    // 🎨 Image generation
    image_generation: [
        'stabilityai/stable-diffusion-xl-base-1.0',
        'runwayml/stable-diffusion-v1-5',
    ],
};

// =================== SYSTEM PROMPTS ===================

const SYSTEM_PROMPTS: Partial<Record<HFTaskType, string>> = {
    chat_turkish:
        'Sen Optimus adında yardımsever, zeki ve profesyonel bir Türkçe asistansın. Her zaman Türkçe yanıt ver. Samimi ama saygılı ol.',
    code_generation:
        'You are an expert software engineer. Generate clean, well-commented, production-ready code. Follow best practices.',
    code_review:
        'You are a senior code reviewer. Analyze code for bugs, security issues, and improvements. Be concise and actionable.',
    reasoning:
        'You are a logical reasoning expert. Think step by step (chain-of-thought). Show your reasoning clearly.',
    planning:
        'You are a strategic planning expert. Break down tasks into clear, actionable steps. Be comprehensive but concise.',
    video_script:
        'You are a creative content writer specializing in engaging video scripts. Use storytelling techniques.',
};

// =================== ADAPTER CLASS ===================

export class HuggingFaceAdapter {
    private readonly apiToken: string;
    private readonly baseUrl = 'https://api-inference.huggingface.co';
    private readonly maxRetries = 3;
    private readonly retryDelayMs = 2000;
    // Circuit breaker: track failed models temporarily
    private readonly failedModels: Map<string, number> = new Map();
    private readonly MODEL_COOLDOWN_MS = 60_000; // 1 minute

    constructor() {
        this.apiToken = process.env.HUGGINGFACE_API_TOKEN || '';
        if (!this.apiToken) {
            console.warn('[HuggingFace] ⚠️  No HUGGINGFACE_API_TOKEN found. Set it in .env for best results.');
        }
    }

    // ============ TEXT GENERATION ============

    /**
     * Generate text using the best available HuggingFace model for a task.
     */
    async generate(prompt: string, taskType: HFTaskType = 'chat', options?: {
        maxTokens?: number;
        temperature?: number;
        systemPrompt?: string;
    }): Promise<HFTextResult> {
        const models = this.getAvailableModels(taskType);

        for (const model of models) {
            try {
                const content = await this.callTextModel(model, prompt, taskType, options);
                console.log(`[HuggingFace] ✅ ${taskType} → ${model}`);
                return { content, model };
            } catch (error: any) {
                console.warn(`[HuggingFace] ⚠️  ${model} failed: ${error.message}. Trying next...`);
                this.markModelFailed(model);
            }
        }

        throw new Error(`[HuggingFace] All models failed for task: ${taskType}`);
    }

    /**
     * Generate an image from a text prompt.
     */
    async generateImage(prompt: string, options?: {
        negativePrompt?: string;
        width?: number;
        height?: number;
    }): Promise<HFImageResult> {
        const models = this.getAvailableModels('image_generation');

        for (const model of models) {
            try {
                const imageBlob = await this.callImageModel(model, prompt, options);
                console.log(`[HuggingFace] ✅ image_generation → ${model}`);
                return { base64: imageBlob, mimeType: 'image/png', model };
            } catch (error: any) {
                console.warn(`[HuggingFace] ⚠️  Image model ${model} failed: ${error.message}`);
                this.markModelFailed(model);
            }
        }

        throw new Error('[HuggingFace] All image generation models failed.');
    }

    /**
     * Generate embedding vectors for text (used in memory/RAG).
     */
    async embed(text: string): Promise<HFEmbeddingResult> {
        const models = this.getAvailableModels('embedding');

        for (const model of models) {
            try {
                const embedding = await this.callEmbeddingModel(model, text);
                return { embedding, model };
            } catch (error: any) {
                console.warn(`[HuggingFace] ⚠️  Embedding model ${model} failed: ${error.message}`);
                this.markModelFailed(model);
            }
        }

        throw new Error('[HuggingFace] All embedding models failed.');
    }

    // ============ INTERNAL HTTP CALLS ============

    private async callTextModel(
        model: string,
        prompt: string,
        taskType: HFTaskType,
        options?: { maxTokens?: number; temperature?: number; systemPrompt?: string }
    ): Promise<string> {
        const systemPrompt = options?.systemPrompt
            || SYSTEM_PROMPTS[taskType]
            || 'You are a helpful assistant.';

        const maxTokens = options?.maxTokens ?? 1024;
        const temperature = options?.temperature ?? 0.7;

        const payload = {
            inputs: `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\n${prompt} [/INST]`,
            parameters: {
                max_new_tokens: maxTokens,
                temperature: temperature,
                do_sample: true,
                return_full_text: false,
            },
        };

        const response = await this.requestWithRetry(
            `${this.baseUrl}/models/${model}`,
            payload
        );

        // HF inference API returns array for text tasks
        if (Array.isArray(response.data)) {
            return response.data[0]?.generated_text?.trim() || 'No response.';
        }

        // Some models return object directly
        if (typeof response.data === 'object' && response.data.generated_text) {
            return response.data.generated_text.trim();
        }

        return String(response.data).trim();
    }

    private async callImageModel(
        model: string,
        prompt: string,
        options?: { negativePrompt?: string; width?: number; height?: number }
    ): Promise<string> {
        const payload = {
            inputs: prompt,
            parameters: {
                negative_prompt: options?.negativePrompt || 'blurry, low quality, distorted',
                width: options?.width || 1024,
                height: options?.height || 1024,
                num_inference_steps: 30,
                guidance_scale: 7.5,
            },
        };

        const response = await this.requestWithRetry(
            `${this.baseUrl}/models/${model}`,
            payload,
            'arraybuffer'
        );

        const buffer = Buffer.from(response.data);
        return buffer.toString('base64');
    }

    private async callEmbeddingModel(model: string, text: string): Promise<number[]> {
        const response = await this.requestWithRetry(
            `${this.baseUrl}/models/${model}`,
            { inputs: text }
        );

        if (Array.isArray(response.data)) {
            return response.data as number[];
        }
        throw new Error(`Unexpected embedding response format from ${model}`);
    }

    // ============ RETRY LOGIC ============

    private async requestWithRetry(
        url: string,
        payload: any,
        responseType: 'json' | 'arraybuffer' = 'json'
    ): Promise<any> {
        if (!this.apiToken) {
            throw new Error('HUGGINGFACE_API_TOKEN not set. Add it to your .env file.');
        }

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await axios.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json',
                    },
                    responseType,
                    timeout: 60_000, // 60s — free tier can be slow on cold start
                });
                return response;
            } catch (error: any) {
                const status = (error as AxiosError)?.response?.status;

                // 503 = model loading (free tier cold start), retry after delay
                if (status === 503 && attempt < this.maxRetries) {
                    const delay = this.retryDelayMs * attempt;
                    console.log(`[HuggingFace] Model loading (503), retrying in ${delay}ms... (${attempt}/${this.maxRetries})`);
                    await this.sleep(delay);
                    continue;
                }

                // 429 = rate limit — back off more aggressively
                if (status === 429 && attempt < this.maxRetries) {
                    const delay = this.retryDelayMs * attempt * 2;
                    console.log(`[HuggingFace] Rate limited (429), backing off ${delay}ms...`);
                    await this.sleep(delay);
                    continue;
                }

                throw error;
            }
        }
        throw new Error(`Max retries exhausted for ${url}`);
    }

    // ============ HELPERS ============

    private getAvailableModels(taskType: HFTaskType): string[] {
        const models = HF_MODEL_MAP[taskType] || HF_MODEL_MAP.chat;
        const now = Date.now();
        // Filter out models that recently failed (circuit breaker)
        return models.filter(m => {
            const failedAt = this.failedModels.get(m);
            if (!failedAt) return true;
            if (now - failedAt > this.MODEL_COOLDOWN_MS) {
                this.failedModels.delete(m);
                return true;
            }
            return false;
        });
    }

    private markModelFailed(model: string): void {
        this.failedModels.set(model, Date.now());
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if the HuggingFace API is reachable and the token is valid.
     */
    async healthCheck(): Promise<{ ok: boolean; message: string }> {
        try {
            await axios.get(`${this.baseUrl}/api/whoami-v2`, {
                headers: { Authorization: `Bearer ${this.apiToken}` },
                timeout: 5000,
            });
            return { ok: true, message: 'HuggingFace API bağlantısı başarılı ✅' };
        } catch (error: any) {
            const msg = error?.response?.status === 401
                ? 'Geçersiz HUGGINGFACE_API_TOKEN. .env dosyasını kontrol edin.'
                : `HuggingFace API erişim hatası: ${error.message}`;
            return { ok: false, message: msg };
        }
    }
}

// Singleton
export const huggingFaceAdapter = new HuggingFaceAdapter();
