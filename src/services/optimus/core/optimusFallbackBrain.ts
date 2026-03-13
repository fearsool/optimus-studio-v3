/**
 * 🔄 OPTIMUS FALLBACK BRAIN
 * =========================
 * LLM çöktüğünde devreye giren rule-based sistem
 * 
 * FELSEFE:
 * "OPTIMUS susabilir ama kontrolü kaybetmemeli"
 * 
 * TETİKLEYİCİLER:
 * - API down → fallback aktif
 * - Quota dolu → fallback aktif
 * - Latency > 5s → fallback aktif
 */

import { v4 as uuidv4 } from 'uuid';
import {
    OptimusResponse,
    ActionType,
    ResolvedIntent,
    Decision,
    RiskLevel
} from './optimusTypes';

// ============================================
// FALLBACK CONFIGURATION
// ============================================

interface FallbackTrigger {
    apiDown: boolean;
    quotaExhausted: boolean;
    highLatency: boolean;
    lastLLMResponse: Date | null;
}

interface FallbackIntentHandler {
    patterns: string[];
    handler: (input: string) => FallbackResponse;
}

interface FallbackResponse {
    action: ActionType;
    message: string;
    data?: any;
}

// ============================================
// KEYWORD PATTERNS (TURKISH & ENGLISH)
// ============================================

const INTENT_PATTERNS: Record<string, FallbackIntentHandler> = {
    // System Status
    STATUS: {
        patterns: ['durum', 'status', 'sistem', 'system', 'sağlık', 'health', 'nasıl', 'how'],
        handler: () => ({
            action: 'ALERT' as ActionType,
            message: 'Sistem durumu kontrol ediliyor (Fallback Mode)',
            data: { type: 'status_check' }
        })
    },

    // Stop/Pause Commands
    STOP: {
        patterns: ['dur', 'stop', 'durdur', 'pause', 'bekle', 'wait', 'kes'],
        handler: () => ({
            action: 'BLOCK' as ActionType,
            message: 'Tüm operasyonlar duraklatıldı',
            data: { type: 'pause', duration: 15 * 60 * 1000 } // 15 minutes
        })
    },

    // Crisis Mode
    CRISIS: {
        patterns: ['kriz', 'crisis', 'acil', 'urgent', 'emergency', 'alarm'],
        handler: () => ({
            action: 'ESCALATE' as ActionType,
            message: 'KRİZ MODU AKTİVE EDİLİYOR - Tüm sistemler izleniyor',
            data: { type: 'crisis_mode' }
        })
    },

    // Production Commands
    PRODUCE: {
        patterns: ['üret', 'produce', 'başlat', 'start', 'çalıştır', 'run', 'fabrika', 'otomasyon', 'paket'],
        handler: () => ({
            action: 'EXECUTE' as ActionType,
            message: 'Üretim komutu alındı, otonom üretim başlatılıyor',
            data: { type: 'production_start' }
        })
    },

    // Help
    HELP: {
        patterns: ['yardım', 'help', 'ne yapabilirsin', 'komutlar', 'commands'],
        handler: () => ({
            action: 'ALERT' as ActionType,
            message: 'Fallback modunda kullanılabilir komutlar: durum, dur, kriz, yardım',
            data: { type: 'help' }
        })
    },

    // Cancel/Undo
    CANCEL: {
        patterns: ['iptal', 'cancel', 'geri al', 'undo', 'vazgeç'],
        handler: () => ({
            action: 'BLOCK' as ActionType,
            message: 'Son işlem iptal edildi',
            data: { type: 'cancel' }
        })
    },

    // Report
    REPORT: {
        patterns: ['rapor', 'report', 'analiz', 'analysis', 'özet', 'summary'],
        handler: () => ({
            action: 'DEFER' as ActionType,
            message: 'Rapor isteği kaydedildi, AI aktif olduğunda hazırlanacak',
            data: { type: 'deferred_report' }
        })
    }
};

// ============================================
// FALLBACK BRAIN CLASS
// ============================================

class OptimusFallbackBrain {
    private isActive: boolean = false;
    private triggers: FallbackTrigger = {
        apiDown: false,
        quotaExhausted: false,
        highLatency: false,
        lastLLMResponse: null
    };
    private deferredCommands: Array<{ input: string; timestamp: Date }> = [];
    private latencyThreshold: number = 60000; // 60 seconds - local LLMs need more time

    /**
     * Check if fallback should be activated
     */
    shouldActivate(): boolean {
        return this.triggers.apiDown ||
            this.triggers.quotaExhausted ||
            this.triggers.highLatency;
    }

    /**
     * Activate fallback mode
     */
    activate(reason: 'API_DOWN' | 'QUOTA' | 'LATENCY'): void {
        this.isActive = true;

        switch (reason) {
            case 'API_DOWN':
                this.triggers.apiDown = true;
                break;
            case 'QUOTA':
                this.triggers.quotaExhausted = true;
                break;
            case 'LATENCY':
                this.triggers.highLatency = true;
                break;
        }

        console.log(`🔄 [FallbackBrain] Activated due to: ${reason}`);
    }

    /**
     * Deactivate fallback mode
     */
    deactivate(): void {
        this.isActive = false;
        this.triggers = {
            apiDown: false,
            quotaExhausted: false,
            highLatency: false,
            lastLLMResponse: new Date()
        };

        console.log('✅ [FallbackBrain] Deactivated - LLM restored');

        // Process deferred commands would happen here
        if (this.deferredCommands.length > 0) {
            console.log(`📋 [FallbackBrain] ${this.deferredCommands.length} deferred commands to process`);
        }
    }

    /**
     * Process input in fallback mode
     */
    process(input: string): OptimusResponse {
        const normalizedInput = input.toLowerCase().trim();

        // Find matching intent
        for (const [intentName, handler] of Object.entries(INTENT_PATTERNS)) {
            const matched = handler.patterns.some(pattern =>
                normalizedInput.includes(pattern)
            );

            if (matched) {
                const result = handler.handler(normalizedInput);

                // Log the fallback decision
                console.log(`🔄 [FallbackBrain] Matched intent: ${intentName}`);

                return this.createResponse(result, intentName);
            }
        }

        // No match - defer to when AI is back
        this.deferredCommands.push({ input, timestamp: new Date() });

        return this.createResponse({
            action: 'DEFER',
            message: 'Komut anlaşılamadı. AI aktif olduğunda yeniden değerlendirilecek.',
            data: { type: 'unknown', deferred: true }
        }, 'UNKNOWN');
    }

    /**
     * Create a standardized response
     */
    private createResponse(result: FallbackResponse, intent: string): OptimusResponse {
        return {
            success: true,
            action: result.action,
            message: `[FALLBACK] ${result.message}`,
            data: {
                ...result.data,
                fallbackMode: true,
                matchedIntent: intent
            },
            shouldSpeak: result.action === 'ESCALATE', // Only speak for critical
            timestamp: new Date()
        };
    }

    /**
     * Check latency and trigger if needed
     */
    checkLatency(responseTimeMs: number): boolean {
        if (responseTimeMs > this.latencyThreshold) {
            this.activate('LATENCY');
            return true;
        }
        return false;
    }

    /**
     * Get deferred commands
     */
    getDeferredCommands(): Array<{ input: string; timestamp: Date }> {
        return [...this.deferredCommands];
    }

    /**
     * Clear deferred commands after processing
     */
    clearDeferredCommands(): void {
        this.deferredCommands = [];
    }

    /**
     * Get current status
     */
    getStatus(): { isActive: boolean; triggers: FallbackTrigger; deferredCount: number } {
        return {
            isActive: this.isActive,
            triggers: { ...this.triggers },
            deferredCount: this.deferredCommands.length
        };
    }

    /**
     * Emergency actions that always work
     */
    emergencyStop(): OptimusResponse {
        return {
            success: true,
            action: 'BLOCK',
            message: '🚨 ACİL DURDURMA - Tüm operasyonlar durduruldu',
            data: { type: 'emergency_stop', timestamp: new Date() },
            shouldSpeak: true,
            voiceMessage: 'Acil durdurma aktif. Tüm operasyonlar durduruldu.',
            timestamp: new Date()
        };
    }

    /**
     * Get basic system health (works without AI)
     */
    getBasicHealth(): Record<string, any> {
        return {
            fallbackActive: this.isActive,
            triggers: this.triggers,
            uptime: process.uptime ? process.uptime() : 'N/A',
            memory: typeof process !== 'undefined' && process.memoryUsage
                ? process.memoryUsage()
                : 'N/A',
            timestamp: new Date().toISOString()
        };
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const fallbackBrain = new OptimusFallbackBrain();
export default fallbackBrain;
