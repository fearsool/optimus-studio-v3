"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalVectorDB = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalVectorDB {
    constructor(storagePath = './local-db.json') {
        this.memory = [];
        this.dbPath = path_1.default.resolve(process.cwd(), storagePath);
        this.load();
    }
    load() {
        if (fs_1.default.existsSync(this.dbPath)) {
            try {
                const data = fs_1.default.readFileSync(this.dbPath, 'utf-8');
                this.memory = JSON.parse(data);
                console.log(`[LocalVectorDB] Loaded ${this.memory.length} memories.`);
            }
            catch (e) {
                console.error("[LocalVectorDB] Load failed:", e);
                this.memory = [];
            }
        }
    }
    async save() {
        try {
            fs_1.default.writeFileSync(this.dbPath, JSON.stringify(this.memory, null, 2));
        }
        catch (e) {
            console.error("[LocalVectorDB] Save failed:", e);
        }
    }
    async add(text, embedding, metadata = {}) {
        const doc = {
            id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            embedding,
            metadata
        };
        this.memory.push(doc);
        await this.save();
        return doc.id;
    }
    // Naive Cosine Similarity Search (O(N)) - Good enough for <10k items locally
    async search(queryEmbedding, limit = 5) {
        const results = this.memory.map(doc => ({
            ...doc,
            similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
        }));
        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}
exports.LocalVectorDB = LocalVectorDB;
