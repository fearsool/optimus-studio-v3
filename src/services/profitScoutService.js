"use strict";
/**
 * 🎯 PROFIT SCOUT SERVICE
 * ========================
 * Yeni para kazandıracak otomasyon fırsatlarını bulur.
 *
 * Kaynaklar:
 * - GitHub Trending
 * - Product Hunt API
 * - RapidAPI Directory
 * - n8n/Zapier Templates
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitScoutService = void 0;
// Karlı niş anahtar kelimeler
const PROFIT_KEYWORDS = [
    'ai', 'automation', 'saas', 'api', 'integration',
    'payment', 'crm', 'marketing', 'ecommerce', 'dropshipping',
    'trading', 'crypto', 'arbitrage', 'scraper', 'lead-gen',
    'booking', 'scheduling', 'invoice', 'subscription'
];
// Bilinen karlı API kategorileri
const PROFITABLE_API_CATEGORIES = [
    { name: 'Payment Processing', examples: ['Stripe', 'PayPal', 'Square'], revenue: '₺10,000-50,000/ay' },
    { name: 'E-commerce', examples: ['Shopify', 'WooCommerce', 'Amazon'], revenue: '₺15,000-100,000/ay' },
    { name: 'CRM & Sales', examples: ['HubSpot', 'Salesforce', 'Pipedrive'], revenue: '₺8,000-40,000/ay' },
    { name: 'Marketing Automation', examples: ['Mailchimp', 'ActiveCampaign', 'Klaviyo'], revenue: '₺5,000-30,000/ay' },
    { name: 'AI & ML', examples: ['OpenAI', 'Anthropic', 'Replicate'], revenue: '₺20,000-200,000/ay' },
    { name: 'Social Media', examples: ['Instagram', 'TikTok', 'LinkedIn'], revenue: '₺3,000-25,000/ay' },
    { name: 'Trading & Crypto', examples: ['Binance', 'Coinbase', 'TradingView'], revenue: '₺10,000-500,000/ay' },
    { name: 'Scheduling', examples: ['Calendly', 'Cal.com', 'Acuity'], revenue: '₺2,000-15,000/ay' },
];
class ProfitScoutService {
    constructor() {
        this.opportunities = [];
        this.lastScan = 0;
    }
    /**
     * GitHub Trending'den otomasyon projelerini tara
     */
    async scanGitHubTrending() {
        console.log('🔍 [ProfitScout] GitHub Trending taranıyor...');
        const newOpportunities = [];
        try {
            // Bugünün tarihinden 30 gün önceyi hesapla (yeni repoları bulmak için)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];
            // GitHub Search API - daha spesifik ve YENİ repolar
            const queries = [
                // YENİ ve az bilinen (son 30 gün)
                `automation+api+created:>${dateFilter}+stars:>10`,
                `saas+boilerplate+created:>${dateFilter}+stars:>5`,
                `ai+agent+created:>${dateFilter}+stars:>10`,
                `workflow+builder+created:>${dateFilter}+stars:>5`,
                // Para kazandıran niş alanlar
                'stripe+subscription+template+stars:>20',
                'shopify+automation+stars:>15',
                'trading+bot+python+stars:>50',
                'crypto+arbitrage+stars:>30',
                'lead+generation+automation+stars:>20',
                // Düşük rekabet niş
                'invoice+generator+api+stars:>10',
                'booking+system+open-source+stars:>20',
                'crm+lightweight+stars:>15',
                'email+automation+self-hosted+stars:>10',
                // Trend konular
                'gpt+agent+framework+stars:>50',
                'rag+chatbot+stars:>30',
                'voice+ai+assistant+stars:>20'
            ];
            for (const query of queries) {
                try {
                    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
                    if (!response.ok)
                        continue;
                    const data = await response.json();
                    for (const repo of data.items || []) {
                        // Daha önce eklenmemişse ekle
                        const existingIds = new Set([
                            ...this.opportunities.map(o => o.id),
                            ...newOpportunities.map(o => o.id)
                        ]);
                        if (existingIds.has(`github-${repo.id}`))
                            continue;
                        // Kar potansiyeli skoru hesapla
                        const score = this.calculateProfitScore(repo.name, repo.description || '', repo.stargazers_count);
                        if (score > 30) { // Sadece potansiyeli yüksek olanları ekle
                            newOpportunities.push({
                                id: `github-${repo.id}`,
                                name: repo.name,
                                description: repo.description || 'No description',
                                category: this.guessCategory(repo.name, repo.description || ''),
                                estimatedRevenue: this.estimateRevenue(score),
                                source: 'github_trending',
                                url: repo.html_url,
                                tags: repo.topics || [],
                                score,
                                foundAt: new Date().toISOString()
                            });
                        }
                    }
                    // Rate limit için bekle
                    await new Promise(r => setTimeout(r, 1000));
                }
                catch (e) {
                    console.warn(`Query failed: ${query}`, e);
                }
            }
            console.log(`✅ [ProfitScout] ${newOpportunities.length} yeni fırsat bulundu`);
        }
        catch (error) {
            console.error('[ProfitScout] GitHub scan failed:', error);
        }
        return newOpportunities;
    }
    /**
     * Kar potansiyeli skoru hesapla (1-100)
     */
    calculateProfitScore(name, description, stars) {
        let score = 0;
        const text = `${name} ${description}`.toLowerCase();
        // Karlı anahtar kelimeler için puan
        for (const keyword of PROFIT_KEYWORDS) {
            if (text.includes(keyword))
                score += 10;
        }
        // Star sayısına göre puan
        if (stars > 10000)
            score += 30;
        else if (stars > 1000)
            score += 20;
        else if (stars > 100)
            score += 10;
        // Para ile ilgili kelimeler bonus
        if (text.includes('money') || text.includes('revenue') || text.includes('profit')) {
            score += 15;
        }
        // API/Integration bonus
        if (text.includes('api') || text.includes('integration') || text.includes('connector')) {
            score += 10;
        }
        return Math.min(score, 100);
    }
    /**
     * Kategori tahmin et
     */
    guessCategory(name, description) {
        const text = `${name} ${description}`.toLowerCase();
        if (text.includes('payment') || text.includes('stripe') || text.includes('invoice'))
            return 'money-maker';
        if (text.includes('ecommerce') || text.includes('shop') || text.includes('store'))
            return 'ecommerce';
        if (text.includes('social') || text.includes('instagram') || text.includes('tiktok'))
            return 'social-media';
        if (text.includes('ai') || text.includes('gpt') || text.includes('llm'))
            return 'assistant';
        if (text.includes('trading') || text.includes('crypto') || text.includes('bitcoin'))
            return 'crypto';
        if (text.includes('scrape') || text.includes('crawl'))
            return 'scraper';
        if (text.includes('analytics') || text.includes('report'))
            return 'analytics';
        if (text.includes('video') || text.includes('youtube'))
            return 'video';
        return 'other';
    }
    /**
     * Gelir tahmini
     */
    estimateRevenue(score) {
        if (score >= 80)
            return '₺50,000-200,000/ay';
        if (score >= 60)
            return '₺20,000-50,000/ay';
        if (score >= 40)
            return '₺5,000-20,000/ay';
        return '₺1,000-5,000/ay';
    }
    /**
     * Fırsatları şablona dönüştür
     */
    opportunityToTemplate(opp) {
        return {
            id: `scout-${opp.id}`,
            name: `🎯 ${opp.name}`,
            description: `[SCOUT BULGUSU] ${opp.description}\n\n⭐ Kar Skoru: ${opp.score}/100\n💰 Tahmini: ${opp.estimatedRevenue}`,
            category: opp.category,
            difficulty: opp.score > 60 ? 'hard' : 'medium',
            estimatedRevenue: opp.estimatedRevenue,
            icon: '🎯',
            tags: [...opp.tags, 'scout', 'trending', opp.source],
            sourceUrl: opp.url,
            refineLevel: 'ore',
            sellable: false,
            blockingReasons: [
                { reason: 'Scout tarafından bulundu - analiz gerekli', source: 'importer', resolved: false }
            ]
        };
    }
    /**
     * Tam tarama yap ve yeni fırsatları localStorage'a ekle
     * FABRİKADAKİ TÜM ŞABLONLARI KONTROL EDER
     */
    async runFullScan() {
        console.log('🚀 [ProfitScout] Tam tarama başlıyor...');
        console.log('📦 [ProfitScout] Fabrikadaki mevcut şablonlar kontrol ediliyor...');
        // 1. Fabrikadaki TÜM şablonları al
        const { getTemplates } = await Promise.resolve().then(() => __importStar(require('./templateService')));
        const factoryTemplates = await getTemplates();
        // Mevcut şablon isimlerini normalize et (küçük harf, tire yerine boşluk)
        const existingNames = new Set(factoryTemplates.map(t => t.name.toLowerCase().replace(/[-_]/g, ' ').replace(/\[ham\]/gi, '').trim()));
        const existingIds = new Set(factoryTemplates.map(t => t.id));
        console.log(`📊 [ProfitScout] Fabrikada ${factoryTemplates.length} şablon mevcut`);
        // 2. GitHub'dan yeni fırsatları tara (MEVCUT)
        const githubOpps = await this.scanGitHubTrending();
        // 3. AI ile Orijinal Fikirer Üret (YENİ)
        console.log('🧠 [ProfitScout] AI Idea Generator çalıştırılıyor...');
        let aiOpps = [];
        try {
            const { aiIdeaGeneratorService } = await Promise.resolve().then(() => __importStar(require('./aiIdeaGenerator')));
            const generatedIdeas = await aiIdeaGeneratorService.generateOriginalIdeas(5, factoryTemplates);
            aiOpps = generatedIdeas.map((idea, index) => ({
                id: `ai-gen-${Date.now()}-${index}`,
                name: idea.name,
                description: idea.description,
                category: idea.category,
                estimatedRevenue: idea.estimatedRevenue,
                source: 'ai_generated',
                url: '', // AI generated
                tags: [...idea.features, 'ai-original', idea.difficulty],
                score: idea.profitScore,
                foundAt: new Date().toISOString()
            }));
            console.log(`🧠 [ProfitScout] ${aiOpps.length} AI fikri hazır.`);
        }
        catch (error) {
            console.error('AI Generation Failed:', error);
        }
        // 4. Tüm havuzu birleştir
        const allFindings = [...githubOpps, ...aiOpps];
        // 5. Fabrikada OLMAYANLARI filtrele
        let skippedCount = 0;
        const trulyNew = allFindings.filter(opp => {
            const normalizedName = opp.name.toLowerCase().replace(/[-_]/g, ' ').trim();
            const scoutId = opp.source === 'ai_generated' ? opp.id : `scout-${opp.id}`;
            // İsim veya ID zaten varsa atla
            if (existingNames.has(normalizedName) || existingIds.has(scoutId)) {
                // AI fikirleri çok değerli, isim benzerliği olsa bile (v2) olarak ekle
                if (opp.source === 'ai_generated')
                    return true;
                console.log(`⏭️ [ProfitScout] Atlandı (zaten var): ${opp.name}`);
                skippedCount++;
                return false;
            }
            return true;
        });
        console.log(`🆕 [ProfitScout] ${trulyNew.length} gerçekten yeni fırsat bulundu (${skippedCount} atlandı)`);
        // 6. localStorage'a ekle
        try {
            const existing = JSON.parse(localStorage.getItem('scout_opportunities') || '[]');
            const existingOppIds = new Set(existing.map((o) => o.id));
            const uniqueNew = trulyNew.filter(o => !existingOppIds.has(o.id));
            const merged = [...existing, ...uniqueNew];
            localStorage.setItem('scout_opportunities', JSON.stringify(merged));
            // Template olarak da ekle
            const templates = JSON.parse(localStorage.getItem('imported_templates') || '[]');
            const templateIds = new Set(templates.map((t) => t.id));
            const newTemplates = uniqueNew
                .filter(o => {
                const tId = o.source === 'ai_generated' ? o.id : `scout-${o.id}`;
                return !templateIds.has(tId);
            })
                .map(o => this.opportunityToTemplate(o));
            const mergedTemplates = [...templates, ...newTemplates];
            localStorage.setItem('imported_templates', JSON.stringify(mergedTemplates));
            console.log(`✅ [ProfitScout] ${uniqueNew.length} yeni fırsat eklendi (Toplam: ${merged.length})`);
            return { added: uniqueNew.length, total: merged.length, skipped: skippedCount };
        }
        catch (e) {
            console.error('[ProfitScout] Storage error:', e);
            return { added: 0, total: 0, skipped: 0 };
        }
    }
    /**
     * Mevcut fırsatları getir
     */
    getOpportunities() {
        try {
            return JSON.parse(localStorage.getItem('scout_opportunities') || '[]');
        }
        catch (_a) {
            return [];
        }
    }
}
exports.profitScoutService = new ProfitScoutService();
exports.default = exports.profitScoutService;
