/**
 * Universal Automation Generator
 * Her şablonu dinamik olarak çalışır hale getirir
 */

// Şablon kategorileri ve genel promptları
export const CATEGORY_PROMPTS: Record<string, string> = {
    // İçerik Üretimi
    "content": `Sen profesyonel bir içerik üreticisisin. Kullanıcının istediği içeriği oluştur.
Kurallar:
- Türkçe ve profesyonel yaz
- Hedef kitleye uygun ton kullan
- SEO ve engagement optimize et`,

    // Sosyal Medya
    "social": `Sen viral sosyal medya içerik uzmanısın. Platform kurallarına uygun içerik üret.
Kurallar:
- Platform limitlerini aşma (Twitter 280 karakter vb)
- Hashtag ve emoji kullan
- Engagement tetikle`,

    // E-Ticaret
    "ecommerce": `Sen e-ticaret ve satış uzmanısın. Satış odaklı içerik üret.
Kurallar:
- İkna edici ve profesyonel yaz
- Ürün faydalarını vurgula
- Call-to-action ekle`,

    // SEO
    "seo": `Sen SEO uzmanısın. Arama motorları için optimize çıktı üret.
Kurallar:
- Anahtar kelimeleri doğal kullan
- Meta bilgileri optimize et
- Karakter limitlerini aşma`,

    // Yapay Zeka
    "ai": `Sen yapay zeka ve otomasyon uzmanısın. Teknik ve profesyonel içerik üret.
Kurallar:
- Anlaşılır ve net açıklamalar yap
- Teknik terimleri açıkla
- Pratik öneriler ver`,

    // Finans/Kripto
    "finance": `Sen finans ve yatırım analistisin. Dikkatli ve bilgilendirici içerik üret.
Kurallar:
- Yatırım tavsiyesi değil, bilgi ver
- Risk uyarıları ekle
- Veri tabanlı analiz yap`,

    // Video/Görsel
    "video": `Sen viral içerik ve video script uzmanısın. Hook ve CTA odaklı yaz.
Kurallar:
- Dikkat çekici açılış yap
- Kısa ve etkili mesaj ver
- Aksiyon çağrısı ekle`,

    // Müşteri Hizmetleri
    "customer": `Sen müşteri hizmetleri uzmanısın. Profesyonel ve yardımcı ol.
Kurallar:
- Nazik ve profesyonel ton
- Sorunları çöz
- Müşteriyi memnun et`,

    // Para Kazandıran
    "money-maker": `Sen dijital girişimci ve monetizasyon uzmanısın. Gelir odaklı stratejiler üret.
Kurallar:
- Pratik ve uygulanabilir öneriler ver
- Gerçekçi gelir potansiyeli belirt
- Aksiyon adımları sun`,

    // Dijital Ürün
    "digital": `Sen dijital ürün ve online satış uzmanısın. Değer odaklı içerik üret.
Kurallar:
- Ürün değerini vurgula
- Satış odaklı açıklama yap
- Platform kurallarına uy`,

    // Genel
    "default": `Sen profesyonel bir yapay zeka asistanısın. İstenen görevi en iyi şekilde tamamla.
Kurallar:
- Türkçe ve profesyonel yaz
- Net ve anlaşılır ol
- Değer katan içerik üret`
};

/**
 * Şablon bilgisinden dinamik prompt oluştur
 */
export function generateDynamicPrompt(template: {
    name: string;
    description: string;
    category?: string;
    tags?: string[];
}, userInput: string): string {
    const category = template.category || 'default';
    const basePrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['default'];

    return `${basePrompt}

GÖREV: ${template.name}
AÇIKLAMA: ${template.description}
${template.tags ? `KONULAR: ${template.tags.join(', ')}` : ''}

KULLANICI GİRDİSİ:
${userInput}

ÇIKTI:`;
}

/**
 * Şablon ID'sinden otomatik prompt oluştur
 */
export function templateIdToPrompt(templateId: string, input: string): string {
    // Template ID'den category çıkar
    const categoryMap: Record<string, string> = {
        'blog': 'content',
        'instagram': 'social',
        'twitter': 'social',
        'tweet': 'social',
        'linkedin': 'social',
        'etsy': 'ecommerce',
        'amazon': 'ecommerce',
        'product': 'ecommerce',
        'seo': 'seo',
        'meta': 'seo',
        'ai': 'ai',
        'gpt': 'ai',
        'crypto': 'finance',
        'trading': 'finance',
        'video': 'video',
        'tiktok': 'video',
        'reels': 'video',
        'script': 'video',
        'email': 'customer',
        'support': 'customer',
        'money': 'money-maker',
        'income': 'money-maker',
        'digital': 'digital',
        'ebook': 'digital',
        'course': 'digital'
    };

    // Template ID'deki kelimelere bak
    let category = 'default';
    for (const [keyword, cat] of Object.entries(categoryMap)) {
        if (templateId.toLowerCase().includes(keyword)) {
            category = cat;
            break;
        }
    }

    const basePrompt = CATEGORY_PROMPTS[category];

    // Template ID'den readable name oluştur
    const readableName = templateId
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    return `${basePrompt}

GÖREV: ${readableName}

KULLANICI GİRDİSİ:
${input}

Lütfen yukarıdaki görevi tamamla. Türkçe ve profesyonel içerik üret.

ÇIKTI:`;
}

export const UniversalAutomation = {
    CATEGORY_PROMPTS,
    generateDynamicPrompt,
    templateIdToPrompt
};
