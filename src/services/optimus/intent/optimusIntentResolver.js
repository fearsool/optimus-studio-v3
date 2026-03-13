"use strict";
/**
 * 🎯 OPTIMUS INTENT RESOLVER
 * ==========================
 * Niyet çözümleme modülü
 *
 * GÖREV:
 * - Kullanıcı/sistem girdisinden niyet çıkarımı
 * - Entity extraction
 * - Confidence scoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.intentResolver = void 0;
const uuid_1 = require("uuid");
const nemotronService_1 = require("../../nemotronService");
const optimusFallbackBrain_1 = require("../core/optimusFallbackBrain");
const INTENT_PATTERNS = [
    // Production Intents
    { intent: 'START_PRODUCTION', patterns: ['üret', 'produce', 'başlat', 'start', 'çalıştır', 'run'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'STOP_PRODUCTION', patterns: ['durdur', 'stop', 'kapat', 'halt'], priority: 'P0', type: 'SYSTEM' },
    { intent: 'CHECK_STATUS', patterns: ['durum', 'status', 'nasıl', 'how', 'kontrol'], priority: 'P2', type: 'NATURAL' },
    // Analytics Intents
    { intent: 'GET_REPORT', patterns: ['rapor', 'report', 'analiz', 'analysis', 'özet'], priority: 'P2', type: 'NATURAL' },
    { intent: 'GET_METRICS', patterns: ['metrik', 'metric', 'performans', 'performance', 'istatistik'], priority: 'P2', type: 'NATURAL' },
    // Crisis Intents
    { intent: 'ACTIVATE_CRISIS', patterns: ['kriz', 'crisis', 'acil', 'emergency', 'alarm'], priority: 'P0', type: 'SYSTEM' },
    { intent: 'DEACTIVATE_CRISIS', patterns: ['krizden çık', 'crisis off', 'normal', 'normale dön'], priority: 'P0', type: 'SYSTEM' },
    // Mode Intents
    { intent: 'SET_MODE_SILENT', patterns: ['sessiz', 'silent', 'sus', 'quiet'], priority: 'P1', type: 'NATURAL' },
    { intent: 'SET_MODE_ADVISOR', patterns: ['danışman', 'advisor', 'öneri', 'suggest'], priority: 'P1', type: 'NATURAL' },
    { intent: 'SET_MODE_OPERATOR', patterns: ['operatör', 'operator', 'otonom', 'autonomous'], priority: 'P1', type: 'NATURAL' },
    // Factory Intents
    { intent: 'CREATE_PRODUCT', patterns: ['ürün oluştur', 'create product', 'yeni otomasyon', 'new automation'], priority: 'P1', type: 'STRATEGIC' },
    { intent: 'OPTIMIZE', patterns: ['optimize', 'iyileştir', 'improve', 'geliştir'], priority: 'P2', type: 'STRATEGIC' },
    { intent: 'SCALE_UP', patterns: ['ölçeklendir', 'scale', 'artır', 'increase'], priority: 'P1', type: 'STRATEGIC' },
    // 🆕 Factory Expansion Intents
    { intent: 'EXPORT_PACKAGE', patterns: ['paket', 'zip', 'indir', 'export', 'download', 'dışa aktar'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'SCAN_TRENDS', patterns: ['trend', 'fırsat', 'radar', 'tara', 'keşfet', 'scout'], priority: 'P2', type: 'STRATEGIC' },
    { intent: 'LIST_TEMPLATES', patterns: ['şablon', 'template', 'liste', 'göster', 'pazar', 'market'], priority: 'P2', type: 'NATURAL' },
    { intent: 'RUN_FACTORY', patterns: ['fabrika', 'factory', 'üretim hattı', 'production line'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'VAULT_CHECK', patterns: ['kasa', 'vault', 'depo', 'stok', 'envanter'], priority: 'P2', type: 'NATURAL' },
    // 🤖 Autonomous Production Intents (NEW)
    { intent: 'GENERATE_IDEA', patterns: ['fikir üret', 'otomasyon öner', 'yeni fikir', 'brainstorm', 'idea', 'generate idea', 'ne üretelim'], priority: 'P1', type: 'STRATEGIC' },
    { intent: 'SAVE_TO_VAULT', patterns: ['kaydet', 'depola', 'sakla', 'save', 'store', 'vault', 'depoya at', 'kasaya koy'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'AUTO_RESEARCH', patterns: ['araştır', 'research', 'keşfet', 'discover', 'bul', 'find', 'tara'], priority: 'P2', type: 'STRATEGIC' },
    { intent: 'BATCH_PRODUCE', patterns: ['toplu üret', 'batch', 'seri üret', 'mass produce', 'çoklu'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'REPORT_STATUS', patterns: ['rapor ver', 'durum bildir', 'ne yaptın', 'özet ver', 'summary', 'report', 'bilgilendir'], priority: 'P2', type: 'NATURAL' },
    { intent: 'AUTO_REFINE', patterns: ['otomatik rafine', 'auto refine', 'iyileştir', 'geliştir', 'polish'], priority: 'P2', type: 'STRATEGIC' },
    { intent: 'SCHEDULE_TASK', patterns: ['zamanla', 'schedule', 'planla', 'ayarla', 'timer', 'cron'], priority: 'P1', type: 'SYSTEM' },
    // 🔍 Hunter Intents (Otonom Araştırma)
    { intent: 'START_HUNTER', patterns: ['avcıyı başlat', 'hunter start', 'araştırmayı başlat', 'avı başlat', 'otonom başlat'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'STOP_HUNTER', patterns: ['avcıyı durdur', 'hunter stop', 'araştırmayı durdur', 'avı durdur'], priority: 'P1', type: 'SYSTEM' },
    { intent: 'RUN_HUNT', patterns: ['şimdi ara', 'hunt now', 'hemen tara', 'araştırmayı çalıştır', 'av yap'], priority: 'P1', type: 'STRATEGIC' },
    { intent: 'HUNTER_STATUS', patterns: ['hunter durumu', 'avcı durumu', 'ne buldun', 'bulunanlar', 'av raporu'], priority: 'P2', type: 'NATURAL' },
    { intent: 'VIEW_PROBLEMS', patterns: ['problemler', 'sorunlar', 'fırsatlar', 'bulunan problemler'], priority: 'P2', type: 'NATURAL' },
    { intent: 'APPROVE_TEMPLATE', patterns: ['şablonu onayla', 'approve', 'kabul et', 'onay ver'], priority: 'P1', type: 'SYSTEM' },
    // 🧠 General AI Tasks
    { intent: 'AI_TASK', patterns: ['fikir', 'idea', 'yaz', 'write', 'üret', 'generate', 'kod', 'code', 'nedir', 'nasıl', 'what', 'how', 'anlat', 'explain', 'oluştur', 'create', 'öneri', 'tavsiye', 'fikri', 'hakkında', 'konuş', 'söyle'], priority: 'P2', type: 'NATURAL' },
    // Help Intents
    { intent: 'GET_HELP', patterns: ['yardım', 'help', 'ne yapabilirsin', 'what can you do'], priority: 'P3', type: 'NATURAL' },
    { intent: 'EXPLAIN', patterns: ['açıkla', 'explain', 'neden', 'why', 'nasıl', 'how'], priority: 'P3', type: 'NATURAL' }
];
const ENTITY_PATTERNS = [
    // Numbers
    { type: 'NUMBER', pattern: /(\d+)/g, extractor: (m) => parseInt(m[1]) },
    // Time
    { type: 'TIME', pattern: /(\d{1,2}:\d{2})/g, extractor: (m) => m[1] },
    { type: 'DURATION', pattern: /(\d+)\s*(saat|hour|dakika|minute|gün|day)/gi, extractor: (m) => ({ value: parseInt(m[1]), unit: m[2] }) },
    // Percentage
    { type: 'PERCENTAGE', pattern: /%(\d+)|(\d+)%/g, extractor: (m) => parseInt(m[1] || m[2]) },
    // Product/Template names
    { type: 'PRODUCT_NAME', pattern: /"([^"]+)"|'([^']+)'/g, extractor: (m) => m[1] || m[2] }
];
// ============================================
// INTENT RESOLVER CLASS
// ============================================
class OptimusIntentResolver {
    constructor() {
        this.useAI = true;
        this.confidenceThreshold = 0.6;
    }
    /**
     * Resolve intent from raw input
     */
    async resolve(input, event) {
        const normalizedInput = input.toLowerCase().trim();
        // Try AI-based resolution first
        if (this.useAI && !optimusFallbackBrain_1.fallbackBrain.getStatus().isActive) {
            try {
                return await this.resolveWithAI(input, event);
            }
            catch (error) {
                console.warn('[IntentResolver] AI resolution failed, using pattern matching');
            }
        }
        // Fall back to pattern matching
        return this.resolveWithPatterns(normalizedInput);
    }
    /**
     * Resolve using Nemotron AI
     */
    async resolveWithAI(input, event) {
        const startTime = Date.now();
        const result = await nemotronService_1.nemotronService.executeTask({
            task_type: nemotronService_1.NemotronTaskType.INTENT_CLASSIFICATION,
            input: {
                raw_input: input,
                context: (event === null || event === void 0 ? void 0 : event.metadata) || {}
            },
            context_summary: 'Intent classification for OPTIMUS'
        });
        // Check latency - increased for local LLMs
        if (Date.now() - startTime > 60000) {
            optimusFallbackBrain_1.fallbackBrain.checkLatency(Date.now() - startTime);
        }
        if (!result.success) {
            throw new Error('AI intent resolution failed');
        }
        const entities = this.extractEntities(input);
        return {
            id: (0, uuid_1.v4)(),
            type: this.mapIntentType(result.result.intent),
            action: result.result.intent || 'UNKNOWN',
            confidence: result.confidence,
            entities,
            rawInput: input,
            timestamp: new Date()
        };
    }
    /**
     * Resolve using pattern matching (fallback)
     */
    resolveWithPatterns(input) {
        let bestMatch = null;
        let bestScore = 0;
        for (const pattern of INTENT_PATTERNS) {
            const score = this.calculatePatternScore(input, pattern.patterns);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = pattern;
            }
        }
        const entities = this.extractEntities(input);
        if (bestMatch && bestScore > 0.3) {
            return {
                id: (0, uuid_1.v4)(),
                type: bestMatch.type,
                action: bestMatch.intent,
                confidence: bestScore,
                entities,
                rawInput: input,
                timestamp: new Date()
            };
        }
        // Unknown intent
        return {
            id: (0, uuid_1.v4)(),
            type: 'NATURAL',
            action: 'UNKNOWN',
            confidence: 0,
            entities,
            rawInput: input,
            timestamp: new Date()
        };
    }
    /**
     * Calculate pattern matching score
     */
    calculatePatternScore(input, patterns) {
        let matches = 0;
        for (const pattern of patterns) {
            if (input.includes(pattern)) {
                matches++;
            }
        }
        return patterns.length > 0 ? matches / patterns.length : 0;
    }
    /**
     * Extract entities from input
     */
    extractEntities(input) {
        const entities = {};
        for (const entityPattern of ENTITY_PATTERNS) {
            const matches = input.matchAll(entityPattern.pattern);
            const values = [];
            for (const match of matches) {
                values.push(entityPattern.extractor(match));
            }
            if (values.length > 0) {
                entities[entityPattern.type] = values.length === 1 ? values[0] : values;
            }
        }
        return entities;
    }
    /**
     * Map intent string to IntentType
     */
    mapIntentType(intent) {
        const systemIntents = ['START_PRODUCTION', 'STOP_PRODUCTION', 'ACTIVATE_CRISIS', 'DEACTIVATE_CRISIS'];
        const strategicIntents = ['CREATE_PRODUCT', 'OPTIMIZE', 'SCALE_UP'];
        const scheduledIntents = ['SCHEDULED_TASK', 'CRON_JOB'];
        if (systemIntents.includes(intent))
            return 'SYSTEM';
        if (strategicIntents.includes(intent))
            return 'STRATEGIC';
        if (scheduledIntents.includes(intent))
            return 'SCHEDULED';
        return 'NATURAL';
    }
    /**
     * Set AI usage flag
     */
    setUseAI(enabled) {
        this.useAI = enabled;
    }
    /**
     * Set confidence threshold
     */
    setConfidenceThreshold(threshold) {
        this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    }
    /**
     * Check if intent meets confidence threshold
     */
    meetsThreshold(intent) {
        return intent.confidence >= this.confidenceThreshold;
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.intentResolver = new OptimusIntentResolver();
exports.default = exports.intentResolver;
