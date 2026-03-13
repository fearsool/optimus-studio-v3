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

import { optimusCore } from '../core/optimusCore';
import { fallbackBrain } from '../core/optimusFallbackBrain';
import { failSafe } from './optimusFailSafe';

// ============================================
// KILL SWITCH CLASS
// ============================================

class OptimusKillSwitch {
    private isActivated: boolean = false;
    private activatedAt: Date | null = null;
    private activatedBy: string | null = null;
    private reason: string | null = null;
    private activationHistory: Array<{
        activatedBy: string;
        reason: string;
        timestamp: Date;
        duration?: number;
    }> = [];

    /**
     * Activate kill switch
     */
    activate(by: string = 'system', reason: string = 'Emergency stop'): void {
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
        failSafe.trigger('Kill switch activated');
        optimusCore.setMode('SILENT', 'Kill switch activated');

        // Log activation
        this.activationHistory.push({
            activatedBy: by,
            reason,
            timestamp: this.activatedAt
        });

        // Emit event
        optimusCore.emit('killswitch:activated', {
            by,
            reason,
            timestamp: this.activatedAt
        });
    }

    /**
     * Deactivate kill switch
     */
    deactivate(by: string = 'system'): void {
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
        failSafe.reset();
        fallbackBrain.deactivate();
        optimusCore.setMode('OPERATOR', 'Kill switch deactivated');

        // Emit event
        optimusCore.emit('killswitch:deactivated', {
            by,
            duration,
            timestamp: new Date()
        });
    }

    /**
     * Toggle kill switch
     */
    toggle(by: string = 'system', reason?: string): boolean {
        if (this.isActivated) {
            this.deactivate(by);
            return false;
        } else {
            this.activate(by, reason);
            return true;
        }
    }

    /**
     * Check if kill switch is active
     */
    isActive(): boolean {
        return this.isActivated;
    }

    /**
     * Get current status
     */
    getStatus(): {
        isActive: boolean;
        activatedAt: Date | null;
        activatedBy: string | null;
        reason: string | null;
        uptime: number;
    } {
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
    getHistory(): typeof this.activationHistory {
        return [...this.activationHistory];
    }

    /**
     * Clear history
     */
    clearHistory(): void {
        this.activationHistory = [];
    }

    /**
     * Force reset (for recovery)
     */
    forceReset(): void {
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

export const killSwitch = new OptimusKillSwitch();
export default killSwitch;
