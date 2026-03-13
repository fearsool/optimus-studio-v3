import { LocalAICluster } from '../../lib/local-ai/LocalAICluster';

class LocalAIManager {
    private static instance: LocalAIManager;
    public cluster: LocalAICluster;

    private constructor() {
        this.cluster = new LocalAICluster();
    }

    public static getInstance(): LocalAIManager {
        if (!LocalAIManager.instance) {
            LocalAIManager.instance = new LocalAIManager();
        }
        return LocalAIManager.instance;
    }

    public async initialize() {
        console.log("Initializing Local AI Manager...");
        const healthy = await this.cluster.checkHealth();
        if (healthy) {
            console.log("Local AI is HEALTHY connected to Ollama");
        } else {
            console.warn("Local AI connection failed. Is Ollama running?");
        }
        return healthy;
    }
}

export const localAIManager = LocalAIManager.getInstance();
