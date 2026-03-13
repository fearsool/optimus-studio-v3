/**
 * 🤖 OPTIMUS CORE - CENTRAL ORCHESTRATOR
 * ======================================
 * Operations & Production Tactical Intelligence Matrix Universal System
 * 
 * Event-driven architecture with lifecycle management
 * 
 * AKIŞ:
 * Event → IntentResolver → DecisionEngine → PolicyEngine → AuthorityMatrix → FailSafe → Action
 */

// Browser-compatible EventEmitter implementation
class BrowserEventEmitter {
    private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

    on(event: string, listener: (...args: any[]) => void): this {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
        return this;
    }

    off(event: string, listener: (...args: any[]) => void): this {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
        return this;
    }

    emit(event: string, ...args: any[]): boolean {
        const eventListeners = this.listeners.get(event);
        if (eventListeners && eventListeners.length > 0) {
            eventListeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (e) {
                    console.error(`[EventEmitter] Error in listener for ${event}:`, e);
                }
            });
            return true;
        }
        return false;
    }

    removeAllListeners(event?: string): this {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
        return this;
    }
}

import { v4 as uuidv4 } from 'uuid';
import {
    OptimusMode,
    OptimusEvent,
    OptimusResponse,
    OptimusCoreConfig,
    OptimusCoreStatus,
    AuthorityLevel,
    FailSafeConfig,
    FailSafeStatus,
    ResolvedIntent,
    Decision,
    ActionType,
    PriorityLevel
} from './optimusTypes';
import { optimusPersonality, DEFAULT_PERSONALITY } from './optimusPersonality';
import { fallbackBrain } from './optimusFallbackBrain';

// ============================================
// DEFAULT CONFIGURATION
// ============================================

const DEFAULT_FAILSAFE_CONFIG: FailSafeConfig = {
    maxApiCallsPerMinute: 120,      // Daha yüksek throughput
    maxDecisionsPerMinute: 60,      // Daha hızlı karar döngüsü
    maxLoopIterations: 200,         // Karmaşık akışlar için
    latencyThresholdMs: 3000,       // Daha duyarlı gecikme algılama
    memoryThresholdMb: 1024,        // Daha geniş bellek toleransı
    enabled: true
};

const DEFAULT_CONFIG: OptimusCoreConfig = {
    mode: 'OPERATOR',
    authorityLevel: 'SYSTEM',
    failSafeConfig: DEFAULT_FAILSAFE_CONFIG,
    personality: DEFAULT_PERSONALITY,
    voiceEnabled: true,             // JARVIS benzeri sesli yanıtlar aktif
    debugMode: true                 // Geliştirme aşamasında detaylı loglar
};

// ============================================
// OPTIMUS CORE CLASS
// ============================================

class OptimusCore extends BrowserEventEmitter {
    private config: OptimusCoreConfig;
    private isRunning: boolean = false;
    private startTime: Date | null = null;
    private eventCount: number = 0;
    private decisionCount: number = 0;
    private lastActivity: Date = new Date();
    private failSafeStatus: FailSafeStatus = { isTriggered: false };

    // Rate limiting
    private apiCallsThisMinute: number = 0;
    private decisionsThisMinute: number = 0;
    private rateLimitResetTimer: NodeJS.Timeout | null = null;

    // Event handlers registry
    private handlers: Map<string, Array<(event: OptimusEvent) => Promise<OptimusResponse>>> = new Map();

    constructor(config: Partial<OptimusCoreConfig> = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.setupInternalHandlers();
    }

    // ============================================
    // LIFECYCLE METHODS
    // ============================================

    /**
     * Start OPTIMUS Core
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️ [OptimusCore] Already running');
            return;
        }

        console.log('🚀 [OptimusCore] Starting OPTIMUS...');

        this.isRunning = true;
        this.startTime = new Date();
        this.lastActivity = new Date();

        // Start rate limit reset timer
        this.startRateLimitTimer();

        // Emit startup event
        this.emit('core:started', { timestamp: this.startTime });

        console.log(`✅ [OptimusCore] OPTIMUS is online in ${this.config.mode} mode`);

        // Announce startup
        if (this.config.voiceEnabled) {
            this.emit('voice:speak', optimusPersonality.greet());
        }
    }

    /**
     * Stop OPTIMUS Core
     */
    async stop(): Promise<void> {
        if (!this.isRunning) {
            console.log('⚠️ [OptimusCore] Already stopped');
            return;
        }

        console.log('🛑 [OptimusCore] Stopping OPTIMUS...');

        // Clear timers
        if (this.rateLimitResetTimer) {
            clearInterval(this.rateLimitResetTimer);
        }

        this.isRunning = false;

        // Emit shutdown event
        this.emit('core:stopped', {
            timestamp: new Date(),
            uptime: this.getUptime()
        });

        console.log('✅ [OptimusCore] OPTIMUS is offline');
    }

    /**
     * Restart OPTIMUS Core
     */
    async restart(): Promise<void> {
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.start();
    }

    // ============================================
    // EVENT BUS
    // ============================================

    /**
     * Register an event handler
     */
    registerHandler(
        eventType: string,
        handler: (event: OptimusEvent) => Promise<OptimusResponse>
    ): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
        console.log(`📝 [OptimusCore] Handler registered for: ${eventType}`);
    }

    /**
     * Process an incoming event
     */
    async processEvent(event: OptimusEvent): Promise<OptimusResponse> {
        this.eventCount++;
        this.lastActivity = new Date();

        // Check if running
        if (!this.isRunning) {
            return this.createErrorResponse('OPTIMUS is not running');
        }

        // Check FailSafe
        if (this.failSafeStatus.isTriggered) {
            return this.createErrorResponse(`FailSafe triggered: ${this.failSafeStatus.reason}`);
        }

        // Check rate limits
        if (!this.checkRateLimits()) {
            fallbackBrain.activate('QUOTA');
            return fallbackBrain.process(JSON.stringify(event.payload));
        }

        // Log event
        if (this.config.debugMode) {
            console.log(`📥 [OptimusCore] Event received:`, event.type, event.payload);
        }

        // Emit raw event for observers
        this.emit('event:received', event);

        try {
            // Route to appropriate handlers
            const handlers = this.handlers.get(event.type) || [];

            if (handlers.length === 0) {
                // No specific handler, use default processing
                return await this.defaultEventHandler(event);
            }

            // Execute handlers in sequence
            let response: OptimusResponse | null = null;
            for (const handler of handlers) {
                response = await handler(event);
                if (response.action === 'BLOCK') {
                    break; // Stop processing if blocked
                }
            }

            return response || this.createSuccessResponse('Event processed');

        } catch (error: any) {
            console.error(`❌ [OptimusCore] Event processing error:`, error);

            // Check if we should activate fallback
            if (error.message?.includes('API') || error.message?.includes('timeout')) {
                fallbackBrain.activate('API_DOWN');
                return fallbackBrain.process(JSON.stringify(event.payload));
            }

            return this.createErrorResponse(error.message);
        }
    }

    /**
     * Default event handler - karar zincirini tetikler
     */
    private async defaultEventHandler(event: OptimusEvent): Promise<OptimusResponse> {
        // Check if fallback is active
        if (fallbackBrain.getStatus().isActive) {
            return fallbackBrain.process(JSON.stringify(event.payload));
        }

        // Execute the full decision pipeline
        return await this.executeDecisionPipeline(event);
    }

    /**
     * 🔗 DECISION PIPELINE
     * ====================
     * Event → Intent → Decision → Policy → Authority → FailSafe → Action
     * 
     * Core karar almaz, karar zincirini çağırır.
     */
    private async executeDecisionPipeline(event: OptimusEvent): Promise<OptimusResponse> {
        const pipelineStart = Date.now();

        try {
            // STEP 1: Resolve Intent (lazy import to avoid circular deps)
            const { intentResolver } = await import('../intent/optimusIntentResolver');
            const intent = await this.withApiGuard(() => intentResolver.resolve(
                typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload),
                event
            ));

            // STEP 2: Make Decision
            const { decisionEngine } = await import('../decision/optimusDecisionEngine');
            const decision = await decisionEngine.decide(intent);

            // STEP 3: Check Policy (should do?)
            const { policyEngine } = await import('../policy/optimusPolicyEngine');
            const policyResult = policyEngine.evaluate(decision);

            // If policy says BLOCK or DEFER, respect it
            if (policyResult.action === 'BLOCK') {
                this.emit('decision:blocked', { decision, reason: policyResult.reason });
                return {
                    success: false,
                    action: 'BLOCK',
                    message: `Policy blocked: ${policyResult.reason}`,
                    decision,
                    shouldSpeak: false,
                    timestamp: new Date()
                };
            }

            if (policyResult.action === 'DEFER') {
                this.emit('decision:deferred', { decision, reason: policyResult.reason });
                return {
                    success: true,
                    action: 'DEFER',
                    message: `Deferred: ${policyResult.reason}`,
                    decision,
                    shouldSpeak: false,
                    timestamp: new Date()
                };
            }

            // STEP 4: Check Authority (can do?)
            const { authorityMatrix } = await import('../safety/optimusAuthorityMatrix');
            const authResult = authorityMatrix.check(intent.action);

            if (!authResult.granted) {
                this.emit('decision:unauthorized', { decision, authResult });
                return {
                    success: false,
                    action: 'BLOCK',
                    message: `Unauthorized: ${authResult.reason}`,
                    decision,
                    shouldSpeak: false,
                    timestamp: new Date()
                };
            }

            // STEP 5: Final FailSafe check (is it safe?)
            const { failSafe } = await import('../safety/optimusFailSafe');
            if (!failSafe.isSafe()) {
                this.emit('decision:failsafe', { decision });
                return {
                    success: false,
                    action: 'BLOCK',
                    message: 'FailSafe is active - operation blocked',
                    decision,
                    shouldSpeak: true,
                    timestamp: new Date()
                };
            }

            // STEP 6: Record metrics
            const { intelligenceMetrics } = await import('../metrics/optimusIntelligenceMetrics');
            intelligenceMetrics.recordOutcome({
                decisionId: decision.id,
                wasCorrect: true, // Will be updated if overridden
                wasOverridden: false,
                wasUnnecessary: false,
                responseTimeMs: Date.now() - pipelineStart,
                timestamp: new Date()
            });

            // Success - emit and return
            this.emit('decision:executed', { decision, pipelineTimeMs: Date.now() - pipelineStart });

            return {
                success: true,
                action: decision.action,
                message: decision.reason,
                decision,
                shouldSpeak: decision.priority === 'P0',
                timestamp: new Date()
            };

        } catch (error: any) {
            console.error('[OptimusCore] Pipeline error:', error);

            // Record failure in audit log
            this.auditLog('PIPELINE_ERROR', { error: error.message, event });

            return this.createErrorResponse(`Pipeline failed: ${error.message}`);
        }
    }

    /**
     * 🛡️ API GUARD WRAPPER
     * ====================
     * Her API çağrısını otomatik sayar
     */
    private async withApiGuard<T>(fn: () => Promise<T>): Promise<T> {
        this.incrementApiCalls();
        const startTime = Date.now();

        try {
            const result = await fn();

            // Check latency
            const latency = Date.now() - startTime;
            if (latency > this.config.failSafeConfig.latencyThresholdMs) {
                console.warn(`⚠️ [OptimusCore] High latency detected: ${latency}ms`);
                fallbackBrain.checkLatency(latency);
            }

            return result;
        } catch (error) {
            // On API error, consider fallback
            fallbackBrain.activate('API_DOWN');
            throw error;
        }
    }

    /**
     * 📝 AUDIT LOG
     * ============
     * Post-mortem analiz için kayıt
     */
    private auditLog(action: string, data: any): void {
        const entry = {
            action,
            data,
            timestamp: new Date(),
            mode: this.config.mode,
            failSafeStatus: this.failSafeStatus.isTriggered
        };

        console.log(`📝 [AUDIT] ${action}:`, JSON.stringify(entry));
        this.emit('audit:log', entry);
    }

    // ============================================
    // MODE MANAGEMENT
    // ============================================

    /**
     * Change operational mode
     */
    setMode(newMode: OptimusMode, reason?: string): void {
        const oldMode = this.config.mode;
        this.config.mode = newMode;

        console.log(`🔄 [OptimusCore] Mode changed: ${oldMode} → ${newMode}`);

        // Emit mode change event
        this.emit('mode:changed', {
            oldMode,
            newMode,
            reason,
            timestamp: new Date()
        });

        // Announce if voice enabled
        if (this.config.voiceEnabled) {
            this.emit('voice:speak', optimusPersonality.announceModeChange(newMode, reason));
        }

        // Special handling for CRISIS mode
        if (newMode === 'CRISIS') {
            this.activateCrisisProtocols();
        }
    }

    /**
     * Get current mode
     */
    getMode(): OptimusMode {
        return this.config.mode;
    }

    /**
     * Activate crisis protocols
     */
    private activateCrisisProtocols(): void {
        console.log('🚨 [OptimusCore] CRISIS MODE ACTIVATED');

        // Override settings for crisis
        this.emit('crisis:activated', {
            timestamp: new Date(),
            previousMode: this.config.mode
        });

        // Announce crisis
        if (this.config.voiceEnabled) {
            this.emit('voice:speak', optimusPersonality.announceCrisis('Sistem kritik durumda'));
        }
    }

    // ============================================
    // FAILSAFE & RATE LIMITING
    // ============================================

    /**
     * Check rate limits
     */
    private checkRateLimits(): boolean {
        if (!this.config.failSafeConfig.enabled) {
            return true;
        }

        if (this.apiCallsThisMinute >= this.config.failSafeConfig.maxApiCallsPerMinute) {
            console.warn('⚠️ [OptimusCore] API rate limit reached');
            return false;
        }

        if (this.decisionsThisMinute >= this.config.failSafeConfig.maxDecisionsPerMinute) {
            console.warn('⚠️ [OptimusCore] Decision rate limit reached');
            return false;
        }

        return true;
    }

    /**
     * Start rate limit reset timer
     */
    private startRateLimitTimer(): void {
        this.rateLimitResetTimer = setInterval(() => {
            this.apiCallsThisMinute = 0;
            this.decisionsThisMinute = 0;
        }, 60000); // Reset every minute
    }

    /**
     * Trigger FailSafe
     */
    triggerFailSafe(reason: string): void {
        this.failSafeStatus = {
            isTriggered: true,
            reason,
            triggeredAt: new Date(),
            recoveryEta: new Date(Date.now() + 5 * 60 * 1000) // 5 min recovery
        };

        console.error(`🛡️ [OptimusCore] FAILSAFE TRIGGERED: ${reason}`);

        this.emit('failsafe:triggered', this.failSafeStatus);

        // Auto-recovery after timeout
        setTimeout(() => {
            this.resetFailSafe();
        }, 5 * 60 * 1000);
    }

    /**
     * Reset FailSafe
     */
    resetFailSafe(): void {
        const previousStatus = { ...this.failSafeStatus };
        this.failSafeStatus = { isTriggered: false };
        fallbackBrain.deactivate();

        // Audit log for post-mortem
        this.auditLog('FAILSAFE_RESET', {
            previousReason: previousStatus.reason,
            triggeredAt: previousStatus.triggeredAt,
            recoveryDuration: previousStatus.triggeredAt
                ? Date.now() - previousStatus.triggeredAt.getTime()
                : 0
        });

        console.log('✅ [OptimusCore] FailSafe reset');
        this.emit('failsafe:reset', { timestamp: new Date(), previous: previousStatus });
    }

    /**
     * Emergency stop (Kill Switch)
     */
    emergencyStop(): OptimusResponse {
        console.error('🚨 [OptimusCore] EMERGENCY STOP ACTIVATED');

        this.triggerFailSafe('Emergency stop by user');
        this.setMode('SILENT', 'Emergency stop');

        this.emit('emergency:stop', { timestamp: new Date() });

        return fallbackBrain.emergencyStop();
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Create success response
     */
    private createSuccessResponse(message: string, data?: any): OptimusResponse {
        return {
            success: true,
            action: 'EXECUTE',
            message,
            data,
            shouldSpeak: false,
            timestamp: new Date()
        };
    }

    /**
     * Create error response
     */
    private createErrorResponse(message: string): OptimusResponse {
        return {
            success: false,
            action: 'BLOCK',
            message: `Error: ${message}`,
            shouldSpeak: false,
            timestamp: new Date()
        };
    }

    /**
     * Get uptime in milliseconds
     */
    private getUptime(): number {
        if (!this.startTime) return 0;
        return Date.now() - this.startTime.getTime();
    }

    /**
     * Setup internal event handlers
     */
    private setupInternalHandlers(): void {
        // Handle internal events
        this.on('core:started', () => {
            console.log('📘 [OptimusCore] Internal: Core started');
        });

        this.on('core:stopped', () => {
            console.log('📕 [OptimusCore] Internal: Core stopped');
        });
    }

    // ============================================
    // STATUS & CONFIGURATION
    // ============================================

    /**
     * Get current status
     */
    getStatus(): OptimusCoreStatus {
        let health: OptimusCoreStatus['health'] = 'HEALTHY';

        if (!this.isRunning) {
            health = 'OFFLINE';
        } else if (this.failSafeStatus.isTriggered) {
            health = 'CRITICAL';
        } else if (fallbackBrain.getStatus().isActive) {
            health = 'DEGRADED';
        }

        return {
            isRunning: this.isRunning,
            mode: this.config.mode,
            uptime: this.getUptime(),
            eventCount: this.eventCount,
            decisionCount: this.decisionCount,
            lastActivity: this.lastActivity,
            health,
            failSafe: this.failSafeStatus
        };
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<OptimusCoreConfig>): void {
        this.config = { ...this.config, ...config };

        if (config.personality) {
            optimusPersonality.setConfig(config.personality);
        }

        console.log('⚙️ [OptimusCore] Configuration updated');
        this.emit('config:updated', this.config);
    }

    /**
     * Get current configuration
     */
    getConfig(): OptimusCoreConfig {
        return { ...this.config };
    }

    /**
     * Create a new event object
     */
    createEvent(
        type: OptimusEvent['type'],
        payload: any,
        priority: PriorityLevel = 'P2'
    ): OptimusEvent {
        return {
            id: uuidv4(),
            type,
            source: 'optimus-core',
            payload,
            timestamp: new Date(),
            priority
        };
    }

    /**
     * Increment counters
     */
    incrementApiCalls(): void {
        this.apiCallsThisMinute++;
    }

    incrementDecisions(): void {
        this.decisionsThisMinute++;
        this.decisionCount++;
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const optimusCore = new OptimusCore();
export default optimusCore;
