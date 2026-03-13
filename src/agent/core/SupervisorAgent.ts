import { modelRouter } from '../router/ModelRouter';
import { LLMService } from './LLMService';
import { huggingFaceAdapter } from './HuggingFaceAdapter';
import { TurkishSpecialistAgent } from '../specialists/TurkishSpecialistAgent';
import { VideoScriptAgent } from '../specialists/VideoScriptAgent';

export type SpecialistType = 'coding' | 'turkish' | 'video' | 'planning' | 'chat' | 'unknown';

export interface TaskDelegation {
    specialist: SpecialistType;
    reason: string;
    subTasks?: string[];
}

export class SupervisorAgent {
    private llmService: LLMService;
    private turkishAgent: TurkishSpecialistAgent;
    private videoAgent: VideoScriptAgent;

    constructor() {
        this.llmService = new LLMService();
        this.turkishAgent = new TurkishSpecialistAgent();
        this.videoAgent = new VideoScriptAgent();
    }

    /**
     * Analyze user input and delegate to appropriate specialists.
     */
    async delegate(input: string): Promise<TaskDelegation> {
        console.log(`[Supervisor] 🕵️ Analyzing request: "${input.substring(0, 50)}..."`);

        // Prompt for routing
        const routingPrompt = `
        You are the Supervisor Agent of Optimus Studio. 
        Your job is to analyze the user request and delegate it to the best specialist.
        
        Specialists:
        - 'coding': For programming, debugging, or script generation.
        - 'turkish': For content in Turkish, translation, or localization.
        - 'video': For video scripts, creative scenarios, or visual planning.
        - 'planning': For complex projects requiring a multi-step plan.
        - 'chat': For general conversation or information.

        User Request: "${input}"

        Respond ONLY with a JSON object in this format:
        {
          "specialist": "specialist_type",
          "reason": "why this specialist",
          "subTasks": ["step 1", "step 2"]
        }
        `;

        try {
            // Prefer Hugging Face for supervisor logic if available
            let decision;
            if (process.env.HUGGINGFACE_API_TOKEN) {
                const hfResult = await huggingFaceAdapter.generate(routingPrompt, 'planning');
                decision = this.parseJson(hfResult.content);
            } else {
                const response = await this.llmService.chat([{ role: 'system', content: 'You are a routing supervisor.' }, { role: 'user', content: routingPrompt }], 'qwen2.5-coder:7b');
                decision = this.parseJson(response);
            }

            console.log(`[Supervisor] 🎯 Delegating to: ${decision.specialist}`);
            return decision;

        } catch (error) {
            console.error('[Supervisor] Delegation failed, falling back to general chat.', error);
            return { specialist: 'chat', reason: 'Fallback due to error' };
        }
    }

    private parseJson(text: string): any {
        try {
            // Clean markdown if present
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            return JSON.parse(cleanJson);
        } catch (e) {
            console.warn('[Supervisor] Failed to parse JSON, returning default routing.');
            return { specialist: 'chat', reason: 'Parsing error' };
        }
    }

    async executeDelegatedTask(delegation: TaskDelegation, input: string): Promise<string> {
        switch (delegation.specialist) {
            case 'turkish':
                return await this.turkishAgent.localize(input);
            case 'video':
                const videoResult = await this.videoAgent.generateScript(input);
                return videoResult.rawScript;
            case 'coding':
            case 'planning':
            case 'chat':
            default:
                // Use default AgentCore logic or direct LLM
                return await this.llmService.chat([{ role: 'user', content: input }]);
        }
    }
}

export const supervisorAgent = new SupervisorAgent();
