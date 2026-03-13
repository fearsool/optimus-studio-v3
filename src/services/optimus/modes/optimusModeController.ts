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

import { OptimusMode } from '../core/optimusTypes';
import { optimusCore } from '../core/optimusCore';

// ============================================
// MODE CONFIGURATIONS
// ============================================

interface ModeConfig {
    name: string;
    description: string;
    autoExecute: boolean;
    speakEnabled: boolean;
    analyticsLevel: 'minimal' | 'normal' | 'detailed';
    riskTolerance: 'low' | 'medium' | 'high';
}

const MODE_CONFIGS: Record<OptimusMode, ModeConfig> = {
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
    private modeHistory: Array<{ mode: OptimusMode; reason: string; timestamp: Date }> = [];
    private scheduledModeChange: NodeJS.Timeout | null = null;

    /**
     * Get current mode
     */
    getCurrentMode(): OptimusMode {
        return optimusCore.getMode();
    }

    /**
     * Get mode configuration
     */
    getModeConfig(mode?: OptimusMode): ModeConfig {
        return MODE_CONFIGS[mode || this.getCurrentMode()];
    }

    /**
     * Change mode
     */
    setMode(mode: OptimusMode, reason: string = 'Manual change'): void {
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
        optimusCore.setMode(mode, reason);

        console.log(`[ModeController] Mode changed: ${previousMode} → ${mode}`);
    }

    /**
     * Schedule a mode change
     */
    scheduleModeChange(mode: OptimusMode, afterMs: number, reason: string): void {
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
    cancelScheduledChange(): void {
        if (this.scheduledModeChange) {
            clearTimeout(this.scheduledModeChange);
            this.scheduledModeChange = null;
            console.log('[ModeController] Scheduled mode change cancelled');
        }
    }

    /**
     * Quick mode switches
     */
    goSilent(reason?: string): void {
        this.setMode('SILENT', reason || 'User requested silence');
    }

    goAdvisor(reason?: string): void {
        this.setMode('ADVISOR', reason || 'User requested advisor mode');
    }

    goOperator(reason?: string): void {
        this.setMode('OPERATOR', reason || 'User requested operator mode');
    }

    goAnalyst(reason?: string): void {
        this.setMode('ANALYST', reason || 'User requested analyst mode');
    }

    goCrisis(reason?: string): void {
        this.setMode('CRISIS', reason || 'Crisis activated');
    }

    /**
     * Check if current mode allows auto-execution
     */
    canAutoExecute(): boolean {
        return this.getModeConfig().autoExecute;
    }

    /**
     * Check if current mode allows speaking
     */
    canSpeak(): boolean {
        return this.getModeConfig().speakEnabled;
    }

    /**
     * Get mode history
     */
    getHistory(): typeof this.modeHistory {
        return [...this.modeHistory];
    }

    /**
     * Get all mode configurations
     */
    getAllModes(): Record<OptimusMode, ModeConfig> {
        return { ...MODE_CONFIGS };
    }

    /**
     * Get mode by risk tolerance
     */
    getModeForRisk(tolerance: 'low' | 'medium' | 'high'): OptimusMode[] {
        return (Object.entries(MODE_CONFIGS) as [OptimusMode, ModeConfig][])
            .filter(([_, config]) => config.riskTolerance === tolerance)
            .map(([mode]) => mode);
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const modeController = new OptimusModeController();
export default modeController;
