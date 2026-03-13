"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongContextManager = void 0;
class LongContextManager {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
    }
    async analyzeMarket(topic, options = {}) {
        console.log(`[LongContext] Running deep analysis on: ${topic}...`);
        return await this.orchestrator.routeRequest('long_context', `Conduct a deep market analysis for ${topic}. Context depth: ${options.depth || 'standard'}`, options);
    }
    async summarizeExtensiveData(data) {
        return await this.orchestrator.routeRequest('long_context', `Summarize this extensive data while preserving all key insights: ${data.substring(0, 100000)}`);
    }
}
exports.LongContextManager = LongContextManager;
