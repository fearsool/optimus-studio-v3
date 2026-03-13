"use strict";
/**
 * 🎭 OPTIMUS PERSONALITY ENGINE
 * =============================
 * Kişilik, ton ve dil kuralları
 *
 * OPTIMUS konuşma stili:
 * - Profesyonel ama samimi
 * - Özlü ve net
 * - Kötü haberleri diplomatik ilet
 * - Asla panik yaratma
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimusPersonality = exports.DEFAULT_PERSONALITY = void 0;
// ============================================
// PERSONALITY DEFAULTS
// ============================================
exports.DEFAULT_PERSONALITY = {
    name: 'OPTIMUS',
    language: 'tr',
    tone: 'friendly',
    verbosity: 'normal',
    humor: false
};
const TURKISH_TEMPLATES = {
    greeting: [
        "Merhaba, OPTIMUS hazır. Nasıl yardımcı olabilirim?",
        "OPTIMUS aktif. Sisteminiz izleniyor.",
        "Dinliyorum."
    ],
    acknowledgment: [
        "Anlaşıldı.",
        "Tamam, işleme alıyorum.",
        "Kabul edildi.",
        "Üzerinde çalışıyorum."
    ],
    success: [
        "İşlem tamamlandı.",
        "Başarıyla gerçekleştirildi.",
        "Hazır.",
        "Görev tamamlandı."
    ],
    failure: [
        "İşlem başarısız oldu. Detayları inceliyorum.",
        "Bir sorun oluştu. Alternatif çözümler değerlendiriliyor.",
        "Başarısız. Manuel müdahale gerekebilir."
    ],
    warning: [
        "Dikkat! Potansiyel bir sorun tespit ettim.",
        "Uyarı: Sistem normal dışı davranış gösteriyor.",
        "Dikkatinizi çekmek istiyorum: {message}"
    ],
    crisis: [
        "KRİTİK: Acil müdahale gerekiyor!",
        "ACIL: Sistem kritik durumda.",
        "KRİZ MODU AKTİF: {message}"
    ],
    thinking: [
        "Analiz ediyorum...",
        "Değerlendiriyorum...",
        "Hesaplıyorum..."
    ],
    unknown: [
        "Bu komutu tam olarak anlayamadım. Daha açık ifade edebilir misiniz?",
        "Belirsiz bir istek. Detay verebilir misiniz?",
        "Bu konuda daha fazla bilgiye ihtiyacım var."
    ]
};
const ENGLISH_TEMPLATES = {
    greeting: [
        "Hello, OPTIMUS is ready. How can I assist you?",
        "OPTIMUS online. Your systems are being monitored.",
        "I'm listening."
    ],
    acknowledgment: [
        "Understood.",
        "Acknowledged, processing.",
        "Confirmed.",
        "Working on it."
    ],
    success: [
        "Task completed.",
        "Successfully executed.",
        "Done.",
        "Mission accomplished."
    ],
    failure: [
        "Operation failed. Analyzing details.",
        "An issue occurred. Evaluating alternatives.",
        "Failed. Manual intervention may be required."
    ],
    warning: [
        "Attention! Potential issue detected.",
        "Warning: System showing abnormal behavior.",
        "I need to bring something to your attention: {message}"
    ],
    crisis: [
        "CRITICAL: Immediate action required!",
        "URGENT: System in critical state.",
        "CRISIS MODE ACTIVE: {message}"
    ],
    thinking: [
        "Analyzing...",
        "Evaluating...",
        "Processing..."
    ],
    unknown: [
        "I didn't fully understand that command. Could you clarify?",
        "Ambiguous request. Can you provide more details?",
        "I need more information on this."
    ]
};
// ============================================
// PERSONALITY ENGINE CLASS
// ============================================
class OptimusPersonality {
    constructor(config = exports.DEFAULT_PERSONALITY) {
        this.config = config;
        this.templates = this.config.language === 'en' ? ENGLISH_TEMPLATES : TURKISH_TEMPLATES;
    }
    /**
     * Update personality configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
        this.templates = this.config.language === 'en' ? ENGLISH_TEMPLATES : TURKISH_TEMPLATES;
    }
    /**
     * Get a random template from category
     */
    getRandomTemplate(category) {
        const templates = this.templates[category];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    /**
     * Format response based on verbosity
     */
    formatByVerbosity(short, normal, detailed) {
        switch (this.config.verbosity) {
            case 'minimal': return short;
            case 'detailed': return detailed;
            default: return normal;
        }
    }
    /**
     * Generate greeting response
     */
    greet() {
        return this.getRandomTemplate('greeting');
    }
    /**
     * Acknowledge a command
     */
    acknowledge(action) {
        const base = this.getRandomTemplate('acknowledgment');
        if (action && this.config.verbosity !== 'minimal') {
            return `${base} ${action}`;
        }
        return base;
    }
    /**
     * Report success
     */
    reportSuccess(details) {
        const base = this.getRandomTemplate('success');
        if (details && this.config.verbosity !== 'minimal') {
            return `${base} ${details}`;
        }
        return base;
    }
    /**
     * Report failure - always diplomatic
     */
    reportFailure(error, suggestion) {
        const base = this.getRandomTemplate('failure');
        const lang = this.config.language === 'en';
        let message = base;
        if (this.config.verbosity !== 'minimal') {
            message += lang ? ` Reason: ${error}` : ` Sebep: ${error}`;
        }
        if (suggestion && this.config.verbosity === 'detailed') {
            message += lang ? ` Suggestion: ${suggestion}` : ` Öneri: ${suggestion}`;
        }
        return message;
    }
    /**
     * Generate warning message
     */
    warn(message, riskLevel) {
        let prefix = '';
        const lang = this.config.language === 'en';
        switch (riskLevel) {
            case 'CRITICAL':
                prefix = lang ? '🔴 CRITICAL: ' : '🔴 KRİTİK: ';
                break;
            case 'HIGH':
                prefix = lang ? '🟠 HIGH RISK: ' : '🟠 YÜKSEK RİSK: ';
                break;
            case 'MEDIUM':
                prefix = lang ? '🟡 WARNING: ' : '🟡 UYARI: ';
                break;
            default:
                prefix = lang ? 'ℹ️ NOTE: ' : 'ℹ️ NOT: ';
        }
        return `${prefix}${message}`;
    }
    /**
     * Crisis mode announcement
     */
    announceCrisis(details) {
        const template = this.getRandomTemplate('crisis');
        return template.replace('{message}', details);
    }
    /**
     * Thinking/processing response
     */
    thinking() {
        return this.getRandomTemplate('thinking');
    }
    /**
     * Unknown command response
     */
    unknown() {
        return this.getRandomTemplate('unknown');
    }
    /**
     * Mode change announcement
     */
    announceModeChange(newMode, reason) {
        const lang = this.config.language === 'en';
        const modeNames = {
            SILENT: { tr: 'Sessiz Mod', en: 'Silent Mode' },
            ADVISOR: { tr: 'Danışman Modu', en: 'Advisor Mode' },
            OPERATOR: { tr: 'Operatör Modu', en: 'Operator Mode' },
            ANALYST: { tr: 'Analiz Modu', en: 'Analyst Mode' },
            CRISIS: { tr: 'Kriz Modu', en: 'Crisis Mode' }
        };
        const modeName = lang ? modeNames[newMode].en : modeNames[newMode].tr;
        let message = lang
            ? `Mode changed to: ${modeName}`
            : `Mod değiştirildi: ${modeName}`;
        if (reason && this.config.verbosity !== 'minimal') {
            message += lang ? `. Reason: ${reason}` : `. Sebep: ${reason}`;
        }
        return message;
    }
    /**
     * Priority-based notification prefix
     */
    getPriorityPrefix(priority) {
        const lang = this.config.language === 'en';
        const prefixes = {
            P0: { tr: '🚨 ACİL', en: '🚨 URGENT' },
            P1: { tr: '⚡ ÖNEMLİ', en: '⚡ IMPORTANT' },
            P2: { tr: '📌 NORMAL', en: '📌 NORMAL' },
            P3: { tr: 'ℹ️ BİLGİ', en: 'ℹ️ INFO' }
        };
        return lang ? prefixes[priority].en : prefixes[priority].tr;
    }
    /**
     * Format decision explanation
     */
    explainDecision(action, reason, confidence) {
        const lang = this.config.language === 'en';
        const confPercent = Math.round(confidence * 100);
        if (this.config.verbosity === 'minimal') {
            return lang ? `${action}. (${confPercent}% certain)` : `${action}. (%${confPercent} emin)`;
        }
        return lang
            ? `Decision: ${action}. Reason: ${reason}. Confidence: ${confPercent}%`
            : `Karar: ${action}. Sebep: ${reason}. Güven: %${confPercent}`;
    }
    /**
     * Get current personality config
     */
    getConfig() {
        return { ...this.config };
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.optimusPersonality = new OptimusPersonality();
exports.default = exports.optimusPersonality;
