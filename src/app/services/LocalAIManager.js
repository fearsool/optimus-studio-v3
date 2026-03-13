"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localAIManager = void 0;
const LocalAICluster_1 = require("../../lib/local-ai/LocalAICluster");
class LocalAIManager {
    constructor() {
        this.cluster = new LocalAICluster_1.LocalAICluster();
    }
    static getInstance() {
        if (!LocalAIManager.instance) {
            LocalAIManager.instance = new LocalAIManager();
        }
        return LocalAIManager.instance;
    }
    async initialize() {
        console.log("Initializing Local AI Manager...");
        const healthy = await this.cluster.checkHealth();
        if (healthy) {
            console.log("Local AI is HEALTHY connected to Ollama");
        }
        else {
            console.warn("Local AI connection failed. Is Ollama running?");
        }
        return healthy;
    }
}
exports.localAIManager = LocalAIManager.getInstance();
