/**
 * ⚡ EXECUTOR
 * ===========
 * Planner'ın oluşturduğu planı adım adım çalıştırır.
 * Her adımda tool'u çağırır ve sonucu kaydeder.
 */

import { Plan, PlanStep } from '../planner/Planner';
import { ToolRegistry } from '../tools/ToolRegistry';

export interface ExecutionResult {
    success: boolean;
    plan: Plan;
    finalOutput: string;
}

export class Executor {
    private toolRegistry: ToolRegistry;
    private onStepUpdate?: (step: PlanStep) => void;

    constructor(toolRegistry: ToolRegistry) {
        this.toolRegistry = toolRegistry;
    }

    /**
     * Adım güncellemelerini dinle (UI için)
     */
    onStep(callback: (step: PlanStep) => void) {
        this.onStepUpdate = callback;
    }

    /**
     * Planı çalıştır
     */
    async execute(plan: Plan): Promise<ExecutionResult> {
        console.log(`\n⚡ [Executor] Starting plan: "${plan.goal}"`);
        plan.status = 'executing';

        let finalOutput = '';

        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];
            plan.currentStep = i;
            step.status = 'running';

            // UI callback
            if (this.onStepUpdate) this.onStepUpdate(step);

            console.log(`   [${i + 1}/${plan.steps.length}] ${step.action} (tool: ${step.tool})`);

            try {
                // Tool'u çalıştır
                if (step.tool !== 'none') {
                    step.result = await this.toolRegistry.execute(step.tool, step.args);
                    const resultStr = typeof step.result === 'object' ? JSON.stringify(step.result, null, 2) : step.result;
                    finalOutput += `Step ${step.id}: ${resultStr}\n`;
                } else {
                    step.result = 'No tool needed';
                }

                step.status = 'done';
                console.log(`      ✅ Done`);

            } catch (error: any) {
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
            if (this.onStepUpdate) this.onStepUpdate(step);
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
