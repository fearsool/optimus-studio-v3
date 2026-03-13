/**
 * 🧠 SALON PSYCHOLOGY STANDARDS - LOCKED V1
 * 
 * ⚠️ WARNING: This file is IMMUTABLE.
 * These psychological sales rules CANNOT be modified.
 * They enforce proven conversion patterns.
 * 
 * @version 1.0.0
 * @since 2026-01-08
 */

// ============================================
// LOCKED PSYCHOLOGY RULES
// ============================================

export const SALON_PSYCHOLOGY_RULES = Object.freeze({
    version: 'LOCKED_V1',
    immutable: true,

    // Rule 1: No Open Questions
    NO_OPEN_QUESTIONS: Object.freeze({
        id: 'no-open-questions',
        rule: 'Açık uçlu soru YASAK',
        correct: 'Hangisi size daha yakın? 1️⃣ 2️⃣ 3️⃣',
        wrong: 'Nasıl yardımcı olabilirim?',
        reason: 'Açık sorular müşteriyi düşündürür, seçenekler karar aldırır'
    }),

    // Rule 2: No Direct Price
    NO_DIRECT_PRICE: Object.freeze({
        id: 'no-direct-price',
        rule: 'Direkt fiyat vermek YASAK',
        correct: 'Önce 2 dakikalık ön analiz yapalım',
        wrong: '500 TL',
        reason: 'Fiyat söyleyince müşteri karar veremeden gider'
    }),

    // Rule 3: No Blame for No-Shows
    NO_BLAME: Object.freeze({
        id: 'no-blame',
        rule: 'Gelmeyene suçlama/sitem YASAK',
        correct: 'Bugün için ayırdığımız zamanı kullanamadık 🌿',
        wrong: 'Neden gelmediniz?',
        reason: 'Suçlama müşteriyi kaybettirir, anlayış geri kazandırır'
    }),

    // Rule 4: Control Through Choices
    CONTROL_WITH_CHOICES: Object.freeze({
        id: 'control-with-choices',
        rule: 'Kontrol seçeneklerle sağlanır',
        correct: 'Şimdi mi yapalım, sonra mı?',
        wrong: 'Ne zaman uygun?',
        reason: 'Seçenek sunmak kontrolü sende tutar'
    }),

    // Rule 5: Pre-Reservation Over Appointment
    PRE_RESERVATION: Object.freeze({
        id: 'pre-reservation',
        rule: 'Kesin randevu yerine ön rezervasyon',
        correct: 'Ön rezervasyon açıyoruz, gelmezseniz otomatik düşer',
        wrong: 'Randevunuz kesinleşti',
        reason: 'Baskı hissi vermez ama takvime kilitler'
    })
});

// ============================================
// MESSAGE TEMPLATES (IMMUTABLE)
// ============================================

export const LOCKED_MESSAGES = Object.freeze({
    firstContact: `Merhaba 🌸
Saçınızla ilgili karar vermek zor olabilir, o yüzden önce netleştirelim.

Hangisi size daha yakın?
1️⃣ Renk / Ombre / Işıltı
2️⃣ Kesim / Şekillendirme
3️⃣ Kaynak / Yoğunlaştırma`,

    microBonding: `Anladım 🌿
Bu işlemi düşünenlerin çoğu şundan emin olmak istiyor:

• Bana yakışır mı?
• Saçım yıpranır mı?
• Ne kadar kalıcı?

Hangisi sizin için daha önemli?`,

    priceBlock: `Tabii 🌸
Ama fiyat saç yapısına göre ciddi değişiyor.

O yüzden önce 2 dakikalık ön analiz yapıyoruz.
Uygun değilse zaten birlikte vazgeçiyoruz.

Şimdi mi yapalım, sonra mı?`,

    calendarLock: `Yoğunluk nedeniyle kesin randevu yerine
ön rezervasyon açıyoruz 🌸

Bu sadece sizin adınıza tutulur, gelmezseniz otomatik düşer.

Hangi gün daha mantıklı?`,

    rescueFlow: `Bugün için ayırdığımız zamanı kullanamadık 🌿

İsterseniz:
1️⃣ Sadece danışma yapalım
2️⃣ Daha sakin bir gün ayıralım

Hangisi size daha iyi gelir?`
});

// ============================================
// VALIDATION
// ============================================

/**
 * Validates a message against psychology rules.
 * Returns violations if any rules are broken.
 */
export const validateMessage = (message: string): {
    valid: boolean;
    violations: string[];
} => {
    const violations: string[] = [];

    // Check for open-ended questions
    const openQuestionPatterns = [
        /nasıl yardımcı olabilirim/i,
        /ne yapmak istersiniz/i,
        /size nasıl yardımcı olayım/i
    ];

    if (openQuestionPatterns.some(p => p.test(message))) {
        violations.push('PSYCHOLOGY_VIOLATION: Açık uçlu soru kullanıldı');
    }

    // Check for direct price mentions (simple numbers followed by TL/₺)
    if (/\d+\s*(TL|₺|lira)/i.test(message) && !message.includes('analiz')) {
        violations.push('PSYCHOLOGY_VIOLATION: Direkt fiyat verildi');
    }

    // Check for blame language
    const blamePatterns = [
        /neden gelmediniz/i,
        /niye gelmediniz/i,
        /bizi beklettin/i,
        /randevuya gelmediniz/i
    ];

    if (blamePatterns.some(p => p.test(message))) {
        violations.push('PSYCHOLOGY_VIOLATION: Suçlama/sitem tespit edildi');
    }

    return {
        valid: violations.length === 0,
        violations
    };
};

// ============================================
// CUSTOMIZATION BOUNDARIES
// ============================================

export const CUSTOMIZATION_RULES = Object.freeze({
    allowed: Object.freeze([
        'businessName',
        'serviceList',
        'priceList',
        'workingHours',
        'tone' // samimi | premium
    ]),

    forbidden: Object.freeze([
        'messageFlow',
        'psychTriggers',
        'priceBlockLogic',
        'rescueFlow',
        'calendarLock'
    ])
});

/**
 * Checks if a field can be customized.
 */
export const canCustomize = (field: string): boolean => {
    if (CUSTOMIZATION_RULES.forbidden.includes(field as any)) {
        console.error(`[SALON_STANDARDS] BLOCKED: Cannot customize "${field}" - LOCKED`);
        return false;
    }
    return (CUSTOMIZATION_RULES.allowed as readonly string[]).includes(field);
};
