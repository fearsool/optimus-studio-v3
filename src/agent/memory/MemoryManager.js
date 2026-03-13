"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManager = void 0;
// src/agent/memory/MemoryManager.ts
const StateStore_1 = require("../state/StateStore");
const WhatsAppConnector_1 = require("../connectors/WhatsAppConnector");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chromadb_1 = require("chromadb");
class MemoryManager {
    // Missing interfaces
    async organizeMemories() { return 0; }
    async clearMemoryCache() { return 0; }
    async summarizeMemory(content) { return 'summary'; }
    buildMemoryFilter(type, importance, timeRange) { return {}; }
    async analyzeMistake(mistake) { return { rootCause: 'unknown' }; }
    async generateSolution(analysis) { return { description: 'fix', action: 'patch', prevention: 'check' }; }
    constructor() {
        // Bellek tipleri
        this.memoryTypes = {
            shortTerm: { ttl: 24 * 60 * 60 * 1000 }, // 24 saat
            mediumTerm: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 gün
            longTerm: { ttl: 30 * 24 * 60 * 60 * 1000 }, // 30 gün
            permanent: { ttl: null } // Kalıcı
        };
        this.stateStore = StateStore_1.StateStore.getInstance();
        this.whatsapp = new WhatsAppConnector_1.WhatsAppConnector();
        this.chromaClient = new chromadb_1.ChromaClient();
        // Bellek koleksiyonunu başlat
        this.initializeMemoryCollection();
    }
    // BELLEK OPTİMİZASYONU
    async optimizeMemory() {
        console.log('🧠 Bellek optimizasyonu başlatılıyor...');
        const result = {
            cleaned: 0,
            compressed: 0,
            organized: 0,
            freedSpace: 0
        };
        try {
            // 1. Süresi dolmuş bellekleri temizle
            result.cleaned = await this.cleanExpiredMemories();
            // 2. Kopya bellekleri birleştir
            result.compressed = await this.deduplicateMemories();
            // 3. Bellekleri kategorize et
            result.organized = await this.organizeMemories();
            // 4. Önbelleği temizle
            result.freedSpace = await this.clearMemoryCache();
            // 5. WhatsApp'tan rapor (çok büyük temizlikse)
            if (result.cleaned > 1000 || result.freedSpace > 100) {
                await this.whatsapp.sendMessage(process.env.USER_PHONE, `🧹 BELLEK TEMİZLİĞİ\n\n` +
                    `Temizlenen: ${result.cleaned} kayıt\n` +
                    `Birleştirilen: ${result.compressed} kayıt\n` +
                    `Düzenlenen: ${result.organized} kategori\n` +
                    `Boşalan Alan: ${result.freedSpace} MB\n\n` +
                    `Sistem belleği optimize edildi.`);
            }
            console.log(`✅ Bellek optimizasyonu tamamlandı`);
            return result;
        }
        catch (error) {
            console.error('Bellek optimizasyonu hatası:', error);
            return result;
        }
    }
    // UZUN VADELİ BELLEK (Vektör Veritabanı)
    async storeLongTermMemory(data) {
        console.log('💾 Uzun vadeli belleğe kaydediliyor...');
        try {
            // 1. Embedding oluştur
            const embedding = await this.generateEmbedding(data.content);
            // 2. ChromaDB'ye kaydet
            const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await this.memoryCollection.add({
                ids: [memoryId],
                embeddings: [embedding],
                metadatas: [{
                        type: data.type,
                        importance: data.importance || 5,
                        timestamp: new Date().toISOString(),
                        tags: data.tags || [],
                        source: data.source || 'agent'
                    }],
                documents: [JSON.stringify(data.content)]
            });
            // 3. StateStore'da referans kaydet
            await this.stateStore.storeMemoryReference({
                id: memoryId,
                type: data.type,
                summary: await this.summarizeMemory(data.content),
                tags: data.tags,
                timestamp: new Date()
            });
            console.log(`✅ Bellek kaydedildi: ${memoryId}`);
            return memoryId;
        }
        catch (error) {
            console.error('Bellek kaydetme hatası:', error);
            throw error;
        }
    }
    // BELLEK GERİ ÇAĞIRMA (Semantik Arama)
    async recallMemory(query, options = {}) {
        console.log('🔍 Bellek geri çağrılıyor:', query);
        try {
            const { limit = 5, type = 'all', minImportance = 3, timeRange = 'all' } = options;
            // 1. Query embedding'i oluştur
            const queryEmbedding = await this.generateEmbedding(query);
            // 2. ChromaDB'de benzerlik araması
            const results = await this.memoryCollection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: limit,
                where: this.buildMemoryFilter(type, minImportance, timeRange)
            });
            // 3. Sonuçları formatla
            const memories = results.ids[0].map((id, index) => ({
                id,
                content: JSON.parse(results.documents[0][index]),
                metadata: results.metadatas[0][index],
                similarity: results.distances ? 1 - results.distances[0][index] : 1,
                timestamp: new Date(results.metadatas[0][index].timestamp)
            }));
            // 4. İlgililik skoruna göre sırala
            memories.sort((a, b) => b.similarity - a.similarity);
            return memories;
        }
        catch (error) {
            console.error('Bellek geri çağırma hatası:', error);
            return [];
        }
    }
    // DERSLER ÖĞRENİLMİŞ (Hatalardan Öğrenme)
    async learnFromMistakes(mistake) {
        console.log('📚 Hatadan öğreniliyor:', mistake.type);
        try {
            // 1. Hatayı analiz et
            const analysis = await this.analyzeMistake(mistake);
            // 2. Çözüm önerisi oluştur
            const solution = await this.generateSolution(analysis);
            // 3. Dersi belleğe kaydet
            const lesson = {
                type: 'lesson_learned',
                mistake: mistake,
                analysis: analysis,
                solution: solution,
                learnedAt: new Date(),
                applied: false
            };
            await this.storeLongTermMemory({
                type: 'lesson',
                content: lesson,
                importance: 9, // Yüksek önem
                tags: ['lesson', 'mistake', mistake.type, solution.action]
            });
            // 4. WhatsApp'tan bildir (önemli hatalar için)
            if (mistake.severity === 'high' || mistake.cost > 100) {
                await this.whatsapp.sendMessage(process.env.USER_PHONE, `📚 YENİ DERS ÖĞRENDİM\n\n` +
                    `Hata: ${mistake.type}\n` +
                    `Maliyet: $${mistake.cost || 0}\n` +
                    `Sebep: ${analysis.rootCause}\n\n` +
                    `Çözüm: ${solution.description}\n` +
                    `Önlem: ${solution.prevention}\n\n` +
                    `Bu hatayı tekrar yapmayacağım.`);
            }
            console.log(`✅ Ders öğrenildi: ${mistake.type}`);
        }
        catch (error) {
            console.error('Ders öğrenme hatası:', error);
        }
    }
    // PRIVATE METHODS
    async initializeMemoryCollection() {
        try {
            // ChromaDB koleksiyonunu oluştur veya getir
            const collectionName = 'optimus_memories';
            try {
                this.memoryCollection = await this.chromaClient.getCollection({
                    name: collectionName,
                    embeddingFunction: { generate: async (texts) => texts.map(() => []) } // Mock embedding function to satisfy type
                });
                console.log(`✅ Bellek koleksiyonu yüklendi: ${collectionName}`);
            }
            catch (_a) {
                // Koleksiyon yok, oluştur
                this.memoryCollection = await this.chromaClient.createCollection({
                    name: collectionName,
                    metadata: {
                        description: 'Optimus Agent long-term memories',
                        created: new Date().toISOString()
                    }
                });
                console.log(`✅ Bellek koleksiyonu oluşturuldu: ${collectionName}`);
            }
        }
        catch (error) {
            console.error('Bellek koleksiyonu başlatma hatası:', error);
            throw error;
        }
    }
    async generateEmbedding(text) {
        // OpenAI veya local embedding model kullan
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text,
                encoding_format: 'float'
            })
        });
        const data = await response.json();
        return data.data[0].embedding;
    }
    async cleanExpiredMemories() {
        let cleaned = 0;
        // StateStore'dan süresi dolmuş bellekleri bul
        const expiredMemories = await this.stateStore.getExpiredMemories();
        // Her birini ChromaDB'den sil
        for (const memory of expiredMemories) {
            try {
                await this.memoryCollection.delete({
                    ids: [memory.id]
                });
                // StateStore referansını da sil
                await this.stateStore.deleteMemoryReference(memory.id);
                cleaned++;
            }
            catch (error) {
                console.error(`Bellek silme hatası ${memory.id}:`, error);
            }
        }
        // Geçici dosyaları temizle
        const tempDir = path_1.default.join(process.cwd(), 'temp');
        if (await fs_extra_1.default.pathExists(tempDir)) {
            const files = await fs_extra_1.default.readdir(tempDir);
            const oldFiles = files.filter(f => {
                const stat = fs_extra_1.default.statSync(path_1.default.join(tempDir, f));
                return Date.now() - stat.mtime.getTime() > 24 * 60 * 60 * 1000; // 24 saat
            });
            for (const file of oldFiles) {
                await fs_extra_1.default.remove(path_1.default.join(tempDir, file));
                cleaned++;
            }
        }
        return cleaned;
    }
    async deduplicateMemories() {
        let compressed = 0;
        // Benzer embedding'lere sahip bellekleri bul
        const allMemories = await this.memoryCollection.get();
        if (allMemories.ids.length < 2)
            return 0;
        // Basit bir deduplication
        const seen = new Set();
        const toDelete = [];
        for (let i = 0; i < allMemories.ids.length; i++) {
            const content = allMemories.documents[i];
            const hash = this.hashContent(content);
            if (seen.has(hash)) {
                toDelete.push(allMemories.ids[i]);
            }
            else {
                seen.add(hash);
            }
        }
        // Kopyaları sil
        if (toDelete.length > 0) {
            await this.memoryCollection.delete({ ids: toDelete });
            compressed = toDelete.length;
        }
        return compressed;
    }
    hashContent(content) {
        // Basit bir hash fonksiyonu
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32-bit integer
        }
        return hash.toString(36);
    }
}
exports.MemoryManager = MemoryManager;
