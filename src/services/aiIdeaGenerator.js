"use strict";
/**
 * 🧠 AI IDEA GENERATOR SERVICE
 * =============================
 * Gemini AI kullanarak, mevcut pazar boşluklarına ve trendlere göre
 * tamamen orijinal ve yüksek kar potansiyelli otomasyon fikirleri üretir.
 *
 * Kaynaklar:
 * - Fabrikadaki mevcut şablonlar (Anti-Pattern: neyi yapmayacağını bilmesi için)
 * - Pazar trendleri (Hardcoded + Dynamic)
 * - YouTube Council (Entegre Fikir Doğrulama)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiIdeaGeneratorService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const groqService_1 = require("./integrations/groqService");
// Gemini Model Yapılandırması
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const SYSTEM_PROMPT = `
SEN OMNIFLOW FACTORY'NİN BAŞ MİMARI VE VİZYONERİSİN.
GÖREVİN: Piyasada henüz olmayan veya çok az yapılan, yüksek kar potansiyelli (high ROI) otomasyon fikirleri üretmek.

PRENSİPLERİN:
1. ORİJİNALLİK: Asla "To-Do List", "Hava Durumu Botu" gibi basit şeyler önerme.
2. KAR ODAKLI: Her fikrin net bir para kazanma modeli olmalı (SaaS, Micro-SaaS, Lead Gen).
3. NİŞ ODAKLI: Geniş kitleler yerine, spesifik ve para harcayan kitleleri hedefle (Emlakçılar, Diş Hekimleri, E-ticaret Satıcıları).
4. TEKNİK FİZİBİLİTE: n8n, Zapier ve API'lerle yapılabilir olmalı.

KATEGORİLER:
- money-maker: Doğrudan gelir getirenler
- content: İçerik üretimi ve pazarlama
- scraper: Veri madenciliği ve lead bulma
- assistant: İş yükünü azaltan AI asistanlar
- crypto: Finansal otomasyonlar
- ecommerce: Satış artırıcı araçlar

ÇIKTI FORMATI (JSON ARRAY):
[
  {
    "name": "Örnek Otomasyon İsmi",
    "description": "Detaylı açıklama...",
    "category": "money-maker",
    "targetUser": ["Emlakçılar", "Yatırımcılar"],
    "monetization": "subscription",
    "estimatedRevenue": "₺20,000-50,000/ay",
    "features": ["Özellik 1", "Özellik 2"],
    "requiredApis": [{"name": "OPENAI_API_KEY", "label": "OpenAI Key", "description": "AI motoru"}],
    "difficulty": "medium",
    "profitScore": 85,
    "reasoning": "Neden bu fikir tutar? Pazar analizi..."
  }
]
`;
class AiIdeaGeneratorService {
    /**
     * Tamamen yeni otomasyon fikirleri üret
     * @param count Üretilecek fikir sayısı
     * @param existingTemplates Fabrikadaki mevcut şablonlar (tekrarı önlemek için)
     */
    async generateOriginalIdeas(count = 5, existingTemplates) {
        const takenIdeas = existingTemplates.map(t => t.name).slice(0, 50).join(', ');
        const userPrompt = `
            MEVCUT ŞABLONLARIMIZ (BUNLARI TEKRAR ETME):
            ${takenIdeas}

            Lütfen ${count} adet YENİ ve BENZERSİZ otomasyon fikri üret.
            Odak: Micro-SaaS potansiyeli olan, B2B çözümler.
            `;
        // 1. Try Gemini
        if (API_KEY) {
            try {
                console.log('🧠 [AiIdeaGenerator] Gemini fikir üretiyor...');
                const result = await model.generateContent([SYSTEM_PROMPT, userPrompt]);
                const response = result.response;
                const text = response.text();
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const ideas = JSON.parse(jsonStr);
                console.log(`✅ [AiIdeaGenerator] Gemini ${ideas.length} fikir üretti.`);
                return ideas;
            }
            catch (error) {
                console.warn('[AiIdeaGenerator] Gemini failed, switching to Groq...', error);
            }
        }
        // 2. Try Groq (Llama 3)
        try {
            console.log('⚡ [AiIdeaGenerator] Groq (Llama 3) devreye giriyor...');
            const groqIdeas = await groqService_1.groqService.generateJSON(SYSTEM_PROMPT, userPrompt);
            if (groqIdeas && Array.isArray(groqIdeas)) {
                console.log(`✅ [AiIdeaGenerator] Groq ${groqIdeas.length} fikir üretti.`);
                return groqIdeas;
            }
        }
        catch (e) {
            console.error('[AiIdeaGenerator] Groq failed:', e);
        }
        // 3. Fallback
        console.warn('[AiIdeaGenerator] All AIs failed. Using mocks.');
        return this.getMockIdeas();
    }
    /**
     * API Key yoksa veya hata olursa kullanılacak yedek, elle seçilmiş fikirler
     */
    getMockIdeas() {
        return [
            {
                name: "AI Personal Branding Coach",
                description: "LinkedIn ve Twitter profillerini analiz eder, kişisel marka stratejisi oluşturur ve günlük post önerileri sunar.",
                category: "content",
                targetUser: ["CEO'lar", "Freelancerlar"],
                monetization: "subscription",
                estimatedRevenue: "₺5,000-15,000/ay",
                features: ["Profil Analizi", "İçerik Stratejisi", "Viral Hook Üretici"],
                requiredApis: [{ name: "OPENAI_API_KEY", label: "OpenAI", description: "İçerik üretimi" }],
                difficulty: "medium",
                profitScore: 75,
                reasoning: "Kişisel markalaşma trendi çok yüksek, insanlar ne yazacaklarını bilmiyor."
            },
            {
                name: "Airbnb Dynamic Pricing & Guest Bot",
                description: "Yerel etkinliklere ve doluluk oranına göre fiyatı günceller, misafir sorularını otomatik yanıtlar.",
                category: "money-maker",
                targetUser: ["Airbnb Ev Sahipleri"],
                monetization: "subscription",
                estimatedRevenue: "₺10,000-30,000/ay",
                features: ["Fiyat Optimizasyonu", "Oto-Mesajlaşma", "Yorum Takibi"],
                requiredApis: [{ name: "OPENAI_API_KEY", label: "OpenAI", description: "Chatbot" }],
                difficulty: "hard",
                profitScore: 88,
                reasoning: "Ev sahipleri için zaman = para. Otomasyon doğrudan gelir artırır."
            }
        ];
    }
}
exports.aiIdeaGeneratorService = new AiIdeaGeneratorService();
exports.default = exports.aiIdeaGeneratorService;
