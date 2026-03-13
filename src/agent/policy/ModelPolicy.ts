import { modelRouter, Task } from '../router/ModelRouter'; // Correct path

interface SystemResources {
    gpu: number; // GB
    availableRAM: number; // MB
}

interface ModelPolicyRule {
    condition: (resources: SystemResources | any) => boolean;
    action: string;
    model: string;
}

export class ModelPolicy {
    private static instance: ModelPolicy;
    private policies: ModelPolicyRule[] = [
        {
            condition: (resources: SystemResources) => resources.gpu < 2,
            action: 'switch_to_cpu_model',
            model: 'qwen2.5-coder:1.5b' // Lightweight fallback
        },
        {
            condition: (context: any) => context.tokens > 8000,
            action: 'switch_to_long_context',
            model: 'qwen2.5:14b' // Larger model context
        },
        // {
        //   condition: (error: any) => error.code === 'rate_limit',
        //   action: 'fallback_to_local',
        //   model: 'local-llama'
        // }
    ];

    public static getInstance(): ModelPolicy {
        if (!ModelPolicy.instance) {
            ModelPolicy.instance = new ModelPolicy();
        }
        return ModelPolicy.instance;
    }

    // FIX: Resource-aware switching
    public async selectOptimalModel(task: string, resources: SystemResources): Promise<string> {
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
            } catch (e) { }
        }

        // 4. Default to standard routing
        const routing = await modelRouter.route(task as Task);
        return routing.model;
    }

    // FIX: Retry with fallback
    public async executeWithFallback<T>(
        task: () => Promise<T>,
        fallbacks: Array<{ model: string, task: () => Promise<T> }>
    ): Promise<T> {

        // Try primary
        try {
            return await task();
        } catch (error: any) {
            console.warn(`Primary model failed: ${error.message}`);
        }

        // Try fallbacks
        for (let i = 0; i < fallbacks.length; i++) {
            try {
                console.log(`Attempting fallback ${i + 1}/${fallbacks.length}...`);
                return await fallbacks[i].task();
            } catch (error: any) {
                console.warn(`Fallback ${i} failed: ${error.message}`);
                if (i === fallbacks.length - 1) throw error;
            }
        }

        throw new Error('All fallbacks failed');
    }
}
