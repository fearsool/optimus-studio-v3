import { AutomationTemplate, RefineLevel, MonetizationType, BlockingReason } from './store';
import { NodeType, StepStatus } from '../../types';

/**
 * 🧠 KUAFÖR RANDEVU BOTU - LOCKED STANDARD V1
 * 
 * ⚠️ WARNING: Psikolojik satış akışları DEĞİŞTİRİLEMEZ.
 * Sadece işletme bilgileri özelleştirilebilir.
 * 
 * @version 4.2.0-FACTORY
 * @since 2026-01-12
 */

export const HAIR_SALON_APPOINTMENT_BOT: AutomationTemplate = {
    id: 'hair-salon-appointment-bot',
    slug: 'hair-salon-appointment-bot',
    name: 'Kuaför Randevu & İkna Botu 💇‍♀️ (V4)',
    description: 'V4 Psikolojik Motor ile güçlendirilmiş randevu asistanı. Hafıza Kilidi (Memory Lock), Döngü Engelleyici ve Kriz Yönetimi içerir. Kişisel verilerden arındırılmış Fabrika sürümü.',
    category: 'assistant',
    difficulty: 'medium',
    estimatedRevenue: '$297 (tek seferlik satış)',
    icon: '💇‍♀️',
    tags: ['kuaför', 'salon', 'whatsapp', 'instagram', 'randevu', 'v4-engine', 'psikoloji'],
    isOfficial: true,
    sourceUrl: 'https://omniflow.com/official/hair-salon-bot',

    // REFINERY STATE: REFINED
    refineLevel: 'refined',
    sellable: true,

    // COMMERCIALIZATION DATA
    monetizationType: 'one-time',
    businessOutcome: {
        problem: 'Gelmeyen müşteriler ve sürekli aynı soruları soran botlar ("Status Amnesia").',
        solution: 'V4 Hafıza Kilidi ile bilgiyi bir kez öğrenir, asla unutmaz ve müşteriyi profesyonelce randevuya yönlendirir.',
        value: 'Gelmeme oranını %75 azaltır. Müşteri memnuniyetini maksimize eder.',
        targetUser: ['Kuaför Salonları', 'Güzellik Merkezleri', 'Berber Dükkanları']
    },

    // GOVERNANCE
    refinedBy: 'system-factory-admin',
    refinedAt: new Date().toISOString(),
    refineChecklistVersion: 'v2.0',
    blockingReasons: [],

    // IP PROTECTION
    signature: 'sha256:a1b2c3d4e5f6_hair_salon_locked_v1',

    // REQUIRED APIs
    requiredApis: [
        {
            name: 'WHATSAPP_API_KEY',
            label: 'WhatsApp Business API Key',
            description: 'Meta Business Suite üzerinden WhatsApp Business API token',
            link: 'https://business.facebook.com/settings/whatsapp-api',
            placeholder: 'EAAxxxxxxx',
            required: true
        },
        {
            name: 'WHATSAPP_PHONE_NUMBER',
            label: 'WhatsApp Telefon Numarası',
            description: 'WhatsApp Business hesabınızın telefon numarası',
            placeholder: '+905551234567',
            required: true
        },
        {
            name: 'INSTAGRAM_ACCESS_TOKEN',
            label: 'Instagram Access Token',
            description: 'Instagram Business API erişim token\'ı',
            link: 'https://developers.facebook.com/docs/instagram-api',
            placeholder: 'IGQVJxxxxxxx',
            required: false
        },
        {
            name: 'GOOGLE_CALENDAR_CLIENT_ID',
            label: 'Google Calendar Client ID',
            description: 'Takvim kilitleme için Google Calendar API',
            link: 'https://console.cloud.google.com/apis/credentials',
            placeholder: 'xxxxx.apps.googleusercontent.com',
            required: true
        },
        {
            name: 'GOOGLE_CALENDAR_CLIENT_SECRET',
            label: 'Google Calendar Client Secret',
            description: 'Google Calendar API secret key',
            placeholder: 'GOCxxxxx',
            required: true
        }
    ],

    // BLUEPRINT (The Machine - HYBRID BRAIN V4.3)
    blueprint: {
        name: 'Hair Salon Appointment Bot',
        description: 'Hibrit Zeka (AI + Psikoloji) ile güçlendirilmiş satış asistanı',
        masterGoal: 'Doğru kişiyi randevuya çevirmek (%90+ Ready Buyer Conversion)',
        baseKnowledge: 'WhatsApp Business API, Instagram Messaging API, Google Calendar API, Psikolojik satış teknikleri',
        category: 'Assistant',
        version: 1,
        testConfig: { variables: [], simulateFailures: false },

        // CUSTOMIZATION CONFIG
        customizable: {
            businessName: true,
            serviceList: true,
            priceList: true,
            workingHours: true,
            tone: ['samimi', 'premium']
        },
        nonCustomizable: {
            messageFlow: true,
            psychTriggers: true,
            calendarLock: true,
            rescueFlow: true,
            priceBlockLogic: true
        },

        nodes: [
            // 1. TRIGGER
            {
                id: 'trigger-dm',
                type: NodeType.EXTERNAL_CONNECTOR,
                title: '📥 Mesaj Alıcı',
                role: 'Gateway',
                task: 'Mesajı al ve işleme sok',
                status: StepStatus.IDLE,
                x: 100, y: 100,
                connections: [{ targetId: 'brain-intent' }],
                config: {
                    channels: ['instagram_dm', 'whatsapp'],
                    locked: false
                }
            },

            // 2. INTELLIGENCE GATEWAY: Intent Analysis (NEW)
            {
                id: 'brain-intent',
                type: NodeType.ANALYST_CRITIC, // AI Node
                title: '🧠 Niyet Analizi',
                role: 'Nemotron Brain',
                task: 'Müşteri ne istiyor? Şikayet mi, randevu mu, soru mu?',
                status: StepStatus.IDLE,
                x: 300, y: 100,
                connections: [
                    { targetId: 'crisis-manager', condition: 'intent == "complaint"' }, // Kriz
                    { targetId: 'brain-readiness', condition: 'intent == "booking" || intent == "inquiry"' }, // Satış hunisi
                    { targetId: 'first-message', condition: 'default' } // Fallback: Standart akış
                ],
                config: {
                    locked: true,
                    aiTask: 'INTENT_CLASSIFICATION'
                }
            },

            // 3. INTELLIGENCE GATEWAY: Readiness Check (NEW)
            {
                id: 'brain-readiness',
                type: NodeType.ANALYST_CRITIC, // AI Node
                title: '🌡️ Hazırlık Ölçer',
                role: 'Nemotron Brain',
                task: 'Müşteri ne kadar hazır? (Cold/Warm/Ready)',
                status: StepStatus.IDLE,
                x: 500, y: 50,
                connections: [
                    { targetId: 'calendar-lock', condition: 'readiness == "READY"' }, // Direkt satış
                    { targetId: 'first-message', condition: 'readiness == "WARM"' },  // Standart akış
                    { targetId: 'nurture-flow', condition: 'readiness == "COLD"' }    // Isıtma
                ],
                config: {
                    locked: true,
                    aiTask: 'READINESS_CLASSIFICATION'
                }
            },

            // 4. NURTURE FLOW - Isıtma (NEW)
            {
                id: 'nurture-flow',
                type: NodeType.CONTENT_CREATOR,
                title: '🌱 Isıtma Akışı',
                role: 'Nemotron Brain',
                task: 'Soğuk müşteriye bilgi ver, güven kur, ASLA satış yapma',
                status: StepStatus.IDLE,
                x: 500, y: 250,
                connections: [{ targetId: 'silent-pursuit' }],
                config: {
                    locked: true,
                    aiTask: 'NURTURE_STRATEGY'
                }
            },

            // 5. FIRST MESSAGE - Psikolojik Açılış (WARM FLOW)
            {
                id: 'first-message',
                type: NodeType.CONTENT_CREATOR,
                title: '🌸 İlk Mesaj (Standart)',
                role: 'Psychology Engine',
                task: 'Seçenek sunarak kontrol al',
                status: StepStatus.IDLE,
                x: 700, y: 100,
                connections: [{ targetId: 'micro-bonding' }],
                config: {
                    locked: true,
                    message: `Merhaba 🌸
Saçınızla ilgili karar vermek zor olabilir, o yüzden önce netleştirelim.

Hangisi size daha yakın?
1️⃣ Renk / Ombre / Işıltı
2️⃣ Kesim / Şekillendirme
3️⃣ Kaynak / Yoğunlaştırma`
                }
            },

            // 6. MICRO-BONDING
            {
                id: 'micro-bonding',
                type: NodeType.CONTENT_CREATOR,
                title: '🌿 Mikro-Bağlanma',
                role: 'Psychology Engine',
                task: 'Güven inşa et',
                status: StepStatus.IDLE,
                x: 900, y: 100,
                connections: [{ targetId: 'price-block' }],
                config: {
                    locked: true,
                    message: `Anladım 🌿
Bu işlemi düşünenlerin çoğu şundan emin olmak istiyor:

• Bana yakışır mı?
• Saçım yıpranır mı?
• Ne kadar kalıcı?

Hangisi sizin için daha önemli?`
                }
            },

            // 7. PRICE BLOCK
            {
                id: 'price-block',
                type: NodeType.LOGIC_GATE,
                title: '💰 Fiyat Blokajı',
                role: 'Sales Engineering',
                task: 'Direkt fiyat YOK',
                status: StepStatus.IDLE,
                x: 1100, y: 100,
                connections: [
                    { targetId: 'pre-analysis', condition: 'price_asked' },
                    { targetId: 'calendar-lock', condition: 'ready' }
                ],
                config: {
                    locked: true,
                    triggerKeywords: ['fiyat', 'ücret', 'ne kadar'],
                    response: `Tabii 🌸
Ama fiyat saç yapısına göre ciddi değişiyor.

O yüzden önce 2 dakikalık ön analiz yapıyoruz.
Uygun değilse zaten birlikte vazgeçiyoruz.

Şimdi mi yapalım, sonra mı?`
                }
            },

            // 8. PRE-ANALYSIS
            {
                id: 'pre-analysis',
                type: NodeType.ANALYST_CRITIC,
                title: '📋 Ön Analiz',
                role: 'Data Collection',
                task: 'Bilgi topla',
                status: StepStatus.IDLE,
                x: 1300, y: 50,
                connections: [{ targetId: 'calendar-lock' }],
                config: {
                    locked: true,
                    questions: [
                        'Saç uzunluğunuz nasıl?',
                        'Daha önce işlem var mı?',
                        'Ne zaman düşünüyorsunuz?'
                    ]
                }
            },

            // 9. CALENDAR LOCK (Destination)
            {
                id: 'calendar-lock',
                type: NodeType.EXTERNAL_CONNECTOR,
                title: '📅 Takvim Kilidi',
                role: 'Google Calendar',
                task: 'Randevu/Ön Rezervasyon',
                status: StepStatus.IDLE,
                x: 1500, y: 200, // En sağda
                connections: [{ targetId: 'reminder-setup' }],
                config: {
                    locked: true,
                    service: 'Google Calendar',
                    action: 'createPreReservation',
                    message: `Yoğunluktan dolayı kesin randevu yerine
ön rezervasyon açıyoruz 🌸

Bu sadece sizin adınıza tutulur.

Hangi gün uygun?`,
                    expiresIn: '24h'
                }
            },

            // 10. CRISIS MANAGER (Kriz Yolu)
            {
                id: 'crisis-manager',
                type: NodeType.LOGIC_GATE,
                title: '🛡️ Kriz Kalkanı',
                role: 'Crisis Engine',
                task: 'Öfkeli müşteriyi sakinleştir',
                status: StepStatus.IDLE,
                x: 300, y: 400, // Alt solda
                connections: [{ targetId: 'notify-salon' }],
                config: {
                    locked: true,
                    response: `Çok haklısınız, bu durumu duyduğuma üzüldüm 🛡️
    
Sizi yormadan hemen telafi edelim.
Yetkiliye ilettim.
    
Size özel olarak nasıl dönüş yapalım?
1️⃣ Telefonla arama
2️⃣ WhatsApp mesajı`
                }
            },

            // 11. SILENT PURSUIT (Takip Yolu)
            {
                id: 'silent-pursuit',
                type: NodeType.CONTENT_CREATOR,
                title: '🌙 Sessiz Takip',
                role: 'Retention Engine',
                task: 'Cevap vermeyene "ben buradayım" de',
                status: StepStatus.IDLE,
                x: 500, y: 400,
                connections: [{ targetId: 'end' }],
                config: {
                    locked: true,
                    triggerAfter: '24h',
                    message: `Selamlar, yoğunlukta kaynamasın istedim 🌙
    
Tarihler hızlı doluyor, eğer düşünceniz netleşirse buradayım.`
                }
            },

            // 12. REMINDER & NOTIFY
            {
                id: 'reminder-setup',
                type: NodeType.STATE_MANAGER,
                title: '🔔 Hatırlatma',
                status: StepStatus.IDLE,
                x: 1700, y: 200,
                connections: [{ targetId: 'notify-salon' }],
                config: { reminders: ['-24h', '-3h'] }
            },
            {
                id: 'notify-salon',
                type: NodeType.EXTERNAL_CONNECTOR,
                title: '📱 Salon Bildirimi',
                status: StepStatus.IDLE,
                x: 1900, y: 200,
                connections: [{ targetId: 'end' }],
                config: { channels: ['whatsapp'] }
            },

            // 13. END
            {
                id: 'end',
                type: NodeType.STATE_MANAGER,
                title: '✅ Tamamlandı',
                role: 'System',
                status: StepStatus.IDLE,
                x: 2100, y: 300,
                connections: []
            }
        ]
    }
};
