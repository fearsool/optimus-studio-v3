import fs from 'fs';
import path from 'path';

interface VectorDocument {
    id: string;
    text: string;
    embedding: number[];
    metadata?: any;
}

export class LocalVectorDB {
    private dbPath: string;
    private memory: VectorDocument[] = [];

    constructor(storagePath: string = './local-db.json') {
        this.dbPath = path.resolve(process.cwd(), storagePath);
        this.load();
    }

    private load() {
        if (fs.existsSync(this.dbPath)) {
            try {
                const data = fs.readFileSync(this.dbPath, 'utf-8');
                this.memory = JSON.parse(data);
                console.log(`[LocalVectorDB] Loaded ${this.memory.length} memories.`);
            } catch (e) {
                console.error("[LocalVectorDB] Load failed:", e);
                this.memory = [];
            }
        }
    }

    async save() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.memory, null, 2));
        } catch (e) {
            console.error("[LocalVectorDB] Save failed:", e);
        }
    }

    async add(text: string, embedding: number[], metadata: any = {}) {
        const doc: VectorDocument = {
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
    async search(queryEmbedding: number[], limit: number = 5): Promise<VectorDocument[]> {
        const results = this.memory.map(doc => ({
            ...doc,
            similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}
