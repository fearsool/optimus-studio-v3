"use strict";
/**
 * ⚡ EXECUTOR
 * ===========
 * Planner'ın oluşturduğu planı adım adım çalıştırır.
 * Her adımda tool'u çağırır ve sonucu kaydeder.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
class Executor {
    constructor(toolRegistry) {
        this.toolRegistry = toolRegistry;
    }
    /**
     * Adım güncellemelerini dinle (UI için)
     */
    onStep(callback) {
        this.onStepUpdate = callback;
    }
    /**
     * Planı çalıştır
     */
    async execute(plan) {
        console.log(`\n⚡ [Executor] Starting plan: "${plan.goal}"`);
        plan.status = 'executing';
        let finalOutput = '';
        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];
            plan.currentStep = i;
            step.status = 'running';
            // UI callback
            if (this.onStepUpdate)
                this.onStepUpdate(step);
            console.log(`   [${i + 1}/${plan.steps.length}] ${step.action} (tool: ${step.tool})`);
            try {
                // Tool'u çalıştır
                if (step.tool !== 'none') {
                    step.result = await this.toolRegistry.execute(step.tool, step.args);
                    const resultStr = typeof step.result === 'object' ? JSON.stringify(step.result, null, 2) : step.result;
                    finalOutput += `Step ${step.id}: ${resultStr}\n`;
                }
                else {
                    step.result = 'No tool needed';
                }
                step.status = 'done';
                console.log(`      ✅ Done`);
            }
            catch (error) {
                step.status = 'failed';
                step.error = error.message;
                console.error(`      ❌ Failed: ${error.message}`);
                // Plan başarısız
                plan.status = 'failed';
                return {
                    success: false,
                    plan,
                    finalOutput: `Plan failed at step ${step.id}: ${error.message}`
                };
            }
            // UI callback
            if (this.onStepUpdate)
                this.onStepUpdate(step);
        }
        plan.status = 'completed';
        console.log(`\n   ✅ Plan completed successfully!`);
        return {
            success: true,
            plan,
            finalOutput: finalOutput || 'Task completed.'
        };
    }
}
exports.Executor = Executor;
