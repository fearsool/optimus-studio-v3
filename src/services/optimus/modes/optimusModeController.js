"use strict";
/**
 * 🎛️ OPTIMUS MODE CONTROLLER
 * ==========================
 * Operasyonel mod yönetimi
 *
 * MODLAR:
 * - SILENT: Sadece izle, hiç konuşma
 * - ADVISOR: Öner ama uygulama
 * - OPERATOR: Normal otonom mod
 * - ANALYST: Derinlemesine analiz modu
 * - CRISIS: Kritik durum modu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.modeController = void 0;
const optimusCore_1 = require("../core/optimusCore");
const MODE_CONFIGS = {
    SILENT: {
        name: 'Sessiz Mod',
        description: 'Sadece izle ve kaydet, hiçbir şey söyleme veya yapma',
        autoExecute: false,
        speakEnabled: false,
        analyticsLevel: 'minimal',
        riskTolerance: 'low'
    },
    ADVISOR: {
        name: 'Danışman Modu',
        description: 'Öneriler sun ama otomatik uygulama',
        autoExecute: false,
        speakEnabled: true,
        analyticsLevel: 'detailed',
        riskTolerance: 'low'
    },
    OPERATOR: {
        name: 'Operatör Modu',
        description: 'Normal otonom çalışma modu',
        autoExecute: true,
        speakEnabled: true,
        analyticsLevel: 'normal',
        riskTolerance: 'medium'
    },
    ANALYST: {
        name: 'Analiz Modu',
        description: 'Derinlemesine analiz ve raporlama',
        autoExecute: false,
        speakEnabled: true,
        analyticsLevel: 'detailed',
        riskTolerance: 'low'
    },
    CRISIS: {
        name: 'Kriz Modu',
        description: 'Kritik durum - sadece acil komutlar',
        autoExecute: true,
        speakEnabled: true,
        analyticsLevel: 'minimal',
        riskTolerance: 'high'
    }
};
// ============================================
// MODE CONTROLLER CLASS
// ============================================
class OptimusModeController {
    constructor() {
        this.modeHistory = [];
        this.scheduledModeChange = null;
    }
    /**
     * Get current mode
     */
    getCurrentMode() {
        return optimusCore_1.optimusCore.getMode();
    }
    /**
     * Get mode configuration
     */
    getModeConfig(mode) {
        return MODE_CONFIGS[mode || this.getCurrentMode()];
    }
    /**
     * Change mode
     */
    setMode(mode, reason = 'Manual change') {
        const previousMode = this.getCurrentMode();
        if (previousMode === mode) {
            console.log(`[ModeController] Already in ${mode} mode`);
            return;
        }
        // Record history
        this.modeHistory.push({
            mode: previousMode,
            reason: `Changed to ${mode}: ${reason}`,
            timestamp: new Date()
        });
        // Keep last 50 entries
        if (this.modeHistory.length > 50) {
            this.modeHistory = this.modeHistory.slice(-50);
        }
        // Apply the change
        optimusCore_1.optimusCore.setMode(mode, reason);
        console.log(`[ModeController] Mode changed: ${previousMode} → ${mode}`);
    }
    /**
     * Schedule a mode change
     */
    scheduleModeChange(mode, afterMs, reason) {
        // Clear any existing scheduled change
        if (this.scheduledModeChange) {
            clearTimeout(this.scheduledModeChange);
        }
        this.scheduledModeChange = setTimeout(() => {
            this.setMode(mode, `Scheduled: ${reason}`);
            this.scheduledModeChange = null;
        }, afterMs);
        console.log(`[ModeController] Mode change to ${mode} scheduled in ${afterMs}ms`);
    }
    /**
     * Cancel scheduled mode change
     */
    cancelScheduledChange() {
        if (this.scheduledModeChange) {
            clearTimeout(this.scheduledModeChange);
            this.scheduledModeChange = null;
            console.log('[ModeController] Scheduled mode change cancelled');
        }
    }
    /**
     * Quick mode switches
     */
    goSilent(reason) {
        this.setMode('SILENT', reason || 'User requested silence');
    }
    goAdvisor(reason) {
        this.setMode('ADVISOR', reason || 'User requested advisor mode');
    }
    goOperator(reason) {
        this.setMode('OPERATOR', reason || 'User requested operator mode');
    }
    goAnalyst(reason) {
        this.setMode('ANALYST', reason || 'User requested analyst mode');
    }
    goCrisis(reason) {
        this.setMode('CRISIS', reason || 'Crisis activated');
    }
    /**
     * Check if current mode allows auto-execution
     */
    canAutoExecute() {
        return this.getModeConfig().autoExecute;
    }
    /**
     * Check if current mode allows speaking
     */
    canSpeak() {
        return this.getModeConfig().speakEnabled;
    }
    /**
     * Get mode history
     */
    getHistory() {
        return [...this.modeHistory];
    }
    /**
     * Get all mode configurations
     */
    getAllModes() {
        return { ...MODE_CONFIGS };
    }
    /**
     * Get mode by risk tolerance
     */
    getModeForRisk(tolerance) {
        return Object.entries(MODE_CONFIGS)
            .filter(([_, config]) => config.riskTolerance === tolerance)
            .map(([mode]) => mode);
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.modeController = new OptimusModeController();
exports.default = exports.modeController;
