"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorMemory = void 0;
const transformers_1 = require("@xenova/transformers");
const StateStore_1 = require("../state/StateStore");
/**
 * 🧠 NEURAL MEMORY (Vector Store)
 * ==============================
 * Stores conversation embeddings locally using Transformers.js + SQLite.
 * Allows "Semantic Recall" - finding relevant memories by meaning, not just keywords.
 */
class VectorMemory {
    constructor() {
        this.isReady = false;
    }
    static async getInstance() {
        if (!VectorMemory.instance) {
            VectorMemory.instance = new VectorMemory();
            await VectorMemory.instance.init();
        }
        return VectorMemory.instance;
    }
    async init() {
        if (this.isReady)
            return;
        try {
            console.log('🧠 [NeuralMemory] Loading embedding model...');
            // Load model (downloads on first run (~50MB))
            // Using lazy loading to avoid blocking startup
            this.extractor = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            this.isReady = true;
            console.log('🧠 [NeuralMemory] Model loaded. Ready to remember.');
        }
        catch (e) {
            console.error('🧠 [NeuralMemory] Failed to load model:', e);
        }
    }
    /**
     * Store a new memory
     */
    async addMemory(content, tags = []) {
        if (!this.isReady)
            await this.init();
        try {
            const output = await this.extractor(content, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);
            const db = StateStore_1.StateStore.getInstance().getDatabase();
            const stmt = db.prepare('INSERT INTO memories (content, embedding, tags) VALUES (?, ?, ?)');
            stmt.run(content, JSON.stringify(embedding), JSON.stringify(tags));
            // console.log(`🧠 Memory Stored: "${content.substring(0,30)}..."`);
        }
        catch (e) {
            console.error('Failed to store memory:', e);
        }
    }
    /**
     * Recall relevant memories
     */
    async search(query, limit = 3) {
        if (!this.isReady)
            await this.init();
        try {
            const output = await this.extractor(query, { pooling: 'mean', normalize: true });
            const queryEmbedding = Array.from(output.data);
            const db = StateStore_1.StateStore.getInstance().getDatabase();
            const rows = db.prepare('SELECT content, embedding FROM memories').all();
            if (rows.length === 0)
                return [];
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
        }
        catch (e) {
            console.error('Memory search failed:', e);
            return [];
        }
    }
    cosineSimilarity(a, b) {
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
exports.VectorMemory = VectorMemory;
