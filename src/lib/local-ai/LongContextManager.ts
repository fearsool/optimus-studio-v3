import { ModelOrchestrator } from './ModelOrchestrator';

export class LongContextManager {
    private orchestrator: ModelOrchestrator;

    constructor(orchestrator: ModelOrchestrator) {
        this.orchestrator = orchestrator;
    }

    async analyzeMarket(topic: string, options: any = {}): Promise<string> {
        console.log(`[LongContext] Running deep analysis on: ${topic}...`);
        return await this.orchestrator.routeRequest(
            'long_context',
            `Conduct a deep market analysis for ${topic}. Context depth: ${options.depth || 'standard'}`,
            options
        );
    }

    async summarizeExtensiveData(data: string): Promise<string> {
        return await this.orchestrator.routeRequest(
            'long_context',
            `Summarize this extensive data while preserving all key insights: ${data.substring(0, 100000)}`
        );
    }
}
