"use strict";
/**
 * 🚨 OPTIMUS KILL SWITCH
 * ======================
 * Acil durdurma mekanizması
 *
 * KULLANIM:
 * - Kritik durumlarda tüm operasyonları anında durdur
 * - İnsan kontrolü sağla
 * - Güvenli duruma geç
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.killSwitch = void 0;
const optimusCore_1 = require("../core/optimusCore");
const optimusFallbackBrain_1 = require("../core/optimusFallbackBrain");
const optimusFailSafe_1 = require("./optimusFailSafe");
// ============================================
// KILL SWITCH CLASS
// ============================================
class OptimusKillSwitch {
    constructor() {
        this.isActivated = false;
        this.activatedAt = null;
        this.activatedBy = null;
        this.reason = null;
        this.activationHistory = [];
    }
    /**
     * Activate kill switch
     */
    activate(by = 'system', reason = 'Emergency stop') {
        if (this.isActivated) {
            console.warn('[KillSwitch] Already activated');
            return;
        }
        this.isActivated = true;
        this.activatedAt = new Date();
        this.activatedBy = by;
        this.reason = reason;
        console.error(`🚨 [KillSwitch] ACTIVATED by ${by}: ${reason}`);
        // Trigger all safety mechanisms
        optimusFailSafe_1.failSafe.trigger('Kill switch activated');
        optimusCore_1.optimusCore.setMode('SILENT', 'Kill switch activated');
        // Log activation
        this.activationHistory.push({
            activatedBy: by,
            reason,
            timestamp: this.activatedAt
        });
        // Emit event
        optimusCore_1.optimusCore.emit('killswitch:activated', {
            by,
            reason,
            timestamp: this.activatedAt
        });
    }
    /**
     * Deactivate kill switch
     */
    deactivate(by = 'system') {
        if (!this.isActivated) {
            console.warn('[KillSwitch] Not activated');
            return;
        }
        const duration = this.activatedAt
            ? Date.now() - this.activatedAt.getTime()
            : 0;
        // Update history with duration
        const lastEntry = this.activationHistory[this.activationHistory.length - 1];
        if (lastEntry) {
            lastEntry.duration = duration;
        }
        this.isActivated = false;
        this.activatedAt = null;
        this.activatedBy = null;
        this.reason = null;
        console.log(`✅ [KillSwitch] Deactivated by ${by} (was active for ${duration}ms)`);
        // Reset safety mechanisms
        optimusFailSafe_1.failSafe.reset();
        optimusFallbackBrain_1.fallbackBrain.deactivate();
        optimusCore_1.optimusCore.setMode('OPERATOR', 'Kill switch deactivated');
        // Emit event
        optimusCore_1.optimusCore.emit('killswitch:deactivated', {
            by,
            duration,
            timestamp: new Date()
        });
    }
    /**
     * Toggle kill switch
     */
    toggle(by = 'system', reason) {
        if (this.isActivated) {
            this.deactivate(by);
            return false;
        }
        else {
            this.activate(by, reason);
            return true;
        }
    }
    /**
     * Check if kill switch is active
     */
    isActive() {
        return this.isActivated;
    }
    /**
     * Get current status
     */
    getStatus() {
        return {
            isActive: this.isActivated,
            activatedAt: this.activatedAt,
            activatedBy: this.activatedBy,
            reason: this.reason,
            uptime: this.activatedAt
                ? Date.now() - this.activatedAt.getTime()
                : 0
        };
    }
    /**
     * Get activation history
     */
    getHistory() {
        return [...this.activationHistory];
    }
    /**
     * Clear history
     */
    clearHistory() {
        this.activationHistory = [];
    }
    /**
     * Force reset (for recovery)
     */
    forceReset() {
        this.isActivated = false;
        this.activatedAt = null;
        this.activatedBy = null;
        this.reason = null;
        console.log('🔧 [KillSwitch] Force reset');
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.killSwitch = new OptimusKillSwitch();
exports.default = exports.killSwitch;
