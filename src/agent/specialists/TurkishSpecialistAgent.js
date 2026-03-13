"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurkishSpecialistAgent = void 0;
const ModelOrchestrator_1 = require("../../lib/local-ai/ModelOrchestrator");
class TurkishSpecialistAgent {
    constructor() {
        this.orchestrator = new ModelOrchestrator_1.ModelOrchestrator();
    }
    async localize(content, audience = 'general') {
        console.log(`[TurkishAgent] Localizing content for ${audience}...`);
        return await this.orchestrator.routeRequest('turkish', content, { audience });
    }
    async generateHooks(topic, count = 3) {
        return await this.orchestrator.routeRequest('turkish', `Write ${count} viral hooks about: ${topic}`, { audience: 'gen-z' });
    }
}
exports.TurkishSpecialistAgent = TurkishSpecialistAgent;
