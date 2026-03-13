/**
 * 🛡️ MODEL POLICY - Self-Healing & Error Recovery
 * ===============================================
 * Defines what to do when a model fails (OOM, Timeout, etc.)
 */

import { TaskType } from './ModelRouter';

export interface ModelFailureContext {
    task: TaskType;
    model: string;
    errorType: 'oom' | 'timeout' | 'bad_output' | 'unknown';
}

export class ModelPolicy {
    /**
     * Decides the next best action or model tweak based on failure
     */
    static decideRecovery(ctx: ModelFailureContext): {
        nextTask?: TaskType;
        retryWithModel?: string;
        action: 'retry' | 'fallback' | 'abort';
    } {
        console.warn(`[ModelPolicy] Handling failure: ${ctx.model} failed on ${ctx.task} due to ${ctx.errorType}`);

        if (ctx.errorType === 'oom') {
            // If Out of Memory, drop to a smaller model or more efficient task
            return {
                action: 'fallback',
                nextTask: ctx.task === 'code_generation' ? 'chat' : ctx.task
            };
        }

        if (ctx.errorType === 'timeout') {
            // If Timeout, use a faster model
            return {
                action: 'retry',
                nextTask: 'summarization' // Use a lighter version of the task if possible
            };
        }

        if (ctx.errorType === 'bad_output') {
            // If hallucination or bad formatting, use a better reasoning model
            return {
                action: 'fallback',
                nextTask: 'reasoning'
            };
        }

        return { action: 'fallback' };
    }
}
