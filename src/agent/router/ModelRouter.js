"use strict";
/**
 * 🧠 MODEL ROUTER - Intelligent Model Selection
 * =============================================
 * Selects the optimal model based on task type, available resources, and fallback policies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRouter = exports.ModelRouter = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// =============== MODEL CATALOG ===============
const MODEL_CATALOG = {
    // ═══════════════ CODE MODELS ═══════════════
    'qwen2.5-coder:7b': {
        name: 'qwen2.5-coder:7b',
        size: '7b',
        vramRequired: 5,
        contextLength: 4096, // REDUCED FROM 32768 FOR SAFETY
        speed: 'medium',
        capabilities: ['code_generation', 'code_review'],
        language: ['en', 'tr', 'multi']
    },
    'qwen2.5-coder:14b': {
        name: 'qwen2.5-coder:14b',
        size: '14b',
        vramRequired: 10,
        contextLength: 32768,
        speed: 'slow',
        capabilities: ['code_generation', 'code_review'],
        language: ['en', 'tr', 'multi']
    },
    'deepseek-coder:6.7b': {
        name: 'deepseek-coder:6.7b',
        size: '6.7b',
        vramRequired: 5,
        contextLength: 16384,
        speed: 'medium',
        capabilities: ['code_generation', 'code_review']
    },
    'codellama:7b': {
        name: 'codellama:7b',
        size: '7b',
        vramRequired: 5,
        contextLength: 16384,
        speed: 'medium',
        capabilities: ['code_generation', 'code_review']
    },
    // ═══════════════ PLANNING & REASONING ═══════════════
    'deepseek-r1:7b': {
        name: 'deepseek-r1:7b',
        size: '7b',
        vramRequired: 5,
        contextLength: 32768,
        speed: 'slow',
        capabilities: ['reasoning', 'planning']
    },
    'deepseek-r1:14b': {
        name: 'deepseek-r1:14b',
        size: '14b',
        vramRequired: 10,
        contextLength: 65536,
        speed: 'slow',
        capabilities: ['reasoning', 'planning', 'long_context']
    },
    'mixtral:8x7b': {
        name: 'mixtral:8x7b',
        size: '8x7b',
        vramRequired: 26,
        contextLength: 32768,
        speed: 'medium',
        capabilities: ['planning', 'reasoning', 'chat']
    },
    // ═══════════════ TURKISH & MULTILINGUAL ═══════════════
    'mistral:latest': {
        name: 'mistral:latest',
        size: '7b',
        vramRequired: 5,
        contextLength: 32768,
        speed: 'fast',
        capabilities: ['planning', 'chat', 'chat_turkish', 'summarization'],
        language: ['en', 'tr', 'fr', 'de']
    },
    'mistral-nemo:12b': {
        name: 'mistral-nemo:12b',
        size: '12b',
        vramRequired: 8,
        contextLength: 128000,
        speed: 'medium',
        capabilities: ['chat_turkish', 'long_context', 'reasoning'],
        language: ['en', 'tr', 'multi']
    },
    // ═══════════════ LONG CONTEXT ═══════════════
    'llama3.1:70b': {
        name: 'llama3.1:70b',
        size: '70b',
        vramRequired: 40,
        contextLength: 128000,
        speed: 'slow',
        capabilities: ['long_context', 'reasoning', 'planning', 'summarization']
    },
    'llama3.1:8b': {
        name: 'llama3.1:8b',
        size: '8b',
        vramRequired: 5,
        contextLength: 128000,
        speed: 'medium',
        capabilities: ['long_context', 'chat', 'summarization']
    },
    // ═══════════════ GENERAL CHAT ═══════════════
    'llama3.2:3b': {
        name: 'llama3.2:3b',
        size: '3b',
        vramRequired: 2.5,
        contextLength: 8192,
        speed: 'fast',
        capabilities: ['chat', 'summarization', 'translation']
    },
    'qwen2.5:7b': {
        name: 'qwen2.5:7b',
        size: '7b',
        vramRequired: 5,
        contextLength: 32768,
        speed: 'medium',
        capabilities: ['chat', 'reasoning', 'planning', 'chat_turkish'],
        language: ['en', 'tr', 'zh', 'multi']
    },
    'qwen2.5:3b': {
        name: 'qwen2.5:3b',
        size: '3b',
        vramRequired: 2.5,
        contextLength: 32768,
        speed: 'fast',
        capabilities: ['chat', 'chat_turkish', 'summarization'],
        language: ['en', 'tr', 'multi']
    },
    // ═══════════════ VIDEO / CREATIVE ═══════════════
    'gemma3:4b': {
        name: 'gemma3:4b',
        size: '4b',
        vramRequired: 4,
        contextLength: 8192,
        speed: 'fast',
        capabilities: ['video_script', 'chat', 'summarization']
    },
    'gemma2:9b': {
        name: 'gemma2:9b',
        size: '9b',
        vramRequired: 6,
        contextLength: 8192,
        speed: 'medium',
        capabilities: ['video_script', 'chat', 'summarization']
    },
    'phi3:mini': {
        name: 'phi3:mini',
        size: '3.8b',
        vramRequired: 3,
        contextLength: 4096,
        speed: 'fast',
        capabilities: ['video_script', 'chat']
    },
    // ═══════════════ VISION ═══════════════
    'llava:7b': {
        name: 'llava:7b',
        size: '7b',
        vramRequired: 5,
        contextLength: 4096,
        speed: 'slow',
        capabilities: ['vision']
    },
    'bakllava:7b': {
        name: 'bakllava:7b',
        size: '7b',
        vramRequired: 5,
        contextLength: 4096,
        speed: 'slow',
        capabilities: ['vision']
    },
    // ═══════════════ EMBEDDING ═══════════════
    'nomic-embed-text': {
        name: 'nomic-embed-text',
        size: '137m',
        vramRequired: 0.5,
        contextLength: 8192,
        speed: 'fast',
        capabilities: ['embedding']
    },
    'mxbai-embed-large': {
        name: 'mxbai-embed-large',
        size: '335m',
        vramRequired: 1,
        contextLength: 512,
        speed: 'fast',
        capabilities: ['embedding']
    }
};
// =============== TASK → MODEL PRIORITY (USER PREFERENCES) ===============
const TASK_MODEL_PRIORITY = {
    // 💻 KOD: Qwen2.5-Coder öncelikli
    code_generation: ['qwen2.5-coder:7b', 'qwen2.5-coder:14b', 'deepseek-coder:6.7b', 'codellama:7b'],
    code_review: ['qwen2.5-coder:7b', 'qwen2.5-coder:14b', 'deepseek-coder:6.7b'],
    // 📋 PLANLAMA: Qwen2.5-Coder veya DeepSeek
    planning: ['qwen2.5-coder:7b', 'deepseek-r1:7b', 'deepseek-r1:14b', 'mixtral:8x7b', 'mistral:latest'],
    // 🧠 AKIL YÜRÜTME: DeepSeek-R1 öncelikli
    reasoning: ['deepseek-r1:14b', 'deepseek-r1:7b', 'qwen2.5:7b', 'mistral:latest'],
    // 🇹🇷 TÜRKÇE KONUŞMA: RAM Tasarrufu için Qwen 3B (Hızlı)
    chat_turkish: ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:latest'],
    // 💬 GENEL CHAT: RAM Tasarrufu için Qwen 3B
    chat: ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:latest'],
    // 📚 UZUN BAĞLAM: Llama 70B veya Mistral-Nemo
    long_context: ['llama3.1:70b', 'llama3.1:8b', 'mistral-nemo:12b', 'deepseek-r1:14b'],
    // 🎬 VİDEO SENARYO: Yaratıcı modeller
    video_script: ['gemma3:4b', 'gemma2:9b', 'phi3:mini', 'mistral:latest', 'qwen2.5:7b'],
    // 👁️ GÖRSEL: Vision modelleri
    vision: ['llava:7b', 'bakllava:7b'],
    // 🔤 EMBEDDING: Hızlı embed modelleri
    embedding: ['nomic-embed-text', 'mxbai-embed-large'],
    // 📝 ÖZETLEME
    summarization: ['mistral:latest', 'llama3.2:3b', 'llama3.1:8b'],
    // 🌐 ÇEVİRİ
    translation: ['qwen2.5:7b', 'mistral:latest', 'llama3.2:3b']
};
// =============== MODEL ROUTER CLASS ===============
class ModelRouter {
    constructor() {
        this.installedModels = new Set();
        this.systemResources = null;
        this.lastResourceCheck = 0;
        this.RESOURCE_CHECK_INTERVAL = 30000; // 30 seconds
        this.refreshInstalledModels();
    }
    /**
     * Get the best model for a given task
     */
    async route(task, opts) {
        var _a, _b, _c, _d;
        const preferSpeed = (opts === null || opts === void 0 ? void 0 : opts.preferSpeed) || false;
        const tokenEstimate = (opts === null || opts === void 0 ? void 0 : opts.tokenEstimate) || 0;
        // Refresh resources if stale
        await this.ensureResourcesFresh();
        const priorityList = TASK_MODEL_PRIORITY[task] || TASK_MODEL_PRIORITY.chat;
        const availableVram = ((_a = this.systemResources) === null || _a === void 0 ? void 0 : _a.availableVram) || 6;
        // Try each model in priority order
        for (const modelName of priorityList) {
            const modelInfo = MODEL_CATALOG[modelName];
            if (!modelInfo)
                continue;
            // Check if model is installed
            if (!this.installedModels.has(modelName))
                continue;
            // Check VRAM requirements
            if (modelInfo.vramRequired > availableVram && ((_b = this.systemResources) === null || _b === void 0 ? void 0 : _b.gpuName) !== 'No GPU / CPU Mode')
                continue;
            // Smart RAM Check for CPU Mode (Don't load 70B on 8GB RAM)
            if (((_c = this.systemResources) === null || _c === void 0 ? void 0 : _c.gpuName) === 'No GPU / CPU Mode') {
                const availableRam = ((_d = this.systemResources) === null || _d === void 0 ? void 0 : _d.availableRam) || 8;
                if (modelInfo.vramRequired > availableRam)
                    continue; // Approximate VRAM requirement as RAM in CPU mode
            }
            // Token Length Awareness
            if (tokenEstimate > 0 && tokenEstimate > modelInfo.contextLength)
                continue;
            // If preferSpeed, skip slow models unless no other option
            if (preferSpeed && modelInfo.speed === 'slow' && priorityList.length > 1)
                continue;
            return {
                model: modelName,
                reason: `Best match for ${task} with ${availableVram.toFixed(1)}GB available VRAM`,
                fallbackUsed: false,
                availableVram
            };
        }
        // Fallback: Try any installed model that fits VRAM
        for (const modelName of this.installedModels) {
            const modelInfo = MODEL_CATALOG[modelName];
            if (modelInfo && modelInfo.vramRequired <= availableVram) {
                return {
                    model: modelName,
                    reason: `Fallback model (primary models unavailable for ${task})`,
                    fallbackUsed: true,
                    availableVram
                };
            }
        }
        // Ultimate fallback: smallest model
        return {
            model: 'mistral:latest',
            reason: 'Ultimate fallback - no suitable models available (defaulting to installed mistral)',
            fallbackUsed: true,
            availableVram
        };
    }
    /**
     * Get model for a specific task with retry logic
     */
    async routeWithRetry(task, maxRetries = 3) {
        const models = [];
        const priorityList = TASK_MODEL_PRIORITY[task] || TASK_MODEL_PRIORITY.chat;
        for (let i = 0; i < Math.min(maxRetries, priorityList.length); i++) {
            if (this.installedModels.has(priorityList[i])) {
                models.push(priorityList[i]);
            }
        }
        // Add ultimate fallback
        if (models.length < maxRetries) {
            models.push('mistral:latest');
        }
        return models;
    }
    /**
     * Refresh the list of installed models from Ollama
     */
    async refreshInstalledModels() {
        try {
            const { stdout } = await execAsync('ollama list');
            const lines = stdout.split('\n').slice(1); // Skip header
            this.installedModels.clear();
            for (const line of lines) {
                const modelName = line.split(/\s+/)[0];
                if (modelName) {
                    this.installedModels.add(modelName);
                }
            }
            console.log(`[ModelRouter] Found ${this.installedModels.size} installed models`);
        }
        catch (error) {
            console.error('[ModelRouter] Failed to get installed models:', error);
        }
    }
    /**
     * Check system resources (GPU/RAM)
     */
    async checkResources() {
        try {
            // Try nvidia-smi for GPU info
            const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader,nounits');
            const [gpuName, totalVram, freeVram] = stdout.trim().split(',').map(s => s.trim());
            this.systemResources = {
                gpuName: gpuName || 'Unknown GPU',
                totalVram: parseInt(totalVram) / 1024, // Convert MB to GB
                availableVram: parseInt(freeVram) / 1024,
                totalRam: 16, // Default
                availableRam: 8 // Default
            };
        }
        catch (_a) {
            // No NVIDIA GPU or nvidia-smi not available
            this.systemResources = {
                gpuName: 'No GPU / CPU Mode',
                totalVram: 0,
                availableVram: 0,
                totalRam: 16,
                availableRam: 8
            };
        }
        this.lastResourceCheck = Date.now();
        return this.systemResources;
    }
    /**
     * Ensure resources are fresh
     */
    async ensureResourcesFresh() {
        if (!this.systemResources || Date.now() - this.lastResourceCheck > this.RESOURCE_CHECK_INTERVAL) {
            await this.checkResources();
            await this.refreshInstalledModels(); // Refresh model list too
        }
    }
    /**
     * Get model info
     */
    getModelInfo(modelName) {
        return MODEL_CATALOG[modelName];
    }
    /**
     * Check if a model supports a task
     */
    supportsTask(modelName, task) {
        const info = MODEL_CATALOG[modelName];
        return (info === null || info === void 0 ? void 0 : info.capabilities.includes(task)) || false;
    }
    /**
     * Get all models suitable for a task
     */
    getModelsForTask(task) {
        return Object.entries(MODEL_CATALOG)
            .filter(([_, info]) => info.capabilities.includes(task))
            .map(([name]) => name);
    }
    /**
     * Get current system status
     */
    async getStatus() {
        await this.ensureResourcesFresh();
        return {
            installedModels: Array.from(this.installedModels),
            resources: this.systemResources
        };
    }
    /**
     * Execute a query using the optimal model for the task
     */
    async query(task, prompt, options) {
        try {
            // Determine model
            let modelName = options === null || options === void 0 ? void 0 : options.model;
            if (!modelName) {
                const result = await this.route(task);
                modelName = result.model;
            }
            console.log(`[ModelRouter] Querying ${modelName} for task: ${task}`);
            // Escape quotes for shell command
            const safePrompt = prompt.replace(/"/g, '\\"');
            // Execute via Ollama
            // Note: This is a simple implementation. For production, use a proper HTTP client.
            const { stdout } = await execAsync(`ollama run ${modelName} "${safePrompt}"`);
            return { content: stdout.trim() };
        }
        catch (error) {
            console.error('[ModelRouter] Query failed:', error);
            return { content: "Error executing model query." };
        }
    }
}
exports.ModelRouter = ModelRouter;
// =============== SINGLETON INSTANCE ===============
exports.modelRouter = new ModelRouter();
