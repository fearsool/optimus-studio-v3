"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeAIOrchestrator = exports.QuantumServerless = exports.MultiCloudManager = void 0;
// src/lib/quantum-cloud/mock/MultiCloudManager.ts
class MultiCloudManager {
    constructor(config) { }
    async deploy(code) { return { provider: 'mixed', status: 'deployed' }; }
}
exports.MultiCloudManager = MultiCloudManager;
// src/lib/quantum-cloud/mock/QuantumServerless.ts
class QuantumServerless {
    constructor(config) { }
    async deploy(code) { return { type: 'serverless', status: 'hot' }; }
}
exports.QuantumServerless = QuantumServerless;
// src/lib/quantum-cloud/mock/EdgeAIOrchestrator.ts
class EdgeAIOrchestrator {
    async deploy(code) { return { type: 'edge', status: 'active' }; }
}
exports.EdgeAIOrchestrator = EdgeAIOrchestrator;
