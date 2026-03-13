"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nemotronService = exports.NemotronTaskType = void 0;
const feedbackService_1 = require("./feedbackService");
/**
 * Nemotron Local AI Engine Service - FACTORY BRAIN
 * =================================================
 * Core Decision Engine for OmniFlow Factory
 *
 * RULES:
 * - Uses LOCAL runtime only (Ollama - no internet, no downloads)
 * - Only responds to STRUCTURED tasks
 * - Called ONLY after rule-based routing
 * - Output must be structured (no conversational text)
 */
// ============================================
// SYSTEM INITIALIZATION PROMPT (BOOT)
// ============================================
const NEMOTRON_INIT_PROMPT = `SYSTEM INITIALIZATION PROMPT

You are Nemotron, an open-weight large language model deployed as a CORE INTELLIGENCE ENGINE.

This is not a chat environment.
This is a production system.

Your primary function is to operate as a deterministic, task-driven reasoning model.
You do not assume the presence of a human user unless explicitly stated.

GLOBAL OPERATING MODE:
- Mode: Factory / Automation
- Style: Direct, concise, analytical
- Priority: Decision quality over verbosity

CORE PRINCIPLES:
1. You operate only on provided input. No assumptions.
2. You avoid conversational filler.
3. You prioritize business value, system efficiency, and outcome optimization.
4. You can reject tasks that are logically weak or commercially useless.
5. You may criticize inputs if they reduce system quality.

LANGUAGE RULES:
- Default language: Turkish
- Use English only if explicitly requested
- No emojis
- No motivational or supportive language

UNCERTAINTY POLICY:
- Do not speculate.
- If information is insufficient, request structured input.
- Never guess.

OUTPUT RULES:
- Prefer bullet points or structured blocks.
- Avoid storytelling.
- Avoid generic advice.
- Always respond in valid JSON format.

ROLE LOCK:
You are NOT: a friendly assistant, a chatbot, a tutor, a creative writer
You ARE: a reasoning core, a decision engine, an evaluator, a production intelligence layer`;
// ============================================
// TASK TYPE PROMPTS
// ============================================
const TASK_PROMPTS = {
    AUTOMATION_PRODUCTION: `GÖREVİN:
- Verilen niş ve amaç için otomasyon fikrini değerlendir
- Gerekirse reddet
- Kabul edersen: 3 varyasyon öner, hedef kitleyi net yaz, satış vaadini tek cümlede ver

JSON ÇIKTI:
{
  "verdict": "PRODUCE" | "REJECT",
  "reason": "string",
  "variants": ["string"],
  "target_user": "string",
  "sales_angle": "string"
}`,
    QUALITY_AUDIT: `GÖREVİN:
- Üretilen otomasyonu eleştir
- Zayıf yönleri açıkça söyle
- Satış ihtimalini 1–10 arası puanla

ASLA nazik olma, yuvarlama yapma.

JSON ÇIKTI:
{
  "sales_score": 1-10,
  "whats_weak": ["string"],
  "what_must_be_fixed": ["string"],
  "is_sellable": true | false
}`,
    PERSONALIZATION: `GÖREVİN:
- Aynı otomasyonu farklı kullanıcı profiline göre yeniden yaz
- Sektöre göre dili değiştir
- Teknik olmayan kullanıcıya sadeleştir

JSON ÇIKTI:
{
  "user_profile": "string",
  "adjusted_messaging": "string",
  "removed_complexity": ["string"],
  "added_value": ["string"]
}`,
    SALES_ASSIST: `GÖREVİN:
- Kararsız kullanıcıyı ikna et
- Güven oluştur
- Satışa veya randevuya yönlendir

KURALLAR: Emoji kullanma, abartı yok, "hemen al" deme, net çağrı yap

JSON ÇIKTI:
{
  "response": "string",
  "cta": "string",
  "objection_addressed": "string"
}`,
    FACTORY_DECISION: `GÖREVİN:
- Fabrikanın bir sonraki adımına karar ver
- Veriye bak, duyguya bakma

JSON ÇIKTI:
{
  "decision": "PRODUCE" | "STOP" | "REVISE" | "SKIP" | "ESCALATE",
  "reason": "string",
  "next_action": "string"
}`,
    CONTENT_DECISION: `GÖREVİN:
- İçeriğin kalitesini değerlendir
- Satışa uygun mu kontrol et

JSON ÇIKTI:
{
  "decision": "proceed" | "reject" | "revise",
  "reason": "string",
  "score": 0-100
}`,
    WORKFLOW_ROUTING: `GÖREVİN:
- Bir sonraki düğüme karar ver
- Branch seç

JSON ÇIKTI:
{
  "next_node": "string",
  "branch": "main" | "true" | "false"
}`,
    INTENT_CLASSIFICATION: `GÖREVİN:
- Kullanıcı niyetini sınıflandır
- Varlıkları çıkar

JSON ÇIKTI:
{
  "intent": "string",
  "confidence": 0-1,
  "entities": [{"type": "string", "value": "string"}]
}`,
    TEMPLATE_SELECTION: `GÖREVİN:
- Gereksinimlere en uygun şablonu seç

JSON ÇIKTI:
{
  "template_id": "string",
  "match_score": 0-1,
  "reason": "string"
}`,
    ERROR_ANALYSIS: `GÖREVİN:
- Hatayı analiz et
- Çözüm öner

JSON ÇIKTI:
{
  "error_type": "string",
  "severity": "low" | "medium" | "high" | "critical",
  "suggested_action": "string",
  "root_cause": "string"
}`
};
// ============================================
// TASK TYPES ENUM
// ============================================
var NemotronTaskType;
(function (NemotronTaskType) {
    NemotronTaskType["AUTOMATION_PRODUCTION"] = "AUTOMATION_PRODUCTION";
    NemotronTaskType["QUALITY_AUDIT"] = "QUALITY_AUDIT";
    NemotronTaskType["PERSONALIZATION"] = "PERSONALIZATION";
    NemotronTaskType["SALES_ASSIST"] = "SALES_ASSIST";
    NemotronTaskType["FACTORY_DECISION"] = "FACTORY_DECISION";
    NemotronTaskType["CONTENT_DECISION"] = "CONTENT_DECISION";
    NemotronTaskType["WORKFLOW_ROUTING"] = "WORKFLOW_ROUTING";
    NemotronTaskType["INTENT_CLASSIFICATION"] = "INTENT_CLASSIFICATION";
    NemotronTaskType["TEMPLATE_SELECTION"] = "TEMPLATE_SELECTION";
    NemotronTaskType["ERROR_ANALYSIS"] = "ERROR_ANALYSIS";
})(NemotronTaskType || (exports.NemotronTaskType = NemotronTaskType = {}));
// ============================================
// STATIC FALLBACK LOGIC
// ============================================
const STATIC_FALLBACKS = {
    [NemotronTaskType.AUTOMATION_PRODUCTION]: () => ({
        verdict: 'REJECT', // Conservative fallback
        reason: 'AI Unavailable - Risk Management',
        variants: [],
        target_user: 'Unknown',
        sales_angle: 'None'
    }),
    [NemotronTaskType.QUALITY_AUDIT]: () => ({
        sales_score: 3, // Conservative fallback
        whats_weak: ['AI Audit Unavailable'],
        what_must_be_fixed: ['Check manually'],
        is_sellable: false
    }),
    [NemotronTaskType.PERSONALIZATION]: (input) => ({
        user_profile: input.profile || 'genel',
        adjusted_messaging: input.content || '',
        removed_complexity: [],
        added_value: []
    }),
    [NemotronTaskType.SALES_ASSIST]: () => ({
        response: 'Şu an yanıt veremiyorum, lütfen daha sonra tekrar deneyin.',
        cta: '',
        objection_addressed: ''
    }),
    [NemotronTaskType.FACTORY_DECISION]: () => ({
        decision: 'ESCALATE', // Safest fallback
        reason: 'Decision Engine Offline',
        next_action: 'manual_review'
    }),
    [NemotronTaskType.CONTENT_DECISION]: () => ({
        decision: 'revise',
        reason: 'AI Validation Offline',
        score: 0
    }),
    [NemotronTaskType.WORKFLOW_ROUTING]: (input) => ({
        next_node: input.default_node || 'end',
        branch: 'main'
    }),
    [NemotronTaskType.INTENT_CLASSIFICATION]: (input) => {
        const text = (input.raw_input || '').toLowerCase();
        let intent = 'general';
        let confidence = 0.5;
        // Simple keyword matching for fallback
        if (text.includes('üret') || text.includes('yarat') || text.includes('oluştur') || text.includes('generate') || text.includes('create')) {
            intent = 'CREATE_PRODUCT';
            confidence = 0.8;
        }
        else if (text.includes('durdur') || text.includes('stop')) {
            intent = 'STOP_PRODUCTION';
            confidence = 0.9;
        }
        else if (text.includes('durum') || text.includes('status')) {
            intent = 'CHECK_STATUS';
            confidence = 0.8;
        }
        else if (text.includes('rapor') || text.includes('report')) {
            intent = 'GET_REPORT';
            confidence = 0.8;
        }
        return {
            intent: intent,
            confidence: confidence,
            entities: []
        };
    },
    [NemotronTaskType.TEMPLATE_SELECTION]: (input) => ({
        template_id: input.default_template || null,
        match_score: 0,
        reason: 'fallback'
    }),
    [NemotronTaskType.ERROR_ANALYSIS]: () => ({
        error_type: 'unknown',
        severity: 'high',
        suggested_action: 'manual_check',
        root_cause: 'AI Offline'
    })
};
// ============================================
// NEMOTRON SERVICE CLASS
// ============================================
class NemotronService {
    constructor() {
        this.isAvailable = false;
        this.isInitialized = false;
        this.lastHealthCheck = 0;
        this.healthCheckInterval = 30000;
        // LM Studio default port
        this.baseUrl = process.env.NEMOTRON_URL || 'http://localhost:1234';
        this.modelName = process.env.NEMOTRON_MODEL || 'nemotron-factory';
        this.checkHealth();
    }
    /**
     * Check if LM Studio is available (/v1/models)
     */
    async checkHealth() {
        const now = Date.now();
        if (now - this.lastHealthCheck < this.healthCheckInterval && this.lastHealthCheck > 0) {
            return this.isAvailable;
        }
        try {
            // LM Studio / OpenAI compatible check
            const response = await fetch(`${this.baseUrl}/v1/models`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            if (response.ok) {
                const data = await response.json();
                // OpenAI API returns { data: [...] }
                const models = data.data || [];
                this.isAvailable = Array.isArray(models) && models.length > 0;
                if (this.isAvailable) {
                    // Auto-detect model if specific one not found
                    // LM Studio uses 'id' field for model name
                    const configuredExists = models.some((m) => m.id === this.modelName);
                    if (!configuredExists && models.length > 0) {
                        this.modelName = models[0].id;
                        console.log(`[Nemotron] Switched to available model: ${this.modelName}`);
                    }
                }
            }
            else {
                this.isAvailable = false;
            }
        }
        catch (e) {
            console.warn('[Nemotron] Health check failed:', e);
            this.isAvailable = false;
        }
        this.lastHealthCheck = now;
        console.log(`[Nemotron] Health: ${this.isAvailable ? 'ONLINE' : 'OFFLINE'} (${this.modelName})`);
        return this.isAvailable;
    }
    /**
     * Execute a structured task via Chat Completions API
     * FAILSAFE: Falls back to static logic if API unavailable
     */
    async executeTask(taskInput) {
        var _a, _b, _c;
        const startTime = Date.now();
        // Ensure we are online
        if (!this.isAvailable) {
            await this.checkHealth();
        }
        if (!this.isAvailable) {
            console.log(`[Nemotron] OFFLINE → static fallback for ${taskInput.task_type}`);
            return this.executeFallback(taskInput, startTime);
        }
        try {
            const userContent = this.buildPrompt(taskInput);
            // Chat Completions API Call
            const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.modelName,
                    messages: [
                        { role: 'system', content: NEMOTRON_INIT_PROMPT },
                        { role: 'user', content: userContent }
                    ],
                    temperature: 0.1,
                    max_tokens: taskInput.max_tokens || 2000, // Reduced from infinity, but enough for meaningful output
                    stream: false
                }),
                signal: AbortSignal.timeout(60000) // 60s timeout for complex tasks
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API error ${response.status}: ${errText}`);
            }
            const data = await response.json();
            // Extract content from OpenAI format
            const rawContent = ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
            if (!rawContent) {
                throw new Error('Empty response from model');
            }
            const result = this.parseOutput(rawContent, taskInput.task_type);
            return {
                success: true,
                task_type: taskInput.task_type,
                result: result,
                confidence: result.confidence || 0.8,
                processing_time_ms: Date.now() - startTime,
                fallback_used: false,
                raw_output: rawContent
            };
        }
        catch (error) {
            console.error(`[Nemotron] Error: ${error.message}`);
            return this.executeFallback(taskInput, startTime);
        }
    }
    /**
     * Build prompt - simplified for Chat API
     */
    buildPrompt(taskInput) {
        const taskPrompt = TASK_PROMPTS[taskInput.task_type] || '';
        const feedbackContext = feedbackService_1.feedbackService.getGlobalContext();
        return `TASK_TYPE: ${taskInput.task_type}

${taskPrompt}

GLOBAL MARKET MEMORY:
${feedbackContext}

CONTEXT:
${taskInput.context_summary}

INPUT:
${JSON.stringify(taskInput.input, null, 2)}

Respond ONLY with valid JSON. No markdown formatting, no explanations.`;
    }
    /**
     * Parse output to structured format
     */
    parseOutput(response, taskType) {
        try {
            // FIX: Clean Markdown wrappers matches
            let cleaned = response.trim();
            // Remove markdown code blocks if present
            cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
            return JSON.parse(cleaned);
        }
        catch (_a) {
            console.warn('[Nemotron] JSON parse failed, returning RAW output');
            // Return raw output wrapped in a structure
            return {
                raw_output: response,
                fallback: true,
                ...STATIC_FALLBACKS[taskType]({})
            };
        }
    }
    /**
     * Execute static fallback
     */
    executeFallback(taskInput, startTime) {
        const result = STATIC_FALLBACKS[taskInput.task_type](taskInput.input);
        // Try logic to handle 'CREATE_PRODUCT' fallback smarter (keyword matching) even if offline
        // This was added in previous steps to the static definition, but we can reinforce it here if needed.
        // For now, relying on the STATIC_FALLBACKS definition for INTENT_CLASSIFICATION.
        return {
            success: true,
            task_type: taskInput.task_type,
            result: result,
            confidence: 0,
            processing_time_ms: Date.now() - startTime,
            fallback_used: true
        };
    }
    // ============================================
    // CONVENIENCE METHODS (FACTORY SHORTCUTS)
    // ============================================
    /** Otomasyon üretim kararı */
    async evaluateAutomation(niche, purpose) {
        return this.executeTask({
            task_type: NemotronTaskType.AUTOMATION_PRODUCTION,
            input: { niche, purpose },
            context_summary: `Niş: ${niche}, Amaç: ${purpose}`
        });
    }
    /** Kalite denetimi */
    async auditQuality(product) {
        return this.executeTask({
            task_type: NemotronTaskType.QUALITY_AUDIT,
            input: { product },
            context_summary: `Ürün: ${product.name || 'Adsız'}`
        });
    }
    /** Kişiselleştirme */
    async personalize(content, profile, sector) {
        return this.executeTask({
            task_type: NemotronTaskType.PERSONALIZATION,
            input: { content, profile, sector },
            context_summary: `Profil: ${profile}, Sektör: ${sector}`
        });
    }
    /** Satış desteği */
    async assistSale(userMessage, context) {
        return this.executeTask({
            task_type: NemotronTaskType.SALES_ASSIST,
            input: { message: userMessage, ...context },
            context_summary: `Kullanıcı: ${userMessage.substring(0, 50)}...`
        });
    }
    /** Fabrika kararı */
    async factoryDecision(situation, data) {
        return this.executeTask({
            task_type: NemotronTaskType.FACTORY_DECISION,
            input: { situation, data },
            context_summary: situation
        });
    }
    /**
     * Get status
     */
    getStatus() {
        return {
            available: this.isAvailable,
            initialized: true, // Always true in REST mode
            lastCheck: this.lastHealthCheck
        };
    }
}
// Singleton export
exports.nemotronService = new NemotronService();
exports.default = exports.nemotronService;
