import { ModelOrchestrator } from '../../lib/local-ai/ModelOrchestrator';

export class VideoScriptAgent {
    private orchestrator: ModelOrchestrator;

    constructor() {
        this.orchestrator = new ModelOrchestrator();
    }

    async generateScript(topic: string, style: string = 'educational'): Promise<any> {
        console.log(`[VideoScriptAgent] Generating script for "${topic}" in style "${style}"...`);

        const response = await this.orchestrator.routeRequest(
            'video_script',
            topic,
            { style }
        );

        // Parse logic (Assuming model returns text, we might need to structure it)
        // For now, return raw text, but ideally we'd parse JSON if model follows instruction well.
        return {
            topic,
            style,
            rawScript: response,
            timestamp: new Date().toISOString()
        };
    }
}
