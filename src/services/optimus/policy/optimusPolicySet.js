"use strict";
/**
 * 📋 OPTIMUS POLICY SET
 * =====================
 * Fabrika için önceden tanımlanmış politikalar
 *
 * Her politika:
 * - condition: Koşul fonksiyonu veya string
 * - action: Koşul sağlandığında ne yapılacak
 * - reason: Neden bu aksiyon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.policySet = exports.getEnabledCount = exports.getPoliciesByAction = exports.getPolicyById = exports.FACTORY_POLICIES = void 0;
// ============================================
// FACTORY POLICIES
// ============================================
exports.FACTORY_POLICIES = [
    // ==========================================
    // 💰 PARA MODU (AUTONOMOUS PROFIT)
    // ==========================================
    {
        id: 'allow_autonomous_production',
        rule: 'allow_autonomous_production',
        condition: (ctx) => {
            var _a, _b;
            // İzin verilen üretim intentleri
            const productionIntents = ['CREATE_PRODUCT', 'START_PRODUCTION', 'GENERATE_IDEA', 'RUN_FACTORY'];
            const isProduction = productionIntents.includes(ctx.intent.action);
            // Otonom, Operator veya Advisor modundaysak üretime izin ver
            const allowedModes = ['OPERATOR', 'ADVISOR', 'STRATEGIC'];
            const isAllowedMode = allowedModes.includes(ctx.mode);
            // Nemotron "PRODUCE" dediyse (varsa)
            const aiApproved = ((_b = (_a = ctx.decision.params) === null || _a === void 0 ? void 0 : _a.nemotronResult) === null || _b === void 0 ? void 0 : _b.verdict) === 'PRODUCE';
            // Otonom moddaysa VE (üretim istendiyse VEYA AI onayladıysa) -> EXECUTE
            return (isAllowedMode && isProduction) || aiApproved;
        },
        action: 'EXECUTE',
        reason: 'Otonom üretim izni verildi (Money Mode Active) 💸',
        priority: 99, // En yüksek öncelik
        enabled: true
    },
    {
        id: 'autonomous_production_cycle',
        rule: 'autonomous_production',
        condition: (ctx) => {
            // Basit kontrol: Otonom moddaysa ve üretim emri geldiyse -> İZİN VER
            // Not: 'mode' context içinde olmayabilir, bu yüzden intent'e güveniyoruz.
            // Otonom döngü 'CREATE' veya 'PRODUCE' intent'i üretir.
            const isProduction = ['CREATE', 'PRODUCE', 'GENERATE'].some(a => ctx.intent.action.includes(a));
            return isProduction;
        },
        action: 'EXECUTE',
        reason: 'Otonom üretim döngüsü aktif - Üretime izin veriliyor 🏭',
        priority: 95, // Yüksek öncelik
        enabled: true
    },
    // ==========================================
    // ZAMAN BAZLI POLİTİKALAR
    // ==========================================
    {
        id: 'no_critical_during_peak',
        rule: 'no_critical_action_during_peak',
        condition: (ctx) => {
            const hour = new Date().getHours();
            const isPeakHours = hour >= 10 && hour <= 16; // 10:00 - 16:00
            const isCritical = ['STOP', 'DELETE', 'CRISIS'].some(a => ctx.intent.action.includes(a));
            return isPeakHours && isCritical;
        },
        action: 'DEFER',
        reason: 'Yoğun saatlerde kritik aksiyon ertelenir (10:00-16:00)',
        priority: 90,
        enabled: true
    },
    {
        id: 'no_production_at_night',
        rule: 'no_production_at_night',
        condition: (ctx) => {
            const hour = new Date().getHours();
            const isNight = hour >= 23 || hour < 6; // 23:00 - 06:00
            const isProduction = ctx.intent.action.includes('PRODUCTION') ||
                ctx.intent.action.includes('CREATE');
            return isNight && isProduction;
        },
        action: 'DEFER',
        reason: 'Gece saatlerinde üretim ertelenir (23:00-06:00)',
        priority: 70,
        enabled: true
    },
    // ==========================================
    // RİSK BAZLI POLİTİKALAR
    // ==========================================
    {
        id: 'block_critical_risk',
        rule: 'block_critical_risk_actions',
        condition: (ctx) => ctx.decision.riskLevel === 'CRITICAL',
        action: 'ESCALATE',
        reason: 'Kritik risk seviyeli aksiyonlar insan onayı gerektirir',
        priority: 100,
        enabled: true
    },
    {
        id: 'defer_low_confidence',
        rule: 'defer_low_confidence_decisions',
        condition: (ctx) => ctx.decision.confidence < 0.4,
        action: 'DEFER',
        reason: 'Düşük güven skorlu kararlar ertelenir (%40 altı)',
        priority: 85,
        enabled: false // AI devrimi için devre dışı (Gemma'ya güveniyoruz)
    },
    {
        id: 'require_approval_financial',
        rule: 'require_approval_for_financial',
        condition: (ctx) => {
            const financialActions = ['SET_PRICING', 'REFUND', 'PURCHASE'];
            return financialActions.includes(ctx.intent.action);
        },
        action: 'ESCALATE',
        reason: 'Finansal işlemler insan onayı gerektirir',
        priority: 95,
        enabled: true
    },
    // ==========================================
    // SİSTEM DURUMU POLİTİKALARI
    // ==========================================
    {
        id: 'no_action_in_degraded',
        rule: 'no_new_actions_when_degraded',
        condition: (ctx) => {
            const isNew = ['CREATE', 'START', 'PRODUCE'].some(a => ctx.intent.action.includes(a));
            return ctx.status.health === 'DEGRADED' && isNew;
        },
        action: 'DEFER',
        reason: 'Sistem düşük performansta, yeni işlemler erteleniyor',
        priority: 80,
        enabled: true
    },
    {
        id: 'allow_only_stop_in_crisis',
        rule: 'allow_only_stop_in_crisis',
        condition: (ctx) => {
            const isNotStop = !ctx.intent.action.includes('STOP') &&
                !ctx.intent.action.includes('CRISIS') &&
                !ctx.intent.action.includes('STATUS');
            return ctx.mode === 'CRISIS' && isNotStop;
        },
        action: 'BLOCK',
        reason: 'Kriz modunda sadece durdur/durum komutları kabul edilir',
        priority: 100,
        enabled: true
    },
    // ==========================================
    // OTOMASYoN LİMİT POLİTİKALARI
    // ==========================================
    {
        id: 'max_products_per_day',
        rule: 'max_products_per_day',
        condition: (ctx) => {
            var _a;
            // This would check against a daily counter
            const dailyCount = ((_a = ctx.decision.params) === null || _a === void 0 ? void 0 : _a.dailyProductCount) || 0;
            return ctx.intent.action === 'CREATE_PRODUCT' && dailyCount >= 10;
        },
        action: 'BLOCK',
        reason: 'Günlük üretim limiti doldu (max 10 ürün)',
        priority: 60,
        enabled: true
    },
    {
        id: 'cooldown_between_productions',
        rule: 'cooldown_between_productions',
        condition: (ctx) => {
            var _a;
            const lastProduction = (_a = ctx.decision.params) === null || _a === void 0 ? void 0 : _a.lastProductionTime;
            if (!lastProduction)
                return false;
            const cooldownMs = 5 * 60 * 1000; // 5 dakika
            return Date.now() - new Date(lastProduction).getTime() < cooldownMs;
        },
        action: 'DEFER',
        reason: 'Üretimler arası bekleme süresi (5dk)',
        priority: 50,
        enabled: true
    },
    // ==========================================
    // GÜVENLİK POLİTİKALARI
    // ==========================================
    {
        id: 'block_unknown_intents',
        rule: 'block_unknown_intents',
        condition: (ctx) => ctx.intent.action === 'UNKNOWN' && ctx.decision.confidence < 0.3,
        action: 'BLOCK',
        reason: 'Bilinmeyen ve düşük güvenli komutlar engellenir',
        priority: 75,
        enabled: false // AI modunda her şeyi deniyoruz
    },
    {
        id: 'log_all_destructive',
        rule: 'audit_destructive_actions',
        condition: (ctx) => {
            const destructive = ['DELETE', 'REMOVE', 'CLEAR', 'RESET'];
            return destructive.some(a => ctx.intent.action.includes(a));
        },
        action: 'ALERT', // Allow but alert
        reason: 'Yıkıcı aksiyonlar denetim için loglanır',
        priority: 65,
        enabled: true
    }
];
// ============================================
// POLICY SET HELPERS
// ============================================
/**
 * Get policy by ID
 */
function getPolicyById(id) {
    return exports.FACTORY_POLICIES.find(p => p.id === id);
}
exports.getPolicyById = getPolicyById;
/**
 * Get policies by action type
 */
function getPoliciesByAction(action) {
    return exports.FACTORY_POLICIES.filter(p => p.action === action);
}
exports.getPoliciesByAction = getPoliciesByAction;
/**
 * Get enabled policies count
 */
function getEnabledCount() {
    return exports.FACTORY_POLICIES.filter(p => p.enabled).length;
}
exports.getEnabledCount = getEnabledCount;
// ============================================
// EXPORT
// ============================================
exports.policySet = {
    policies: exports.FACTORY_POLICIES,
    getById: getPolicyById,
    getByAction: getPoliciesByAction,
    enabledCount: getEnabledCount
};
exports.default = exports.policySet;
