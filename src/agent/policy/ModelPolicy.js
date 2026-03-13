"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPolicy = void 0;
const ModelRouter_1 = require("../router/ModelRouter"); // Correct path
class ModelPolicy {
    constructor() {
        this.policies = [
            {
                condition: (resources) => resources.gpu < 2,
                action: 'switch_to_cpu_model',
                model: 'qwen2.5-coder:1.5b' // Lightweight fallback
            },
            {
                condition: (context) => context.tokens > 8000,
                action: 'switch_to_long_context',
                model: 'qwen2.5:14b' // Larger model context
            },
            // {
            //   condition: (error: any) => error.code === 'rate_limit',
            //   action: 'fallback_to_local',
            //   model: 'local-llama'
            // }
        ];
    }
    static getInstance() {
        if (!ModelPolicy.instance) {
            ModelPolicy.instance = new ModelPolicy();
        }
        return ModelPolicy.instance;
    }
    // FIX: Resource-aware switching
    async selectOptimalModel(task, resources) {
        // 1. Check resource constraints
        if (resources.availableRAM < 4000) {
            return 'qwen2.5-coder:1.5b'; // Minimum RAM
        }
        // 2. Check task requirements
        // if (task === 'video_generation' && resources.gpu >= 4) {
        //   return 'stable-diffusion-xl';
        // }
        // 3. Apply policies
        for (const policy of this.policies) {
            try {
                if (policy.condition(resources)) {
                    return policy.model;
                }
            }
            catch (e) { }
        }
        // 4. Default to standard routing
        const routing = await ModelRouter_1.modelRouter.route(task);
        return routing.model;
    }
    // FIX: Retry with fallback
    async executeWithFallback(task, fallbacks) {
        // Try primary
        try {
            return await task();
        }
        catch (error) {
            console.warn(`Primary model failed: ${error.message}`);
        }
        // Try fallbacks
        for (let i = 0; i < fallbacks.length; i++) {
            try {
                console.log(`Attempting fallback ${i + 1}/${fallbacks.length}...`);
                return await fallbacks[i].task();
            }
            catch (error) {
                console.warn(`Fallback ${i} failed: ${error.message}`);
                if (i === fallbacks.length - 1)
                    throw error;
            }
        }
        throw new Error('All fallbacks failed');
    }
}
exports.ModelPolicy = ModelPolicy;
