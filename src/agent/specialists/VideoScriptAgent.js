"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoScriptAgent = void 0;
const ModelOrchestrator_1 = require("../../lib/local-ai/ModelOrchestrator");
class VideoScriptAgent {
    constructor() {
        this.orchestrator = new ModelOrchestrator_1.ModelOrchestrator();
    }
    async generateScript(topic, style = 'educational') {
        console.log(`[VideoScriptAgent] Generating script for "${topic}" in style "${style}"...`);
        const response = await this.orchestrator.routeRequest('video_script', topic, { style });
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
exports.VideoScriptAgent = VideoScriptAgent;
