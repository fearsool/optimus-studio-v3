import { pipeline } from '@xenova/transformers';
import { StateStore } from '../state/StateStore';

/**
 * 🧠 NEURAL MEMORY (Vector Store)
 * ==============================
 * Stores conversation embeddings locally using Transformers.js + SQLite.
 * Allows "Semantic Recall" - finding relevant memories by meaning, not just keywords.
 */

export class VectorMemory {
    private static instance: VectorMemory;
    private extractor: any;
    private isReady: boolean = false;

    private constructor() { }

    public static async getInstance(): Promise<VectorMemory> {
        if (!VectorMemory.instance) {
            VectorMemory.instance = new VectorMemory();
            await VectorMemory.instance.init();
        }
        return VectorMemory.instance;
    }

    private async init() {
        if (this.isReady) return;
        try {
            console.log('🧠 [NeuralMemory] Loading embedding model...');
            // Load model (downloads on first run (~50MB))
            // Using lazy loading to avoid blocking startup
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            this.isReady = true;
            console.log('🧠 [NeuralMemory] Model loaded. Ready to remember.');
        } catch (e) {
            console.error('🧠 [NeuralMemory] Failed to load model:', e);
        }
    }

    /**
     * Store a new memory
     */
    public async addMemory(content: string, tags: string[] = []) {
        if (!this.isReady) await this.init();

        try {
            const output = await this.extractor(content, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);

            const db = StateStore.getInstance().getDatabase();
            const stmt = db.prepare('INSERT INTO memories (content, embedding, tags) VALUES (?, ?, ?)');
            stmt.run(content, JSON.stringify(embedding), JSON.stringify(tags));
            // console.log(`🧠 Memory Stored: "${content.substring(0,30)}..."`);
        } catch (e) {
            console.error('Failed to store memory:', e);
        }
    }

    /**
     * Recall relevant memories
     */
    public async search(query: string, limit: number = 3): Promise<string[]> {
        if (!this.isReady) await this.init();

        try {
            const output = await this.extractor(query, { pooling: 'mean', normalize: true });
            const queryEmbedding = Array.from(output.data) as number[];

            const db = StateStore.getInstance().getDatabase();
            const rows = db.prepare('SELECT content, embedding FROM memories').all() as any[];

            if (rows.length === 0) return [];

            // Cosine Similarity Check (In-Memory for simplicity, fast for <10k rows)
            const results = rows.map(row => {
                const vec = JSON.parse(row.embedding);
                const score = this.cosineSimilarity(queryEmbedding, vec);
                return { content: row.content, score };
            });

            return results
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(r => r.content);

        } catch (e) {
            console.error('Memory search failed:', e);
            return [];
        }
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        let dot = 0;
        let magA = 0;
        let magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }
}
