// ============================================
// CUSTOMER & MULTI-TENANT MANAGEMENT SERVICE
// Otomasyon satışı ve müşteri yönetimi
// ============================================

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
    subscriptionStart: number;
    subscriptionEnd?: number;
    monthlyFee: number;
    automations: string[]; // automation IDs
    customConfig: CustomerConfig;
    createdAt: number;
    lastActive?: number;
}

export interface CustomerConfig {
    // Marka ayarları
    brandName: string;
    brandLogo?: string;
    brandColors?: {
        primary: string;
        secondary: string;
    };

    // Platform bağlantıları
    instagram?: {
        username: string;
        accessToken?: string;
    };
    telegram?: {
        botToken: string;
        chatId?: string;
    };
    whatsapp?: {
        phoneNumber: string;
        apiKey?: string;
    };
    email?: {
        address: string;
        smtpConfig?: any;
    };

    // İçerik ayarları
    contentTone: 'professional' | 'friendly' | 'casual' | 'formal';
    language: 'tr' | 'en';
    targetAudience?: string;
    keywords?: string[];
    hashtags?: string[];

    // Zamanlama
    timezone: string;
    workingHours?: { start: number; end: number };
    postSchedule?: string[]; // cron expressions
}

// ============================================
// SATILIK OTOMASYON ŞABLONLARI
// ============================================

export interface SellableTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    previewImage?: string;

    // Fiyatlandırma
    pricing: {
        oneTime?: number; // Tek seferlik satış
        monthly?: number; // Aylık abonelik
        setupFee?: number; // Kurulum ücreti
        currency: 'TRY' | 'USD' | 'EUR';
    };

    // Özellikler
    features: string[];
    requirements: string[];

    // Kişiselleştirilebilir alanlar
    customizableFields: CustomizableField[];

    // Blueprint şablonu
    blueprintTemplate: any;

    // İstatistikler
    soldCount: number;
    rating: number;
    reviews: number;
}

export interface CustomizableField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'boolean' | 'color' | 'image' | 'api_key';
    required: boolean;
    defaultValue?: any;
    options?: { value: string; label: string }[];
    placeholder?: string;
    helpText?: string;
}

// ============================================
// HAZIR SATILIK ŞABLONLAR
// ============================================

export const SELLABLE_TEMPLATES: SellableTemplate[] = [
    {
        id: 'instagram-content-factory',
        name: 'Instagram İçerik Fabrikası',
        description: 'Her gün otomatik post, story ve reels içeriği üretir. AI ile trend analizi, görsel önerileri ve SEO caption yazımı.',
        category: 'Sosyal Medya',
        pricing: {
            oneTime: 2500,
            monthly: 500,
            setupFee: 1000,
            currency: 'TRY'
        },
        features: [
            '📱 Günlük 2 post + 3 story içeriği',
            '🔥 Trend konu araştırması',
            '✍️ AI ile caption yazımı',
            '#️⃣ Otomatik hashtag önerisi',
            '🖼️ Görsel brief oluşturma',
            '📊 Performans analizi',
            '⏰ Zamanlama önerileri'
        ],
        requirements: [
            'Instagram Business hesabı',
            'İnternet bağlantısı'
        ],
        customizableFields: [
            { id: 'brandName', name: 'brandName', label: 'Marka/İşletme Adı', type: 'text', required: true, placeholder: 'Örn: Beauty Studio' },
            {
                id: 'industry', name: 'industry', label: 'Sektör', type: 'select', required: true, options: [
                    { value: 'beauty', label: 'Güzellik/Kuaför' },
                    { value: 'restaurant', label: 'Restoran/Kafe' },
                    { value: 'fitness', label: 'Spor/Fitness' },
                    { value: 'fashion', label: 'Moda/Giyim' },
                    { value: 'realestate', label: 'Emlak' },
                    { value: 'other', label: 'Diğer' }
                ]
            },
            { id: 'targetAudience', name: 'targetAudience', label: 'Hedef Kitle', type: 'text', required: true, placeholder: '25-45 yaş kadınlar, İstanbul' },
            {
                id: 'contentTone', name: 'contentTone', label: 'İçerik Tonu', type: 'select', required: true, options: [
                    { value: 'professional', label: 'Profesyonel' },
                    { value: 'friendly', label: 'Samimi' },
                    { value: 'casual', label: 'Rahat/Günlük' },
                    { value: 'luxury', label: 'Lüks/Premium' }
                ]
            },
            { id: 'primaryColor', name: 'primaryColor', label: 'Marka Rengi', type: 'color', required: false, defaultValue: '#6366f1' },
            { id: 'postFrequency', name: 'postFrequency', label: 'Günlük Post Sayısı', type: 'number', required: true, defaultValue: 2 },
            { id: 'keywords', name: 'keywords', label: 'Anahtar Kelimeler', type: 'text', required: false, placeholder: 'saç bakımı, güzellik, moda' }
        ],
        blueprintTemplate: {
            nodes: [
                { type: 'researcher', title: 'Trend Araştırmacı' },
                { type: 'planner', title: 'İçerik Planlayıcı' },
                { type: 'creator', title: 'Görsel Direktör' },
                { type: 'writer', title: 'Copywriter' },
                { type: 'analyst', title: 'Performans Analist' }
            ]
        },
        soldCount: 47,
        rating: 4.8,
        reviews: 23
    },
    {
        id: 'ai-customer-support',
        name: 'AI Müşteri Destek Botu',
        description: '7/24 otomatik müşteri yanıtlama, SSS cevaplama ve bilet yönlendirme. Telegram veya web chat desteği.',
        category: 'Müşteri Hizmetleri',
        pricing: {
            oneTime: 5000,
            monthly: 1000,
            setupFee: 2000,
            currency: 'TRY'
        },
        features: [
            '🤖 7/24 otomatik yanıt',
            '❓ SSS veritabanı',
            '🎫 Bilet oluşturma',
            '📞 İnsan operatöre yönlendirme',
            '📊 Müşteri memnuniyet analizi',
            '💬 Çoklu dil desteği',
            '🔗 CRM entegrasyonu'
        ],
        requirements: [
            'Telegram Bot Token (ücretsiz)',
            'SSS listesi'
        ],
        customizableFields: [
            { id: 'brandName', name: 'brandName', label: 'İşletme Adı', type: 'text', required: true },
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: true, helpText: '@BotFather ile oluşturun' },
            { id: 'welcomeMessage', name: 'welcomeMessage', label: 'Karşılama Mesajı', type: 'text', required: true, defaultValue: 'Merhaba! Size nasıl yardımcı olabilirim?' },
            { id: 'faqTopics', name: 'faqTopics', label: 'SSS Konuları', type: 'text', required: true, placeholder: 'fiyat, çalışma saatleri, randevu' },
            { id: 'humanHandoff', name: 'humanHandoff', label: 'İnsan Operatöre Aktar', type: 'boolean', required: false, defaultValue: true },
            {
                id: 'language', name: 'language', label: 'Dil', type: 'select', required: true, options: [
                    { value: 'tr', label: 'Türkçe' },
                    { value: 'en', label: 'İngilizce' }
                ]
            }
        ],
        blueprintTemplate: {
            nodes: [
                { type: 'receiver', title: 'Mesaj Alıcı' },
                { type: 'classifier', title: 'Intent Sınıflandırıcı' },
                { type: 'responder', title: 'AI Yanıtlayıcı' },
                { type: 'escalator', title: 'Eskalasyon Yöneticisi' },
                { type: 'logger', title: 'Log Kaydedici' }
            ]
        },
        soldCount: 32,
        rating: 4.9,
        reviews: 18
    },
    {
        id: 'lead-generator-pro',
        name: 'Lead Generator Pro',
        description: 'LinkedIn ve websitelerden potansiyel müşteri bulma, email zenginleştirme ve CRM entegrasyonu.',
        category: 'Satış',
        pricing: {
            oneTime: 7500,
            monthly: 1500,
            setupFee: 2500,
            currency: 'TRY'
        },
        features: [
            '🔍 LinkedIn/Web scraping',
            '📧 Email bulma ve doğrulama',
            '📊 Lead skorlama',
            '🔄 CRM senkronizasyonu',
            '📈 Conversion tracking',
            '🎯 Hedef şirket filtreleme',
            '📩 Otomatik outreach'
        ],
        requirements: [
            'Hedef sektör/şirket listesi',
            'CRM hesabı (opsiyonel)'
        ],
        customizableFields: [
            { id: 'targetIndustry', name: 'targetIndustry', label: 'Hedef Sektör', type: 'text', required: true, placeholder: 'Yazılım, E-ticaret, Finans' },
            {
                id: 'targetCompanySize', name: 'targetCompanySize', label: 'Şirket Büyüklüğü', type: 'select', required: true, options: [
                    { value: 'startup', label: '1-10 çalışan' },
                    { value: 'small', label: '11-50 çalışan' },
                    { value: 'medium', label: '51-200 çalışan' },
                    { value: 'large', label: '200+ çalışan' }
                ]
            },
            { id: 'targetLocation', name: 'targetLocation', label: 'Lokasyon', type: 'text', required: true, defaultValue: 'İstanbul, Türkiye' },
            { id: 'leadCount', name: 'leadCount', label: 'Günlük Lead Hedefi', type: 'number', required: true, defaultValue: 50 },
            { id: 'emailDomain', name: 'emailDomain', label: 'Email Domain', type: 'text', required: false, placeholder: '@sirketiniz.com' }
        ],
        blueprintTemplate: {
            nodes: [
                { type: 'scraper', title: 'Web Scraper' },
                { type: 'enricher', title: 'Data Enricher' },
                { type: 'scorer', title: 'Lead Scorer' },
                { type: 'exporter', title: 'CRM Exporter' }
            ]
        },
        soldCount: 28,
        rating: 4.7,
        reviews: 15
    },
    {
        id: 'crypto-signal-bot',
        name: 'Kripto Sinyal Botu',
        description: 'Teknik analiz ile al/sat sinyalleri, Telegram bildirimleri ve portföy takibi.',
        category: 'Finans',
        pricing: {
            oneTime: 10000,
            monthly: 2000,
            setupFee: 3000,
            currency: 'TRY'
        },
        features: [
            '📊 Teknik analiz (RSI, MACD, BB)',
            '🔔 Anlık sinyal bildirimi',
            '💰 Portföy takibi',
            '📈 Performans raporları',
            '⚠️ Risk yönetimi',
            '🤖 Otomatik trade (opsiyonel)',
            '📱 Telegram entegrasyonu'
        ],
        requirements: [
            'Telegram Bot Token',
            'Binance/Exchange API (opsiyonel)'
        ],
        customizableFields: [
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: true },
            { id: 'telegramChatId', name: 'telegramChatId', label: 'Telegram Chat ID', type: 'text', required: true },
            { id: 'coins', name: 'coins', label: 'Takip Edilecek Coinler', type: 'text', required: true, defaultValue: 'BTC, ETH, BNB, SOL' },
            {
                id: 'riskLevel', name: 'riskLevel', label: 'Risk Seviyesi', type: 'select', required: true, options: [
                    { value: 'low', label: 'Düşük Risk' },
                    { value: 'medium', label: 'Orta Risk' },
                    { value: 'high', label: 'Yüksek Risk' }
                ]
            },
            {
                id: 'signalFrequency', name: 'signalFrequency', label: 'Sinyal Sıklığı', type: 'select', required: true, options: [
                    { value: 'hourly', label: 'Saatlik' },
                    { value: 'daily', label: 'Günlük' },
                    { value: 'realtime', label: 'Anlık' }
                ]
            }
        ],
        blueprintTemplate: {
            nodes: [
                { type: 'fetcher', title: 'Market Data Fetcher' },
                { type: 'analyzer', title: 'Teknik Analizci' },
                { type: 'signaler', title: 'Sinyal Üretici' },
                { type: 'notifier', title: 'Telegram Notifier' }
            ]
        },
        soldCount: 65,
        rating: 4.6,
        reviews: 42
    },
    {
        id: 'appointment-bot',
        name: 'Randevu Yönetim Botu',
        description: 'Telegram/WhatsApp üzerinden randevu alma, hatırlatma ve takvim yönetimi.',
        category: 'Müşteri Hizmetleri',
        pricing: {
            oneTime: 3000,
            monthly: 600,
            setupFee: 1000,
            currency: 'TRY'
        },
        features: [
            '📅 Online randevu alma',
            '⏰ Otomatik hatırlatma',
            '🔄 Randevu değiştirme/iptal',
            '📱 Telegram/WhatsApp desteği',
            '📊 Doluluk raporu',
            '🗓️ Google Calendar sync',
            '💬 Müşteri mesajlaşma'
        ],
        requirements: [
            'Telegram Bot Token',
            'Çalışma saatleri bilgisi'
        ],
        customizableFields: [
            { id: 'businessName', name: 'businessName', label: 'İşletme Adı', type: 'text', required: true },
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: true },
            { id: 'services', name: 'services', label: 'Hizmetler', type: 'text', required: true, placeholder: 'Saç kesimi - 30dk, Boyama - 2saat' },
            { id: 'workingHours', name: 'workingHours', label: 'Çalışma Saatleri', type: 'text', required: true, defaultValue: '09:00-19:00' },
            { id: 'workingDays', name: 'workingDays', label: 'Çalışma Günleri', type: 'text', required: true, defaultValue: 'Pazartesi-Cumartesi' },
            { id: 'reminderBefore', name: 'reminderBefore', label: 'Hatırlatma (saat önce)', type: 'number', required: true, defaultValue: 24 }
        ],
        blueprintTemplate: {
            nodes: [
                { type: 'receiver', title: 'Mesaj Alıcı' },
                { type: 'scheduler', title: 'Randevu Planlayıcı' },
                { type: 'reminder', title: 'Hatırlatıcı' },
                { type: 'notifier', title: 'Bildirim Gönderici' }
            ]
        },
        soldCount: 89,
        rating: 4.9,
        reviews: 56
    },
    // ============ YENİ ŞABLONLAR ============
    {
        id: 'email-marketing-pro',
        name: 'E-posta Pazarlama Otomasyonu',
        description: 'AI ile e-posta kampanyaları oluştur, A/B test yap, otomatik takip gönder.',
        category: 'Pazarlama',
        pricing: { oneTime: 4000, monthly: 800, setupFee: 1500, currency: 'TRY' },
        features: [
            '📧 AI ile email yazımı',
            '🎯 Kişiselleştirme',
            '📊 A/B test',
            '⏰ Otomatik takip',
            '📈 Açılma/tıklama analizi',
            '🔄 Drip kampanyalar'
        ],
        requirements: ['SendGrid veya SMTP', 'Email listesi'],
        customizableFields: [
            { id: 'brandName', name: 'brandName', label: 'Marka Adı', type: 'text', required: true },
            { id: 'senderEmail', name: 'senderEmail', label: 'Gönderen Email', type: 'text', required: true },
            { id: 'sendgridKey', name: 'sendgridKey', label: 'SendGrid API Key', type: 'api_key', required: true },
            { id: 'industry', name: 'industry', label: 'Sektör', type: 'text', required: true }
        ],
        blueprintTemplate: { nodes: [{ type: 'writer', title: 'Email Yazıcı' }, { type: 'sender', title: 'Gönderici' }, { type: 'tracker', title: 'Takipçi' }] },
        soldCount: 56, rating: 4.7, reviews: 31
    },
    {
        id: 'dropshipping-price-tracker',
        name: 'Dropshipping Fiyat Takip',
        description: 'AliExpress/Trendyol fiyat takibi, stok uyarıları ve otomatik fiyat güncelleme.',
        category: 'E-Ticaret',
        pricing: { oneTime: 5000, monthly: 1000, setupFee: 2000, currency: 'TRY' },
        features: [
            '🔍 Fiyat scraping',
            '📉 Fiyat düşüş bildirimi',
            '📦 Stok takibi',
            '🔄 Otomatik fiyat güncelleme',
            '📊 Kâr marjı hesaplama',
            '⚠️ Rakip uyarıları'
        ],
        requirements: ['E-ticaret mağazası URL', 'Ürün listesi'],
        customizableFields: [
            { id: 'storeUrl', name: 'storeUrl', label: 'Mağaza URL', type: 'text', required: true },
            { id: 'supplierSites', name: 'supplierSites', label: 'Tedarikçi Siteler', type: 'text', required: true, defaultValue: 'AliExpress, Temu' },
            { id: 'profitMargin', name: 'profitMargin', label: 'Min. Kâr Marjı (%)', type: 'number', required: true, defaultValue: 30 },
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: false }
        ],
        blueprintTemplate: { nodes: [{ type: 'scraper', title: 'Fiyat Scraper' }, { type: 'calculator', title: 'Kâr Hesaplayıcı' }, { type: 'notifier', title: 'Bildirimci' }] },
        soldCount: 73, rating: 4.8, reviews: 44
    },
    {
        id: 'seo-blog-writer',
        name: 'SEO Blog Yazıcı',
        description: 'AI ile SEO uyumlu blog yazıları üret, anahtar kelime optimizasyonu ve otomatik yayınlama.',
        category: 'İçerik',
        pricing: { oneTime: 6000, monthly: 1200, setupFee: 2000, currency: 'TRY' },
        features: [
            '✍️ AI blog yazımı',
            '🔍 Anahtar kelime araştırma',
            '📊 SEO skoru analizi',
            '🖼️ Görsel önerisi',
            '📝 Meta description',
            '🚀 WordPress otomatik yayın'
        ],
        requirements: ['WordPress sitesi (opsiyonel)', 'Hedef anahtar kelimeler'],
        customizableFields: [
            { id: 'websiteUrl', name: 'websiteUrl', label: 'Website URL', type: 'text', required: true },
            { id: 'niche', name: 'niche', label: 'Blog Konusu/Niş', type: 'text', required: true, placeholder: 'Teknoloji, Sağlık, Finans' },
            { id: 'targetKeywords', name: 'targetKeywords', label: 'Hedef Anahtar Kelimeler', type: 'text', required: true },
            { id: 'postsPerWeek', name: 'postsPerWeek', label: 'Haftalık Yazı Sayısı', type: 'number', required: true, defaultValue: 3 },
            { id: 'wordpressApiKey', name: 'wordpressApiKey', label: 'WordPress API Key', type: 'api_key', required: false }
        ],
        blueprintTemplate: { nodes: [{ type: 'researcher', title: 'Keyword Araştırmacı' }, { type: 'writer', title: 'Blog Yazıcı' }, { type: 'optimizer', title: 'SEO Optimizer' }, { type: 'publisher', title: 'Yayıncı' }] },
        soldCount: 92, rating: 4.9, reviews: 58
    },
    {
        id: 'tiktok-viral-creator',
        name: 'TikTok Viral Video Üretici',
        description: 'Trend analizi, video scripti yazımı, caption ve hashtag önerisi.',
        category: 'Sosyal Medya',
        pricing: { oneTime: 3500, monthly: 700, setupFee: 1000, currency: 'TRY' },
        features: [
            '🔥 Trend ses/format analizi',
            '📝 Video scripti yazımı',
            '🎙️ TTS seslendirme',
            '#️⃣ Viral hashtag seti',
            '📊 Performans tahmini',
            '⏰ Optimal paylaşım zamanı'
        ],
        requirements: ['TikTok hesabı', 'Hedef niş'],
        customizableFields: [
            { id: 'accountName', name: 'accountName', label: 'TikTok Kullanıcı Adı', type: 'text', required: true },
            { id: 'niche', name: 'niche', label: 'İçerik Nişi', type: 'text', required: true, placeholder: 'Komedi, Eğitim, Dans' },
            { id: 'videosPerDay', name: 'videosPerDay', label: 'Günlük Video Sayısı', type: 'number', required: true, defaultValue: 3 },
            { id: 'voiceGender', name: 'voiceGender', label: 'Seslendirme', type: 'select', required: true, options: [{ value: 'female', label: 'Kadın' }, { value: 'male', label: 'Erkek' }] }
        ],
        blueprintTemplate: { nodes: [{ type: 'analyzer', title: 'Trend Analyzer' }, { type: 'writer', title: 'Script Writer' }, { type: 'tts', title: 'Voice Generator' }] },
        soldCount: 124, rating: 4.7, reviews: 78
    },
    {
        id: 'linkedin-autopost',
        name: 'LinkedIn Autopost & Engagement',
        description: 'LinkedIn için profesyonel içerik üret, otomatik paylaş ve etkileşim artır.',
        category: 'Sosyal Medya',
        pricing: { oneTime: 4500, monthly: 900, setupFee: 1500, currency: 'TRY' },
        features: [
            '📝 Profesyonel post yazımı',
            '📊 Sektör trend analizi',
            '🤝 Bağlantı önerileri',
            '💬 Yorum yanıtlama',
            '📈 Profil görünürlük artışı',
            '⏰ Optimal zamanlama'
        ],
        requirements: ['LinkedIn hesabı', 'Profesyonel alan bilgisi'],
        customizableFields: [
            { id: 'fullName', name: 'fullName', label: 'Ad Soyad', type: 'text', required: true },
            { id: 'jobTitle', name: 'jobTitle', label: 'Unvan', type: 'text', required: true, placeholder: 'CEO, Pazarlama Müdürü' },
            { id: 'industry', name: 'industry', label: 'Sektör', type: 'text', required: true },
            { id: 'postsPerWeek', name: 'postsPerWeek', label: 'Haftalık Post', type: 'number', required: true, defaultValue: 5 },
            { id: 'tone', name: 'tone', label: 'Yazım Tonu', type: 'select', required: true, options: [{ value: 'thought-leader', label: 'Düşünce Lideri' }, { value: 'mentor', label: 'Mentor' }, { value: 'storyteller', label: 'Hikaye Anlatıcı' }] }
        ],
        blueprintTemplate: { nodes: [{ type: 'researcher', title: 'Trend Araştırmacı' }, { type: 'writer', title: 'Content Writer' }, { type: 'scheduler', title: 'Zamanlayıcı' }] },
        soldCount: 67, rating: 4.6, reviews: 39
    },
    {
        id: 'real-estate-listing',
        name: 'Emlak İlan Botu',
        description: 'Sahibinden/Hepsiemlak ilanları oluştur, açıklama yaz ve fotoğraf düzenle.',
        category: 'Emlak',
        pricing: { oneTime: 5500, monthly: 1100, setupFee: 2000, currency: 'TRY' },
        features: [
            '🏠 İlan açıklaması yazımı',
            '📸 Fotoğraf optimizasyonu',
            '📊 Fiyat analizi',
            '🔄 Çoklu platform paylaşım',
            '📱 WhatsApp entegrasyonu',
            '📈 Görüntülenme takibi'
        ],
        requirements: ['Emlak portföyü', 'İlan platformu hesabı'],
        customizableFields: [
            { id: 'agencyName', name: 'agencyName', label: 'Emlak Ofisi Adı', type: 'text', required: true },
            { id: 'city', name: 'city', label: 'Şehir', type: 'text', required: true, defaultValue: 'İstanbul' },
            { id: 'propertyTypes', name: 'propertyTypes', label: 'Mülk Tipleri', type: 'text', required: true, defaultValue: 'Daire, Villa, Ofis' },
            { id: 'whatsappNumber', name: 'whatsappNumber', label: 'WhatsApp Numarası', type: 'text', required: true }
        ],
        blueprintTemplate: { nodes: [{ type: 'writer', title: 'İlan Yazıcı' }, { type: 'optimizer', title: 'Fotoğraf Optimizer' }, { type: 'publisher', title: 'Yayıncı' }] },
        soldCount: 45, rating: 4.8, reviews: 27
    },
    {
        id: 'invoice-automation',
        name: 'Fatura Otomasyonu',
        description: 'Otomatik fatura oluştur, gönder, hatırlat ve tahsilat takibi yap.',
        category: 'Finans',
        pricing: { oneTime: 3000, monthly: 600, setupFee: 1000, currency: 'TRY' },
        features: [
            '🧾 Otomatik fatura oluşturma',
            '📧 Email ile gönderim',
            '⏰ Vade hatırlatma',
            '💰 Tahsilat takibi',
            '📊 Gelir raporları',
            '📱 Mobil bildirim'
        ],
        requirements: ['Müşteri listesi', 'Email hesabı'],
        customizableFields: [
            { id: 'companyName', name: 'companyName', label: 'Şirket Adı', type: 'text', required: true },
            { id: 'taxNumber', name: 'taxNumber', label: 'Vergi No', type: 'text', required: true },
            { id: 'bankInfo', name: 'bankInfo', label: 'Banka Bilgileri', type: 'text', required: true },
            { id: 'currency', name: 'currency', label: 'Para Birimi', type: 'select', required: true, options: [{ value: 'TRY', label: '₺ TRY' }, { value: 'USD', label: '$ USD' }, { value: 'EUR', label: '€ EUR' }] },
            { id: 'reminderDays', name: 'reminderDays', label: 'Hatırlatma (gün önce)', type: 'number', required: true, defaultValue: 3 }
        ],
        blueprintTemplate: { nodes: [{ type: 'generator', title: 'Fatura Üretici' }, { type: 'sender', title: 'Email Gönderici' }, { type: 'tracker', title: 'Tahsilat Takipçi' }] },
        soldCount: 78, rating: 4.9, reviews: 52
    },
    {
        id: 'competitor-monitor',
        name: 'Rakip İzleme Botu',
        description: 'Rakip fiyat, ürün ve içerik değişikliklerini takip et ve bildirim al.',
        category: 'Veri & Analiz',
        pricing: { oneTime: 4500, monthly: 900, setupFee: 1500, currency: 'TRY' },
        features: [
            '🔍 Rakip web scraping',
            '💰 Fiyat karşılaştırma',
            '📦 Yeni ürün tespiti',
            '📊 Haftalık raporlar',
            '🔔 Anlık bildirimler',
            '📈 Trend analizi'
        ],
        requirements: ['Rakip URL listesi', 'Telegram (bildirim için)'],
        customizableFields: [
            { id: 'competitorUrls', name: 'competitorUrls', label: 'Rakip Siteler', type: 'text', required: true, placeholder: 'www.rakip1.com, www.rakip2.com' },
            { id: 'trackingItems', name: 'trackingItems', label: 'Takip Edilecekler', type: 'text', required: true, defaultValue: 'Fiyat, Ürün, Blog' },
            { id: 'checkFrequency', name: 'checkFrequency', label: 'Kontrol Sıklığı', type: 'select', required: true, options: [{ value: 'hourly', label: 'Saatlik' }, { value: 'daily', label: 'Günlük' }, { value: 'weekly', label: 'Haftalık' }] },
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: true }
        ],
        blueprintTemplate: { nodes: [{ type: 'scraper', title: 'Web Scraper' }, { type: 'comparator', title: 'Karşılaştırıcı' }, { type: 'reporter', title: 'Raporlayıcı' }] },
        soldCount: 54, rating: 4.7, reviews: 33
    },
    {
        id: 'stock-inventory-bot',
        name: 'Stok Takip Botu',
        description: 'Stok seviyelerini izle, düşük stok uyarısı ver ve sipariş öner.',
        category: 'E-Ticaret',
        pricing: { oneTime: 3500, monthly: 700, setupFee: 1000, currency: 'TRY' },
        features: [
            '📦 Gerçek zamanlı stok takibi',
            '⚠️ Düşük stok uyarısı',
            '📊 Satış tahminleri',
            '🛒 Otomatik sipariş önerisi',
            '📈 Stok devir hızı analizi',
            '📱 Mobil bildirim'
        ],
        requirements: ['Ürün listesi', 'E-ticaret platformu'],
        customizableFields: [
            { id: 'storeName', name: 'storeName', label: 'Mağaza Adı', type: 'text', required: true },
            { id: 'platform', name: 'platform', label: 'Platform', type: 'select', required: true, options: [{ value: 'trendyol', label: 'Trendyol' }, { value: 'hepsiburada', label: 'Hepsiburada' }, { value: 'n11', label: 'N11' }, { value: 'shopify', label: 'Shopify' }] },
            { id: 'lowStockThreshold', name: 'lowStockThreshold', label: 'Düşük Stok Eşiği', type: 'number', required: true, defaultValue: 10 },
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: false }
        ],
        blueprintTemplate: { nodes: [{ type: 'tracker', title: 'Stok Takipçi' }, { type: 'analyzer', title: 'Satış Analizci' }, { type: 'notifier', title: 'Uyarıcı' }] },
        soldCount: 61, rating: 4.8, reviews: 38
    },
    {
        id: 'online-course-assistant',
        name: 'Online Kurs Asistanı',
        description: 'Öğrenci sorularını yanıtla, ilerleme takibi yap ve hatırlatmalar gönder.',
        category: 'Eğitim',
        pricing: { oneTime: 4000, monthly: 800, setupFee: 1500, currency: 'TRY' },
        features: [
            '❓ Otomatik soru yanıtlama',
            '📈 İlerleme takibi',
            '⏰ Ders hatırlatmaları',
            '📝 Ödev takibi',
            '🏆 Sertifika oluşturma',
            '💬 Telegram/WhatsApp destek'
        ],
        requirements: ['Kurs içeriği', 'Öğrenci listesi'],
        customizableFields: [
            { id: 'courseName', name: 'courseName', label: 'Kurs Adı', type: 'text', required: true },
            { id: 'instructorName', name: 'instructorName', label: 'Eğitmen Adı', type: 'text', required: true },
            { id: 'coursePlatform', name: 'coursePlatform', label: 'Platform', type: 'select', required: true, options: [{ value: 'udemy', label: 'Udemy' }, { value: 'teachable', label: 'Teachable' }, { value: 'custom', label: 'Kendi Sitem' }] },
            { id: 'telegramToken', name: 'telegramToken', label: 'Telegram Bot Token', type: 'api_key', required: true },
            { id: 'faqContent', name: 'faqContent', label: 'SSS İçeriği', type: 'text', required: true, placeholder: 'Kurs hakkında sık sorulan sorular...' }
        ],
        blueprintTemplate: { nodes: [{ type: 'receiver', title: 'Soru Alıcı' }, { type: 'responder', title: 'AI Yanıtlayıcı' }, { type: 'tracker', title: 'İlerleme Takipçi' }] },
        soldCount: 43, rating: 4.9, reviews: 28
    }
];

// ============================================
// MÜŞTERİ YÖNETİM FONKSİYONLARI
// ============================================

const CUSTOMERS_KEY = 'omniflow_customers';

export const saveCustomer = (customer: Customer): void => {
    const customers = getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);

    if (index >= 0) {
        customers[index] = customer;
    } else {
        customers.push(customer);
    }

    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const getCustomers = (): Customer[] => {
    const stored = localStorage.getItem(CUSTOMERS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getCustomerById = (id: string): Customer | undefined => {
    return getCustomers().find(c => c.id === id);
};

export const deleteCustomer = (id: string): void => {
    const customers = getCustomers().filter(c => c.id !== id);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const createCustomer = (
    name: string,
    email: string,
    plan: Customer['plan'],
    config: CustomerConfig
): Customer => {
    const customer: Customer = {
        id: crypto.randomUUID(),
        name,
        email,
        plan,
        status: 'trial',
        subscriptionStart: Date.now(),
        monthlyFee: plan === 'starter' ? 500 : plan === 'professional' ? 1000 : 2500,
        automations: [],
        customConfig: config,
        createdAt: Date.now()
    };

    saveCustomer(customer);
    return customer;
};

// ============================================
// ŞABLON SATIŞ FONKSİYONLARI
// ============================================

export const getTemplateById = (id: string): SellableTemplate | undefined => {
    return SELLABLE_TEMPLATES.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): SellableTemplate[] => {
    return SELLABLE_TEMPLATES.filter(t => t.category === category);
};

export const getBestSellingTemplates = (limit: number = 5): SellableTemplate[] => {
    return [...SELLABLE_TEMPLATES]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, limit);
};

export const getHighestRatedTemplates = (limit: number = 5): SellableTemplate[] => {
    return [...SELLABLE_TEMPLATES]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
};

// Müşteri için şablon kişiselleştir
export const customizeTemplateForCustomer = (
    template: SellableTemplate,
    customerConfig: Record<string, any>
): any => {
    const blueprint = JSON.parse(JSON.stringify(template.blueprintTemplate));

    // Config değerlerini blueprint'e uygula
    blueprint.customerConfig = customerConfig;
    blueprint.name = `${customerConfig.brandName || 'Custom'} - ${template.name}`;

    return blueprint;
};

// ============================================
// GELİR HESAPLAMA
// ============================================

export interface RevenueStats {
    totalOneTime: number;
    totalMonthly: number;
    totalSetupFees: number;
    totalRevenue: number;
    activeSubscriptions: number;
    averageRevenue: number;
}

export const calculateRevenue = (customers: Customer[]): RevenueStats => {
    const activeCustomers = customers.filter(c => c.status === 'active');

    const totalMonthly = activeCustomers.reduce((sum, c) => sum + c.monthlyFee, 0);
    const totalOneTime = customers.length * 2500; // Ortalama tek seferlik satış
    const totalSetupFees = customers.length * 1000; // Ortalama kurulum ücreti

    return {
        totalOneTime,
        totalMonthly,
        totalSetupFees,
        totalRevenue: totalOneTime + totalSetupFees + (totalMonthly * 12),
        activeSubscriptions: activeCustomers.length,
        averageRevenue: customers.length > 0 ? (totalOneTime + totalSetupFees + totalMonthly) / customers.length : 0
    };
};

export default {
    SELLABLE_TEMPLATES,
    saveCustomer,
    getCustomers,
    getCustomerById,
    deleteCustomer,
    createCustomer,
    getTemplateById,
    getTemplatesByCategory,
    getBestSellingTemplates,
    getHighestRatedTemplates,
    customizeTemplateForCustomer,
    calculateRevenue
};
