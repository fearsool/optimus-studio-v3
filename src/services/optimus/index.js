"use strict";
/**
 * 🤖 OPTIMUS - ANA EXPORT
 * =======================
 * Operations & Production Tactical Intelligence Matrix Universal System
 *
 * Merkezi Operasyon Zekâsı (COI) - Ana giriş noktası
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIMUS = exports.AutonomousHunter = exports.autonomousHunter = exports.TemplateEnhancer = exports.templateEnhancer = exports.ModeController = exports.modeController = exports.IntelligenceMetrics = exports.intelligenceMetrics = exports.KillSwitch = exports.killSwitch = exports.FailSafe = exports.failSafe = exports.AuthorityMatrix = exports.authorityMatrix = exports.FACTORY_POLICIES = exports.policySet = exports.PolicyEngine = exports.policyEngine = exports.PriorityResolver = exports.priorityResolver = exports.RiskEvaluator = exports.riskEvaluator = exports.DecisionEngine = exports.decisionEngine = exports.IntentSeparator = exports.intentSeparator = exports.ContextTracker = exports.contextTracker = exports.IntentResolver = exports.intentResolver = exports.FallbackBrain = exports.fallbackBrain = exports.OptimusPersonality = exports.optimusPersonality = exports.OptimusCore = exports.optimusCore = void 0;
// ============================================
// CORE EXPORTS
// ============================================
var optimusCore_1 = require("./core/optimusCore");
Object.defineProperty(exports, "optimusCore", { enumerable: true, get: function () { return optimusCore_1.optimusCore; } });
Object.defineProperty(exports, "OptimusCore", { enumerable: true, get: function () { return __importDefault(optimusCore_1).default; } });
var optimusPersonality_1 = require("./core/optimusPersonality");
Object.defineProperty(exports, "optimusPersonality", { enumerable: true, get: function () { return optimusPersonality_1.optimusPersonality; } });
Object.defineProperty(exports, "OptimusPersonality", { enumerable: true, get: function () { return __importDefault(optimusPersonality_1).default; } });
var optimusFallbackBrain_1 = require("./core/optimusFallbackBrain");
Object.defineProperty(exports, "fallbackBrain", { enumerable: true, get: function () { return optimusFallbackBrain_1.fallbackBrain; } });
Object.defineProperty(exports, "FallbackBrain", { enumerable: true, get: function () { return __importDefault(optimusFallbackBrain_1).default; } });
__exportStar(require("./core/optimusTypes"), exports);
// ============================================
// INTENT EXPORTS
// ============================================
var optimusIntentResolver_1 = require("./intent/optimusIntentResolver");
Object.defineProperty(exports, "intentResolver", { enumerable: true, get: function () { return optimusIntentResolver_1.intentResolver; } });
Object.defineProperty(exports, "IntentResolver", { enumerable: true, get: function () { return __importDefault(optimusIntentResolver_1).default; } });
var optimusContextTracker_1 = require("./intent/optimusContextTracker");
Object.defineProperty(exports, "contextTracker", { enumerable: true, get: function () { return optimusContextTracker_1.contextTracker; } });
Object.defineProperty(exports, "ContextTracker", { enumerable: true, get: function () { return __importDefault(optimusContextTracker_1).default; } });
var optimusIntentSeparator_1 = require("./intent/optimusIntentSeparator");
Object.defineProperty(exports, "intentSeparator", { enumerable: true, get: function () { return optimusIntentSeparator_1.intentSeparator; } });
Object.defineProperty(exports, "IntentSeparator", { enumerable: true, get: function () { return __importDefault(optimusIntentSeparator_1).default; } });
// ============================================
// DECISION EXPORTS
// ============================================
var optimusDecisionEngine_1 = require("./decision/optimusDecisionEngine");
Object.defineProperty(exports, "decisionEngine", { enumerable: true, get: function () { return optimusDecisionEngine_1.decisionEngine; } });
Object.defineProperty(exports, "DecisionEngine", { enumerable: true, get: function () { return __importDefault(optimusDecisionEngine_1).default; } });
var optimusRiskEvaluator_1 = require("./decision/optimusRiskEvaluator");
Object.defineProperty(exports, "riskEvaluator", { enumerable: true, get: function () { return optimusRiskEvaluator_1.riskEvaluator; } });
Object.defineProperty(exports, "RiskEvaluator", { enumerable: true, get: function () { return __importDefault(optimusRiskEvaluator_1).default; } });
var optimusPriorityResolver_1 = require("./decision/optimusPriorityResolver");
Object.defineProperty(exports, "priorityResolver", { enumerable: true, get: function () { return optimusPriorityResolver_1.priorityResolver; } });
Object.defineProperty(exports, "PriorityResolver", { enumerable: true, get: function () { return __importDefault(optimusPriorityResolver_1).default; } });
// ============================================
// POLICY EXPORTS
// ============================================
var optimusPolicyEngine_1 = require("./policy/optimusPolicyEngine");
Object.defineProperty(exports, "policyEngine", { enumerable: true, get: function () { return optimusPolicyEngine_1.policyEngine; } });
Object.defineProperty(exports, "PolicyEngine", { enumerable: true, get: function () { return __importDefault(optimusPolicyEngine_1).default; } });
var optimusPolicySet_1 = require("./policy/optimusPolicySet");
Object.defineProperty(exports, "policySet", { enumerable: true, get: function () { return optimusPolicySet_1.policySet; } });
Object.defineProperty(exports, "FACTORY_POLICIES", { enumerable: true, get: function () { return optimusPolicySet_1.FACTORY_POLICIES; } });
// ============================================
// SAFETY EXPORTS
// ============================================
var optimusAuthorityMatrix_1 = require("./safety/optimusAuthorityMatrix");
Object.defineProperty(exports, "authorityMatrix", { enumerable: true, get: function () { return optimusAuthorityMatrix_1.authorityMatrix; } });
Object.defineProperty(exports, "AuthorityMatrix", { enumerable: true, get: function () { return __importDefault(optimusAuthorityMatrix_1).default; } });
var optimusFailSafe_1 = require("./safety/optimusFailSafe");
Object.defineProperty(exports, "failSafe", { enumerable: true, get: function () { return optimusFailSafe_1.failSafe; } });
Object.defineProperty(exports, "FailSafe", { enumerable: true, get: function () { return __importDefault(optimusFailSafe_1).default; } });
var optimusKillSwitch_1 = require("./safety/optimusKillSwitch");
Object.defineProperty(exports, "killSwitch", { enumerable: true, get: function () { return optimusKillSwitch_1.killSwitch; } });
Object.defineProperty(exports, "KillSwitch", { enumerable: true, get: function () { return __importDefault(optimusKillSwitch_1).default; } });
// ============================================
// METRICS EXPORTS
// ============================================
var optimusIntelligenceMetrics_1 = require("./metrics/optimusIntelligenceMetrics");
Object.defineProperty(exports, "intelligenceMetrics", { enumerable: true, get: function () { return optimusIntelligenceMetrics_1.intelligenceMetrics; } });
Object.defineProperty(exports, "IntelligenceMetrics", { enumerable: true, get: function () { return __importDefault(optimusIntelligenceMetrics_1).default; } });
// ============================================
// MODE CONTROLLER
// ============================================
var optimusModeController_1 = require("./modes/optimusModeController");
Object.defineProperty(exports, "modeController", { enumerable: true, get: function () { return optimusModeController_1.modeController; } });
Object.defineProperty(exports, "ModeController", { enumerable: true, get: function () { return __importDefault(optimusModeController_1).default; } });
// ============================================
// ENHANCER EXPORTS
// ============================================
var templateEnhancer_1 = require("./enhancer/templateEnhancer");
Object.defineProperty(exports, "templateEnhancer", { enumerable: true, get: function () { return templateEnhancer_1.templateEnhancer; } });
Object.defineProperty(exports, "TemplateEnhancer", { enumerable: true, get: function () { return __importDefault(templateEnhancer_1).default; } });
// ============================================
// HUNTER EXPORTS
// ============================================
var autonomousHunter_1 = require("./hunter/autonomousHunter");
Object.defineProperty(exports, "autonomousHunter", { enumerable: true, get: function () { return autonomousHunter_1.autonomousHunter; } });
Object.defineProperty(exports, "AutonomousHunter", { enumerable: true, get: function () { return __importDefault(autonomousHunter_1).default; } });
// ============================================
// CONVENIENCE: UNIFIED OPTIMUS INTERFACE
// ============================================
const optimusCore_2 = require("./core/optimusCore");
const optimusIntentResolver_2 = require("./intent/optimusIntentResolver");
const optimusContextTracker_2 = require("./intent/optimusContextTracker");
const optimusDecisionEngine_2 = require("./decision/optimusDecisionEngine");
const optimusPolicyEngine_2 = require("./policy/optimusPolicyEngine");
const optimusAuthorityMatrix_2 = require("./safety/optimusAuthorityMatrix");
const optimusFailSafe_2 = require("./safety/optimusFailSafe");
const optimusKillSwitch_2 = require("./safety/optimusKillSwitch");
const optimusIntelligenceMetrics_2 = require("./metrics/optimusIntelligenceMetrics");
const templateEnhancer_2 = require("./enhancer/templateEnhancer");
const autonomousHunter_2 = require("./hunter/autonomousHunter");
const huggingfaceService_1 = require("../huggingfaceService");
/**
 * Unified OPTIMUS interface for easy access to all components
 */
exports.OPTIMUS = {
    // Core
    core: optimusCore_2.optimusCore,
    // Intent Processing
    intent: {
        resolve: optimusIntentResolver_2.intentResolver.resolve.bind(optimusIntentResolver_2.intentResolver),
        context: optimusContextTracker_2.contextTracker
    },
    // Decision Making
    decision: {
        engine: optimusDecisionEngine_2.decisionEngine,
        pending: () => optimusDecisionEngine_2.decisionEngine.getPendingDecisions(),
        approve: (id) => optimusDecisionEngine_2.decisionEngine.approveDecision(id),
        reject: (id, reason) => optimusDecisionEngine_2.decisionEngine.rejectDecision(id, reason)
    },
    // Policy & Authority
    policy: optimusPolicyEngine_2.policyEngine,
    authority: optimusAuthorityMatrix_2.authorityMatrix,
    // Safety
    safety: {
        failSafe: optimusFailSafe_2.failSafe,
        killSwitch: optimusKillSwitch_2.killSwitch,
        emergencyStop: () => optimusKillSwitch_2.killSwitch.activate('user', 'Emergency stop'),
        reset: () => {
            optimusKillSwitch_2.killSwitch.deactivate('user');
            optimusFailSafe_2.failSafe.reset();
        }
    },
    // Metrics
    metrics: optimusIntelligenceMetrics_2.intelligenceMetrics,
    // Template Enhancer (YENİ)
    enhancer: {
        analyze: templateEnhancer_2.templateEnhancer.analyzeTemplate.bind(templateEnhancer_2.templateEnhancer),
        analyzeAll: templateEnhancer_2.templateEnhancer.analyzeAllTemplates.bind(templateEnhancer_2.templateEnhancer),
        analyzeWeak: templateEnhancer_2.templateEnhancer.analyzeWeakTemplates.bind(templateEnhancer_2.templateEnhancer),
        getSummary: templateEnhancer_2.templateEnhancer.getOptimusSummary.bind(templateEnhancer_2.templateEnhancer),
        formatScore: templateEnhancer_2.templateEnhancer.formatScoreCard.bind(templateEnhancer_2.templateEnhancer),
        setAI: templateEnhancer_2.templateEnhancer.setUseAI.bind(templateEnhancer_2.templateEnhancer)
    },
    // Autonomous Hunter (YENİ - Otonom Araştırma)
    hunter: {
        start: autonomousHunter_2.autonomousHunter.start.bind(autonomousHunter_2.autonomousHunter),
        stop: autonomousHunter_2.autonomousHunter.stop.bind(autonomousHunter_2.autonomousHunter),
        status: autonomousHunter_2.autonomousHunter.getStatus.bind(autonomousHunter_2.autonomousHunter),
        run: autonomousHunter_2.autonomousHunter.runFullHunt.bind(autonomousHunter_2.autonomousHunter),
        getSummary: autonomousHunter_2.autonomousHunter.getSummary.bind(autonomousHunter_2.autonomousHunter),
        getProblems: autonomousHunter_2.autonomousHunter.getDiscoveredProblems.bind(autonomousHunter_2.autonomousHunter),
        getTemplates: autonomousHunter_2.autonomousHunter.getGeneratedTemplates.bind(autonomousHunter_2.autonomousHunter),
        getReports: autonomousHunter_2.autonomousHunter.getReports.bind(autonomousHunter_2.autonomousHunter),
        approveTemplate: (id) => autonomousHunter_2.autonomousHunter.updateTemplateStatus(id, 'approved'),
        publishTemplate: (id) => autonomousHunter_2.autonomousHunter.updateTemplateStatus(id, 'published')
    },
    // Quick Actions
    async start() {
        await optimusCore_2.optimusCore.start();
    },
    async stop() {
        await optimusCore_2.optimusCore.stop();
    },
    setMode(mode, reason) {
        optimusCore_2.optimusCore.setMode(mode, reason);
    },
    getStatus() {
        return {
            core: optimusCore_2.optimusCore.getStatus(),
            failSafe: optimusFailSafe_2.failSafe.getStatus(),
            killSwitch: optimusKillSwitch_2.killSwitch.getStatus(),
            metrics: optimusIntelligenceMetrics_2.intelligenceMetrics.getMetrics()
        };
    },
    /**
     * Process a user command through the full pipeline
     */
    async process(input, sessionId = 'default') {
        // Create event
        const event = optimusCore_2.optimusCore.createEvent('USER_COMMAND', { input, sessionId });
        // Get context
        const context = optimusContextTracker_2.contextTracker.getContext(sessionId);
        // Resolve intent
        const intent = await optimusIntentResolver_2.intentResolver.resolve(input, event);
        // Update context
        optimusContextTracker_2.contextTracker.updateContext(sessionId, intent);
        // Make decision
        const decision = await optimusDecisionEngine_2.decisionEngine.decide(intent);
        // Check policy
        const policyResult = optimusPolicyEngine_2.policyEngine.evaluate(decision);
        // Check authority
        const authResult = optimusAuthorityMatrix_2.authorityMatrix.check(intent.action);
        // Check safety
        if (!optimusFailSafe_2.failSafe.isSafe() || optimusKillSwitch_2.killSwitch.isActive()) {
            return {
                success: false,
                action: 'BLOCK',
                message: 'System is in safety mode',
                shouldSpeak: false,
                timestamp: new Date()
            };
        }
        // Final basic response
        let response = {
            success: authResult.granted && policyResult.action !== 'BLOCK',
            action: policyResult.action,
            message: policyResult.reason,
            decision,
            shouldSpeak: decision.priority === 'P0',
            timestamp: new Date()
        };
        // 🧠 AI RESPONSE GENERATION (The real brain)
        if (response.success) {
            try {
                const aiPrompt = `Sen bir otonom fabrika yönetim sistemi olan OPTIMUS'sun.
User Input: "${input}"
Detected Intent: ${intent.action}
Decision Priority: ${decision.priority}

Talimat: Kullanıcıya profesyonel, analitik ve hafif futuristik bir dille kısa ve zekice bir yanıt ver. 
Eğer bu bir komutsa (avcı başlatıldıysa vb.), işlemin başladığını teyit et.
Yanıtın içinde mutlaka yerel bir beyin (Gemma 3) kullandığını ve fabrikanın tam kapasite çalıştığını hissettir.`;
                const aiResponse = await (0, huggingfaceService_1.callHuggingFaceModel)({
                    task: aiPrompt,
                    timeout: 90000 // 90s timeout for Local CPU inference
                });
                if (aiResponse.success && aiResponse.output) {
                    response.message = aiResponse.output;
                    // Eğer yerel modelden geldiyse logla
                    if (aiResponse.model && aiResponse.model.includes('local')) {
                        console.log('🏁 [Optimus Brain] Response generated by Local LM Studio');
                    }
                }
                else {
                    response.message = `⚠️ Yerel yapay zeka yanıt veremedi. (Model çok yüklü veya zaman aşımı)`;
                }
            }
            catch (err) {
                console.warn('[Optimus Brain] AI-Response failed:', err);
                response.message = `⚠️ Beyin bağlantı hatası: ${err.message || 'Zaman aşımı'}. (Öneri: 32B model yerine 7B model kullanın)`;
            }
        }
        // ⚡ ACTION EXECUTION (Auto-Execute)
        if (response.success && response.action === 'EXECUTE') {
            try {
                // Hunter Actions
                if (intent.action === 'START_HUNTER') {
                    autonomousHunter_2.autonomousHunter.start(6);
                    response.message = 'Avcı protokolü aktif. 6 saatte bir tarama yapılacak.';
                    response.shouldSpeak = true;
                }
                else if (intent.action === 'STOP_HUNTER') {
                    autonomousHunter_2.autonomousHunter.stop();
                    response.message = 'Avcı protokolü durduruldu.';
                    response.shouldSpeak = true;
                }
                else if (intent.action === 'RUN_HUNT') {
                    autonomousHunter_2.autonomousHunter.runFullHunt(); // Async run
                    response.message = 'Anlık tarama başlatıldı. Rapor birazdan hazırlanacak.';
                    response.shouldSpeak = true;
                }
                else if (intent.action === 'HUNTER_STATUS') {
                    response.message = await autonomousHunter_2.autonomousHunter.getSummary();
                }
                else if (intent.action === 'CHECK_STATUS') {
                    const status = optimusCore_2.optimusCore.getStatus();
                    response.message = `Sistem durumu: ${status.health}. Aktif kararlar: ${status.decisionCount}.`;
                }
            }
            catch (err) {
                console.error('[Optimus] Action execution failed:', err);
                response.message = 'İşlem sırasında bir hata oluştu: ' + err.message;
            }
        }
        return response;
    }
};
exports.default = exports.OPTIMUS;
