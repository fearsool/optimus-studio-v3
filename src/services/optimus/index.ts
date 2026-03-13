/**
 * 🤖 OPTIMUS - ANA EXPORT
 * =======================
 * Operations & Production Tactical Intelligence Matrix Universal System
 * 
 * Merkezi Operasyon Zekâsı (COI) - Ana giriş noktası
 */

// ============================================
// CORE EXPORTS
// ============================================

export { optimusCore, default as OptimusCore } from './core/optimusCore';
export { optimusPersonality, default as OptimusPersonality } from './core/optimusPersonality';
export { fallbackBrain, default as FallbackBrain } from './core/optimusFallbackBrain';
export * from './core/optimusTypes';

// ============================================
// INTENT EXPORTS
// ============================================

export { intentResolver, default as IntentResolver } from './intent/optimusIntentResolver';
export { contextTracker, default as ContextTracker } from './intent/optimusContextTracker';
export { intentSeparator, default as IntentSeparator } from './intent/optimusIntentSeparator';

// ============================================
// DECISION EXPORTS
// ============================================

export { decisionEngine, default as DecisionEngine } from './decision/optimusDecisionEngine';
export { riskEvaluator, default as RiskEvaluator } from './decision/optimusRiskEvaluator';
export { priorityResolver, default as PriorityResolver } from './decision/optimusPriorityResolver';

// ============================================
// POLICY EXPORTS
// ============================================

export { policyEngine, default as PolicyEngine } from './policy/optimusPolicyEngine';
export { policySet, FACTORY_POLICIES } from './policy/optimusPolicySet';

// ============================================
// SAFETY EXPORTS
// ============================================

export { authorityMatrix, default as AuthorityMatrix } from './safety/optimusAuthorityMatrix';
export { failSafe, default as FailSafe } from './safety/optimusFailSafe';
export { killSwitch, default as KillSwitch } from './safety/optimusKillSwitch';

// ============================================
// METRICS EXPORTS
// ============================================

export { intelligenceMetrics, default as IntelligenceMetrics } from './metrics/optimusIntelligenceMetrics';

// ============================================
// MODE CONTROLLER
// ============================================

export { modeController, default as ModeController } from './modes/optimusModeController';

// ============================================
// ENHANCER EXPORTS
// ============================================

export { templateEnhancer, default as TemplateEnhancer } from './enhancer/templateEnhancer';

// ============================================
// HUNTER EXPORTS
// ============================================

export { autonomousHunter, default as AutonomousHunter } from './hunter/autonomousHunter';

// ============================================
// CONVENIENCE: UNIFIED OPTIMUS INTERFACE
// ============================================

import { optimusCore } from './core/optimusCore';
import { intentResolver } from './intent/optimusIntentResolver';
import { contextTracker } from './intent/optimusContextTracker';
import { decisionEngine } from './decision/optimusDecisionEngine';
import { policyEngine } from './policy/optimusPolicyEngine';
import { authorityMatrix } from './safety/optimusAuthorityMatrix';
import { failSafe } from './safety/optimusFailSafe';
import { killSwitch } from './safety/optimusKillSwitch';
import { intelligenceMetrics } from './metrics/optimusIntelligenceMetrics';
import { templateEnhancer } from './enhancer/templateEnhancer';
import { autonomousHunter } from './hunter/autonomousHunter';
import { OptimusEvent, OptimusResponse, OptimusMode } from './core/optimusTypes';
import { callHuggingFaceModel } from '../huggingfaceService';

/**
 * Unified OPTIMUS interface for easy access to all components
 */
export const OPTIMUS = {
    // Core
    core: optimusCore,

    // Intent Processing
    intent: {
        resolve: intentResolver.resolve.bind(intentResolver),
        context: contextTracker
    },

    // Decision Making
    decision: {
        engine: decisionEngine,
        pending: () => decisionEngine.getPendingDecisions(),
        approve: (id: string) => decisionEngine.approveDecision(id),
        reject: (id: string, reason?: string) => decisionEngine.rejectDecision(id, reason)
    },

    // Policy & Authority
    policy: policyEngine,
    authority: authorityMatrix,

    // Safety
    safety: {
        failSafe,
        killSwitch,
        emergencyStop: () => killSwitch.activate('user', 'Emergency stop'),
        reset: () => {
            killSwitch.deactivate('user');
            failSafe.reset();
        }
    },

    // Metrics
    metrics: intelligenceMetrics,

    // Template Enhancer (YENİ)
    enhancer: {
        analyze: templateEnhancer.analyzeTemplate.bind(templateEnhancer),
        analyzeAll: templateEnhancer.analyzeAllTemplates.bind(templateEnhancer),
        analyzeWeak: templateEnhancer.analyzeWeakTemplates.bind(templateEnhancer),
        getSummary: templateEnhancer.getOptimusSummary.bind(templateEnhancer),
        formatScore: templateEnhancer.formatScoreCard.bind(templateEnhancer),
        setAI: templateEnhancer.setUseAI.bind(templateEnhancer)
    },

    // Autonomous Hunter (YENİ - Otonom Araştırma)
    hunter: {
        start: autonomousHunter.start.bind(autonomousHunter),
        stop: autonomousHunter.stop.bind(autonomousHunter),
        status: autonomousHunter.getStatus.bind(autonomousHunter),
        run: autonomousHunter.runFullHunt.bind(autonomousHunter),
        getSummary: autonomousHunter.getSummary.bind(autonomousHunter),
        getProblems: autonomousHunter.getDiscoveredProblems.bind(autonomousHunter),
        getTemplates: autonomousHunter.getGeneratedTemplates.bind(autonomousHunter),
        getReports: autonomousHunter.getReports.bind(autonomousHunter),
        approveTemplate: (id: string) => autonomousHunter.updateTemplateStatus(id, 'approved'),
        publishTemplate: (id: string) => autonomousHunter.updateTemplateStatus(id, 'published')
    },

    // Quick Actions
    async start() {
        await optimusCore.start();
    },

    async stop() {
        await optimusCore.stop();
    },

    setMode(mode: OptimusMode, reason?: string) {
        optimusCore.setMode(mode, reason);
    },

    getStatus() {
        return {
            core: optimusCore.getStatus(),
            failSafe: failSafe.getStatus(),
            killSwitch: killSwitch.getStatus(),
            metrics: intelligenceMetrics.getMetrics()
        };
    },

    /**
     * Process a user command through the full pipeline
     */
    async process(input: string, sessionId: string = 'default'): Promise<OptimusResponse> {
        // Create event
        const event = optimusCore.createEvent('USER_COMMAND', { input, sessionId });

        // Get context
        const context = contextTracker.getContext(sessionId);

        // Resolve intent
        const intent = await intentResolver.resolve(input, event);

        // Update context
        contextTracker.updateContext(sessionId, intent);

        // Make decision
        const decision = await decisionEngine.decide(intent);

        // Check policy
        const policyResult = policyEngine.evaluate(decision);

        // Check authority
        const authResult = authorityMatrix.check(intent.action);

        // Check safety
        if (!failSafe.isSafe() || killSwitch.isActive()) {
            return {
                success: false,
                action: 'BLOCK',
                message: 'System is in safety mode',
                shouldSpeak: false,
                timestamp: new Date()
            };
        }

        // Final basic response
        let response: OptimusResponse = {
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

                const aiResponse = await callHuggingFaceModel({
                    task: aiPrompt,
                    timeout: 90000 // 90s timeout for Local CPU inference
                });

                if (aiResponse.success && aiResponse.output) {
                    response.message = aiResponse.output;
                    // Eğer yerel modelden geldiyse logla
                    if (aiResponse.model && aiResponse.model.includes('local')) {
                        console.log('🏁 [Optimus Brain] Response generated by Local LM Studio');
                    }
                } else {
                    response.message = `⚠️ Yerel yapay zeka yanıt veremedi. (Model çok yüklü veya zaman aşımı)`;
                }
            } catch (err: any) {
                console.warn('[Optimus Brain] AI-Response failed:', err);
                response.message = `⚠️ Beyin bağlantı hatası: ${err.message || 'Zaman aşımı'}. (Öneri: 32B model yerine 7B model kullanın)`;
            }
        }

        // ⚡ ACTION EXECUTION (Auto-Execute)
        if (response.success && response.action === 'EXECUTE') {
            try {
                // Hunter Actions
                if (intent.action === 'START_HUNTER') {
                    autonomousHunter.start(6);
                    response.message = 'Avcı protokolü aktif. 6 saatte bir tarama yapılacak.';
                    response.shouldSpeak = true;
                }
                else if (intent.action === 'STOP_HUNTER') {
                    autonomousHunter.stop();
                    response.message = 'Avcı protokolü durduruldu.';
                    response.shouldSpeak = true;
                }
                else if (intent.action === 'RUN_HUNT') {
                    autonomousHunter.runFullHunt();  // Async run
                    response.message = 'Anlık tarama başlatıldı. Rapor birazdan hazırlanacak.';
                    response.shouldSpeak = true;
                }
                else if (intent.action === 'HUNTER_STATUS') {
                    response.message = await autonomousHunter.getSummary();
                }
                else if (intent.action === 'CHECK_STATUS') {
                    const status = optimusCore.getStatus();
                    response.message = `Sistem durumu: ${status.health}. Aktif kararlar: ${status.decisionCount}.`;
                }
            } catch (err: any) {
                console.error('[Optimus] Action execution failed:', err);
                response.message = 'İşlem sırasında bir hata oluştu: ' + err.message;
            }
        }

        return response;
    }
};

export default OPTIMUS;
