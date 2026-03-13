// ============================================
// AUTOMATION IDEAS DISCOVERY SERVICE
// Otomasyon fikirleri keşfetme ve analiz
// ============================================

export interface AutomationIdea {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedValue: string;
    targetAudience: string;
    requiredTools: string[];
    potentialRevenue: string;
    competitionLevel: 'low' | 'medium' | 'high';
    tags: string[];
    steps: string[];
    monetization: string[];
}

// ============================================
// POPÜLER OTOMASİYON FİKİRLERİ VERİTABANI
// ============================================

export const AUTOMATION_IDEAS: AutomationIdea[] = [
    // ===== SOSYAL MEDYA =====
    {
        id: 'instagram-content-factory',
        title: 'Instagram İçerik Fabrikası',
        description: 'Her gün otomatik post, story ve reels içeriği üret, görsel oluştur, caption yaz',
        category: 'Sosyal Medya',
        difficulty: 'medium',
        estimatedValue: '$200-500/müşteri',
        targetAudience: 'Küçük işletmeler, influencerlar, ajanslar',
        requiredTools: ['Gemini AI', 'DALL-E/Midjourney', 'Canva API'],
        potentialRevenue: '$2000-5000/ay',
        competitionLevel: 'high',
        tags: ['instagram', 'content', 'social-media', 'ai'],
        steps: [
            'Trend konuları araştır',
            'AI ile içerik metni üret',
            'Görsel oluştur veya şablon hazırla',
            'Hashtag seti oluştur',
            'Zamanlama yap'
        ],
        monetization: ['Aylık abonelik', 'İçerik başına ücret', 'Paket satışı']
    },
    {
        id: 'tiktok-viral-machine',
        title: 'TikTok Viral Video Makinesi',
        description: 'Trend sesleri analiz et, viral video scripti yaz, thumbnail oluştur',
        category: 'Sosyal Medya',
        difficulty: 'medium',
        estimatedValue: '$150-400/müşteri',
        targetAudience: 'İçerik üreticileri, markalar',
        requiredTools: ['AI', 'TTS', 'Video editör'],
        potentialRevenue: '$1500-4000/ay',
        competitionLevel: 'medium',
        tags: ['tiktok', 'viral', 'video', 'trends'],
        steps: [
            'Trend sesleri ve formatları analiz et',
            'Video scripti yaz',
            'Seslendirme yap',
            'Görsel/video hazırla',
            'Açıklama ve hashtag ekle'
        ],
        monetization: ['Video başına ücret', 'Paket satışı', 'Eğitim kursu']
    },

    // ===== E-TİCARET =====
    {
        id: 'product-description-generator',
        title: 'Ürün Açıklaması Otomasyonu',
        description: 'E-ticaret ürünleri için SEO uyumlu, satış odaklı açıklamalar üret',
        category: 'E-Ticaret',
        difficulty: 'easy',
        estimatedValue: '$100-300/müşteri',
        targetAudience: 'E-ticaret mağazaları, dropshipperlar',
        requiredTools: ['AI', 'Web scraper'],
        potentialRevenue: '$1000-3000/ay',
        competitionLevel: 'medium',
        tags: ['ecommerce', 'seo', 'copywriting', 'products'],
        steps: [
            'Ürün bilgilerini al',
            'Rakip ürünleri analiz et',
            'SEO anahtar kelimeleri belirle',
            'Satış odaklı açıklama yaz',
            'Bullet points oluştur'
        ],
        monetization: ['Ürün başına ücret', 'Toplu paket', 'Aylık abonelik']
    },
    {
        id: 'price-tracker',
        title: 'Fiyat Takip ve Bildirim Botu',
        description: 'Rakip fiyatları takip et, fiyat düşünce bildirim gönder',
        category: 'E-Ticaret',
        difficulty: 'medium',
        estimatedValue: '$200-500/müşteri',
        targetAudience: 'E-ticaret sahipleri, arbitrajcılar',
        requiredTools: ['Web scraper', 'Database', 'Bildirim servisi'],
        potentialRevenue: '$1500-4000/ay',
        competitionLevel: 'low',
        tags: ['price', 'monitoring', 'alerts', 'ecommerce'],
        steps: [
            'Hedef ürün/siteleri belirle',
            'Fiyat scraping sistemi kur',
            'Veritabanına kaydet',
            'Fark hesapla',
            'Bildirim gönder'
        ],
        monetization: ['Aylık abonelik', 'Ürün sayısına göre fiyatlandırma']
    },

    // ===== YAZI & İÇERİK =====
    {
        id: 'blog-autopilot',
        title: 'Blog Otopilot Sistemi',
        description: 'SEO uyumlu blog yazıları otomatik üret ve yayınla',
        category: 'İçerik',
        difficulty: 'medium',
        estimatedValue: '$300-800/müşteri',
        targetAudience: 'Bloggerlar, şirketler, ajanslar',
        requiredTools: ['AI', 'SEO araçları', 'WordPress API'],
        potentialRevenue: '$2000-6000/ay',
        competitionLevel: 'high',
        tags: ['blog', 'seo', 'content', 'wordpress'],
        steps: [
            'Anahtar kelime araştır',
            'Rakip içerikleri analiz et',
            'Yapılı içerik üret',
            'Görseller ekle',
            'SEO optimize et',
            'Otomatik yayınla'
        ],
        monetization: ['Yazı başına ücret', 'Aylık paket', 'White-label hizmet']
    },
    {
        id: 'newsletter-automation',
        title: 'Newsletter Otomasyon Sistemi',
        description: 'Haftalık bülten içeriği hazırla ve gönder',
        category: 'İçerik',
        difficulty: 'easy',
        estimatedValue: '$150-400/müşteri',
        targetAudience: 'Girişimciler, topluluk yöneticileri',
        requiredTools: ['AI', 'Email servisi'],
        potentialRevenue: '$1000-3000/ay',
        competitionLevel: 'medium',
        tags: ['newsletter', 'email', 'automation'],
        steps: [
            'Haftalık konuları topla',
            'İçerik özetleri yaz',
            'Email şablonu hazırla',
            'Listeye gönder',
            'Metrikleri takip et'
        ],
        monetization: ['Aylık abonelik', 'Gönderim başına ücret']
    },

    // ===== MÜŞTERİ HİZMETLERİ =====
    {
        id: 'ai-customer-support',
        title: 'AI Müşteri Destek Botu',
        description: '7/24 otomatik müşteri desteği, SSS yanıtlama, bilet yönlendirme',
        category: 'Müşteri Hizmetleri',
        difficulty: 'hard',
        estimatedValue: '$500-2000/müşteri',
        targetAudience: 'E-ticaret, SaaS, hizmet firmaları',
        requiredTools: ['AI', 'Chatbot platform', 'CRM entegrasyonu'],
        potentialRevenue: '$5000-15000/ay',
        competitionLevel: 'medium',
        tags: ['chatbot', 'support', 'ai', 'customer-service'],
        steps: [
            'SSS veritabanı oluştur',
            'AI modeli eğit',
            'Chatbot entegre et',
            'Eskalasyon kuralları koy',
            'Raporlama ekle'
        ],
        monetization: ['Aylık abonelik', 'Konuşma başına ücret', 'Kurulum ücreti']
    },
    {
        id: 'appointment-booking-bot',
        title: 'Randevu Hatırlatma & Yönetim Botu',
        description: 'WhatsApp/Telegram üzerinden randevu al, hatırlat, yönet',
        category: 'Müşteri Hizmetleri',
        difficulty: 'medium',
        estimatedValue: '$200-600/müşteri',
        targetAudience: 'Kuaförler, doktorlar, danışmanlar',
        requiredTools: ['Messaging API', 'Takvim entegrasyonu'],
        potentialRevenue: '$1500-5000/ay',
        competitionLevel: 'low',
        tags: ['appointment', 'reminder', 'whatsapp', 'booking'],
        steps: [
            'Mesajlaşma platformu entegre et',
            'Takvim sistemi bağla',
            'Randevu akışı oluştur',
            'Hatırlatıcılar kur',
            'İptal/değişiklik izin ver'
        ],
        monetization: ['Aylık abonelik', 'Randevu başına ücret']
    },

    // ===== VERİ & ANALİZ =====
    {
        id: 'lead-generator',
        title: 'Lead Generator & Enrichment',
        description: 'LinkedIn/websitelerden lead topla, email bul, CRM\'e aktar',
        category: 'Satış',
        difficulty: 'medium',
        estimatedValue: '$300-1000/müşteri',
        targetAudience: 'B2B satış ekipleri, ajanslar',
        requiredTools: ['Web scraper', 'Email finder API', 'CRM API'],
        potentialRevenue: '$3000-10000/ay',
        competitionLevel: 'medium',
        tags: ['leads', 'sales', 'b2b', 'scraping'],
        steps: [
            'Hedef şirketleri belirle',
            'LinkedIn/web scraping yap',
            'Email enrichment uygula',
            'Lead skorlama yap',
            'CRM\'e aktar'
        ],
        monetization: ['Lead başına ücret', 'Aylık paket', 'Komisyon modeli']
    },
    {
        id: 'competitor-monitor',
        title: 'Rakip İzleme & Analiz Botu',
        description: 'Rakiplerin fiyat, ürün, içerik değişikliklerini takip et',
        category: 'Veri & Analiz',
        difficulty: 'medium',
        estimatedValue: '$200-800/müşteri',
        targetAudience: 'E-ticaret, pazarlamacılar',
        requiredTools: ['Web scraper', 'Database', 'Bildirim'],
        potentialRevenue: '$2000-6000/ay',
        competitionLevel: 'low',
        tags: ['competitor', 'monitoring', 'analysis'],
        steps: [
            'Rakip listesi oluştur',
            'İzlenecek metrikleri belirle',
            'Düzenli scraping yap',
            'Değişiklikleri tespit et',
            'Rapor ve bildirim gönder'
        ],
        monetization: ['Aylık abonelik', 'Rakip sayısına göre fiyat']
    },

    // ===== FİNANS & KRİPTO =====
    {
        id: 'crypto-signal-bot',
        title: 'Kripto Sinyal & Alert Botu',
        description: 'Teknik analiz yap, al/sat sinyalleri gönder',
        category: 'Finans',
        difficulty: 'hard',
        estimatedValue: '$100-500/ay (abone)',
        targetAudience: 'Kripto yatırımcıları',
        requiredTools: ['Exchange API', 'Teknik analiz', 'Telegram'],
        potentialRevenue: '$5000-20000/ay',
        competitionLevel: 'high',
        tags: ['crypto', 'trading', 'signals', 'alerts'],
        steps: [
            'Exchange API bağla',
            'Teknik göstergeleri hesapla',
            'Sinyal algoritması oluştur',
            'Risk yönetimi ekle',
            'Telegram grubuna gönder'
        ],
        monetization: ['Aylık abonelik', 'Performans komisyonu']
    },
    {
        id: 'invoice-automation',
        title: 'Fatura Otomasyon & Tahsilat',
        description: 'Otomatik fatura oluştur, gönder, hatırlat, takip et',
        category: 'Finans',
        difficulty: 'medium',
        estimatedValue: '$100-400/müşteri',
        targetAudience: 'Freelancerlar, küçük işletmeler',
        requiredTools: ['PDF oluşturucu', 'Email', 'Ödeme entegrasyonu'],
        potentialRevenue: '$1000-4000/ay',
        competitionLevel: 'medium',
        tags: ['invoice', 'billing', 'automation'],
        steps: [
            'Müşteri verilerini al',
            'Fatura şablonu oluştur',
            'PDF üret',
            'Email ile gönder',
            'Ödeme takibi yap',
            'Hatırlatıcı gönder'
        ],
        monetization: ['Fatura başına ücret', 'Aylık paket']
    },

    // ===== VIDEO & MEDYA =====
    {
        id: 'video-repurposing',
        title: 'Video Repurposing Otomasyonu',
        description: 'Uzun videoları kısa kliplere böl, altyazı ekle, farklı platformlara uyarla',
        category: 'Video',
        difficulty: 'hard',
        estimatedValue: '$200-800/video',
        targetAudience: 'YouTuberlar, kursçular, podcast sahipleri',
        requiredTools: ['FFmpeg', 'Whisper AI', 'Video API'],
        potentialRevenue: '$2000-8000/ay',
        competitionLevel: 'low',
        tags: ['video', 'repurposing', 'clips', 'subtitles'],
        steps: [
            'Uzun videoyu analiz et',
            'Önemli anları tespit et',
            'Kısa klipler oluştur',
            'Altyazı ekle',
            'Platform boyutlarına uyarla'
        ],
        monetization: ['Video başına ücret', 'Dakika başına ücret', 'Paket']
    },
    {
        id: 'podcast-transcription',
        title: 'Podcast Transkripsiyon & Blog',
        description: 'Podcast bölümlerini metne çevir, blog yazısına dönüştür',
        category: 'Video',
        difficulty: 'medium',
        estimatedValue: '$50-200/bölüm',
        targetAudience: 'Podcast sahipleri',
        requiredTools: ['Whisper AI', 'AI yazı', 'Blog CMS'],
        potentialRevenue: '$1000-4000/ay',
        competitionLevel: 'low',
        tags: ['podcast', 'transcription', 'blog', 'content'],
        steps: [
            'Ses dosyasını al',
            'Whisper ile metne çevir',
            'AI ile blog formatına dönüştür',
            'SEO optimize et',
            'Yayınla'
        ],
        monetization: ['Bölüm başına ücret', 'Aylık paket']
    }
];

// ============================================
// FİKİR KEŞİF FONKSİYONLARI
// ============================================

// Kategoriye göre filtrele
export const getIdeasByCategory = (category: string): AutomationIdea[] => {
    return AUTOMATION_IDEAS.filter(idea => idea.category === category);
};

// Zorluğa göre filtrele
export const getIdeasByDifficulty = (difficulty: AutomationIdea['difficulty']): AutomationIdea[] => {
    return AUTOMATION_IDEAS.filter(idea => idea.difficulty === difficulty);
};

// Rekabet seviyesine göre filtrele
export const getIdeasByCompetition = (level: AutomationIdea['competitionLevel']): AutomationIdea[] => {
    return AUTOMATION_IDEAS.filter(idea => idea.competitionLevel === level);
};

// Tüm kategorileri getir
export const getCategories = (): string[] => {
    return [...new Set(AUTOMATION_IDEAS.map(idea => idea.category))];
};

// Rastgele fikir öner
export const getRandomIdea = (): AutomationIdea => {
    return AUTOMATION_IDEAS[Math.floor(Math.random() * AUTOMATION_IDEAS.length)];
};

// En kârlı fikirleri getir
export const getMostProfitableIdeas = (limit: number = 5): AutomationIdea[] => {
    return [...AUTOMATION_IDEAS]
        .sort((a, b) => {
            const aVal = parseInt(a.potentialRevenue.replace(/[^0-9]/g, ''));
            const bVal = parseInt(b.potentialRevenue.replace(/[^0-9]/g, ''));
            return bVal - aVal;
        })
        .slice(0, limit);
};

// Düşük rekabetli fikirleri getir
export const getLowCompetitionIdeas = (): AutomationIdea[] => {
    return AUTOMATION_IDEAS.filter(idea => idea.competitionLevel === 'low');
};

// Başlangıç için uygun fikirleri getir
export const getBeginnerFriendlyIdeas = (): AutomationIdea[] => {
    return AUTOMATION_IDEAS.filter(idea => idea.difficulty === 'easy');
};

// Tag'e göre ara
export const searchIdeasByTag = (tag: string): AutomationIdea[] => {
    return AUTOMATION_IDEAS.filter(idea =>
        idea.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
};

// Anahtar kelimeye göre ara
export const searchIdeas = (query: string): AutomationIdea[] => {
    const lower = query.toLowerCase();
    return AUTOMATION_IDEAS.filter(idea =>
        idea.title.toLowerCase().includes(lower) ||
        idea.description.toLowerCase().includes(lower) ||
        idea.tags.some(t => t.toLowerCase().includes(lower))
    );
};

export default {
    AUTOMATION_IDEAS,
    getIdeasByCategory,
    getIdeasByDifficulty,
    getIdeasByCompetition,
    getCategories,
    getRandomIdea,
    getMostProfitableIdeas,
    getLowCompetitionIdeas,
    getBeginnerFriendlyIdeas,
    searchIdeasByTag,
    searchIdeas
};
