"use strict";
/**
 * 🔀 OPTIMUS INTENT SEPARATOR
 * ===========================
 * Intent türlerine göre yönlendirme
 *
 * AYRIŞIM:
 * - NATURAL: Doğal dil komutları → AI işleme
 * - SYSTEM: Sistem olayları → Direkt işleme
 * - STRATEGIC: Stratejik kararlar → Risk değerlendirme
 * - SCHEDULED: Zamanlanmış görevler → Scheduler
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.intentSeparator = void 0;
const ROUTE_CONFIGS = {
    NATURAL: {
        requiresApproval: false,
        maxAutonomyLevel: 70,
        defaultPriority: 'P2',
        timeoutMs: 10000
    },
    SYSTEM: {
        requiresApproval: false,
        maxAutonomyLevel: 90,
        defaultPriority: 'P1',
        timeoutMs: 5000
    },
    STRATEGIC: {
        requiresApproval: true,
        maxAutonomyLevel: 50,
        defaultPriority: 'P1',
        timeoutMs: 30000
    },
    SCHEDULED: {
        requiresApproval: false,
        maxAutonomyLevel: 80,
        defaultPriority: 'P2',
        timeoutMs: 60000
    }
};
// ============================================
// INTENT CATEGORY MAPPINGS
// ============================================
const CRITICAL_INTENTS = [
    'STOP_PRODUCTION',
    'ACTIVATE_CRISIS',
    'EMERGENCY_STOP',
    'KILL_SWITCH'
];
const FINANCIAL_INTENTS = [
    'CREATE_PRODUCT',
    'SET_PRICING',
    'MAKE_PURCHASE',
    'REFUND'
];
const DESTRUCTIVE_INTENTS = [
    'DELETE',
    'REMOVE',
    'CLEAR',
    'RESET'
];
// ============================================
// INTENT SEPARATOR CLASS
// ============================================
class OptimusIntentSeparator {
    /**
     * Separate and categorize intent
     */
    separate(intent) {
        const flags = this.analyzeFlags(intent);
        const config = this.getRouteConfig(intent.type, flags);
        // Determine if human approval is needed
        const requiresHumanApproval = this.checkApprovalRequired(intent, flags, config);
        return {
            intent,
            route: intent.type,
            config,
            flags: {
                ...flags,
                requiresHumanApproval
            },
            suggestedHandler: this.getSuggestedHandler(intent.type, intent.action)
        };
    }
    /**
     * Analyze intent flags
     */
    analyzeFlags(intent) {
        return {
            isCritical: CRITICAL_INTENTS.includes(intent.action),
            isFinancial: FINANCIAL_INTENTS.includes(intent.action),
            isDestructive: DESTRUCTIVE_INTENTS.some(d => intent.action.includes(d))
        };
    }
    /**
     * Get route configuration (adjusted by flags)
     */
    getRouteConfig(type, flags) {
        const baseConfig = ROUTE_CONFIGS[type];
        // Adjust based on flags
        if (flags.isCritical) {
            return {
                ...baseConfig,
                defaultPriority: 'P0',
                timeoutMs: Math.min(baseConfig.timeoutMs, 5000)
            };
        }
        if (flags.isFinancial || flags.isDestructive) {
            return {
                ...baseConfig,
                requiresApproval: true,
                maxAutonomyLevel: Math.min(baseConfig.maxAutonomyLevel, 30)
            };
        }
        return baseConfig;
    }
    /**
     * Check if human approval is required
     */
    checkApprovalRequired(intent, flags, config) {
        // Low confidence always requires approval
        if (intent.confidence < 0.5) {
            return true;
        }
        // Financial actions require approval
        if (flags.isFinancial) {
            return true;
        }
        // Destructive actions require approval
        if (flags.isDestructive) {
            return true;
        }
        // Check route config
        if (config.requiresApproval) {
            return true;
        }
        return false;
    }
    /**
     * Get suggested handler name
     */
    getSuggestedHandler(type, action) {
        const handlers = {
            NATURAL: 'naturalLanguageHandler',
            SYSTEM: 'systemEventHandler',
            STRATEGIC: 'strategicDecisionHandler',
            SCHEDULED: 'scheduledTaskHandler'
        };
        // Specific overrides
        if (CRITICAL_INTENTS.includes(action)) {
            return 'criticalActionHandler';
        }
        if (action.startsWith('GET_') || action.startsWith('CHECK_')) {
            return 'queryHandler';
        }
        if (action.startsWith('SET_')) {
            return 'configurationHandler';
        }
        return handlers[type];
    }
    /**
     * Batch separate multiple intents
     */
    separateBatch(intents) {
        return intents.map(intent => this.separate(intent));
    }
    /**
     * Get priority for intent
     */
    getPriority(intent) {
        const result = this.separate(intent);
        if (result.flags.isCritical)
            return 'P0';
        if (result.flags.isFinancial)
            return 'P1';
        return result.config.defaultPriority;
    }
    /**
     * Check if intent can be executed autonomously
     */
    canExecuteAutonomously(intent, currentAutonomyLevel) {
        const result = this.separate(intent);
        if (result.flags.requiresHumanApproval) {
            return false;
        }
        return currentAutonomyLevel <= result.config.maxAutonomyLevel;
    }
    /**
     * Get timeout for intent processing
     */
    getTimeout(intent) {
        const result = this.separate(intent);
        return result.config.timeoutMs;
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.intentSeparator = new OptimusIntentSeparator();
exports.default = exports.intentSeparator;
