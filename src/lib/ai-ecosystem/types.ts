
// src/lib/ai-ecosystem/types.ts

export type TaskType = 'coding' | 'planning' | 'turkish' | 'video_script' | 'long_context' | 'analysis' | 'translation';

export interface ModelConfig {
    name: string;
    provider: 'ollama' | 'openai' | 'anthropic';
    quantization?: string;
    context: number;
    temperature: number;
    maxTokens: number;
    gpu_layers?: number;
}

export interface ModelResponse {
    response: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    meta?: any;
}

export interface ModelInstance {
    generate(prompt: string, options: any): Promise<ModelResponse>;
}

export interface VideoScript {
    topic: string;
    content: string;
    complexity: number;
    quality_score?: number;
    optimizations?: any;
    hooks?: string[];
    localized?: any;
}

export interface FactoryCodeRequirements {
    script: VideoScript;
    workflow: any;
    requirements: {
        auto_upload: boolean;
        analytics: boolean;
        scheduling: boolean;
    };
}

export interface GeneratedCode {
    code: string;
    tests: string;
    documentation: string;
    performance: any;
}

export interface ComfyUIWorkflow {
    nodes: any[];
    links: any[];
}

export interface LocalizedContent {
    content: string;
    localization_level: number;
    engagement_score: number;
    hashtags: string[];
    cultural_fit: number;
}

export interface DocumentAnalysis {
    summary?: string;
    insights?: any[];
    structure?: any;
}

export interface KnowledgeBase {
    structured: any;
    embeddings: any;
    search_index: any;
    last_updated: Date;
}
