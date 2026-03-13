import { ModelOrchestrator } from '../../lib/local-ai/ModelOrchestrator';

export class TurkishSpecialistAgent {
    private orchestrator: ModelOrchestrator;

    constructor() {
        this.orchestrator = new ModelOrchestrator();
    }

    async localize(content: string, audience: 'gen-z' | 'general' = 'general'): Promise<string> {
        console.log(`[TurkishAgent] Localizing content for ${audience}...`);

        return await this.orchestrator.routeRequest(
            'turkish',
            content,
            { audience }
        );
    }

    async generateHooks(topic: string, count: number = 3): Promise<string> {
        return await this.orchestrator.routeRequest(
            'turkish',
            `Write ${count} viral hooks about: ${topic}`,
            { audience: 'gen-z' }
        );
    }
}
