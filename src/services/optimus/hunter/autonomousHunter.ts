/**
 * 🔍 OPTIMUS AUTONOMOUS HUNTER
 * ============================
 * Otomatik araştırma ve şablon üretim motoru
 * 
 * Özellikler:
 * - GitHub, n8n, Zapier, Gumroad, Web araştırması
 * - Problem tespiti ve çözüm üretimi
 * - Rakip analizi ve iyileştirme
 * - Otomatik şablon oluşturma
 * - Zamanlayıcı ile periyodik çalışma
 */

import { groqService } from '../../integrations/groqService';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ResearchSource {
    name: string;
    type: 'github' | 'n8n' | 'zapier' | 'gumroad' | 'web';
    enabled: boolean;
    apiUrl?: string;
    searchTerms: string[];
}

export interface DiscoveredProblem {
    id: string;
    title: string;
    description: string;
    source: string;
    category: string;
    painLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    targetAudience: string;
    existingSolutions: ExistingSolution[];
    discoveredAt: string;
}

export interface ExistingSolution {
    name: string;
    source: string;
    url?: string;
    price?: string;
    features: string[];
    weaknesses: string[];
    rating?: number;
}

export interface GeneratedTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    problem: DiscoveredProblem;
    improvements: string[];
    blueprint: any;
    estimatedRevenue: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    status: 'draft' | 'ready' | 'approved' | 'published';
    createdAt: string;
}

export interface HunterReport {
    runId: string;
    startedAt: string;
    completedAt: string;
    sourcesSearched: string[];
    problemsFound: number;
    templatesGenerated: number;
    topOpportunities: DiscoveredProblem[];
    generatedTemplates: GeneratedTemplate[];
}

// ============================================
// RESEARCH SOURCES
// ============================================

const DEFAULT_SOURCES: ResearchSource[] = [
    {
        name: 'GitHub Awesome Lists',
        type: 'github',
        enabled: true,
        searchTerms: ['automation', 'no-code', 'workflow', 'integration', 'self-hosted', 'saas-alternative']
    },
    {
        name: 'n8n Templates',
        type: 'n8n',
        enabled: true,
        apiUrl: 'https://api.n8n.io/api/templates',
        searchTerms: ['marketing', 'sales', 'productivity', 'data', 'notification']
    },
    {
        name: 'Zapier Apps',
        type: 'zapier',
        enabled: true,
        searchTerms: ['popular', 'trending', 'new', 'business', 'e-commerce']
    },
    {
        name: 'Gumroad Products',
        type: 'gumroad',
        enabled: true,
        searchTerms: ['automation', 'template', 'notion', 'airtable', 'workflow', 'saas']
    },
    {
        name: 'Web Trends',
        type: 'web',
        enabled: true,
        searchTerms: ['automation trends 2024', 'business problems', 'saas opportunities', 'workflow pain points']
    }
];

// ============================================
// CATEGORY MAPPING
// ============================================

const PROBLEM_CATEGORIES = [
    { id: 'marketing', keywords: ['marketing', 'ads', 'seo', 'content', 'social media', 'email'] },
    { id: 'sales', keywords: ['sales', 'crm', 'lead', 'conversion', 'pipeline', 'deal'] },
    { id: 'productivity', keywords: ['productivity', 'task', 'time', 'workflow', 'efficiency'] },
    { id: 'e-commerce', keywords: ['e-commerce', 'shopify', 'woocommerce', 'inventory', 'order'] },
    { id: 'finance', keywords: ['finance', 'invoice', 'payment', 'accounting', 'expense'] },
    { id: 'ai', keywords: ['ai', 'ml', 'chatbot', 'nlp', 'automation', 'intelligent'] },
    { id: 'development', keywords: ['dev', 'api', 'code', 'deploy', 'ci/cd', 'testing'] },
    { id: 'analytics', keywords: ['analytics', 'data', 'report', 'dashboard', 'metrics'] }
];

// ============================================
// OPTIMUS AUTONOMOUS HUNTER CLASS
// ============================================

class OptimusAutonomousHunter {
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private sources: ResearchSource[] = DEFAULT_SOURCES;
    private discoveredProblems: DiscoveredProblem[] = [];
    private generatedTemplates: GeneratedTemplate[] = [];
    private reports: HunterReport[] = [];

    // Scheduler interval (default: 6 hours)
    private intervalMs: number = 6 * 60 * 60 * 1000;

    // ========================================
    // SCHEDULER CONTROL
    // ========================================

    /**
     * Zamanlayıcıyı başlat
     */
    start(intervalHours: number = 6): void {
        if (this.isRunning) {
            console.log('⚠️ [Hunter] Already running');
            return;
        }

        this.intervalMs = intervalHours * 60 * 60 * 1000;
        this.isRunning = true;

        console.log(`🚀 [Hunter] Starting autonomous hunt. Interval: ${intervalHours} hours`);

        // İlk çalıştırma hemen
        this.runFullHunt();

        // Periyodik çalıştırma
        this.intervalId = setInterval(() => {
            this.runFullHunt();
        }, this.intervalMs);
    }

    /**
     * Zamanlayıcıyı durdur
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('🛑 [Hunter] Stopped');
    }

    /**
     * Durumu kontrol et
     */
    getStatus(): { isRunning: boolean, intervalHours: number, lastRun: string | null } {
        return {
            isRunning: this.isRunning,
            intervalHours: this.intervalMs / (60 * 60 * 1000),
            lastRun: this.reports.length > 0 ? this.reports[this.reports.length - 1].completedAt : null
        };
    }

    // ========================================
    // MAIN HUNT PROCESS
    // ========================================

    /**
     * Tam araştırma döngüsü
     */
    async runFullHunt(): Promise<HunterReport> {
        const runId = uuidv4();
        const startedAt = new Date().toISOString();

        console.log(`\n🔍 [Hunter] === STARTING HUNT #${runId.slice(0, 8)} ===\n`);

        try {
            // 1. Tüm kaynaklardan araştırma yap
            console.log('📡 [Hunter] Step 1: Researching sources...');
            const rawData = await this.researchAllSources();

            // 2. Problemleri tespit et
            console.log('🎯 [Hunter] Step 2: Identifying problems...');
            const problems = await this.identifyProblems(rawData);

            // 3. Mevcut çözümleri analiz et
            console.log('🔬 [Hunter] Step 3: Analyzing existing solutions...');
            const analyzedProblems = await this.analyzeExistingSolutions(problems);

            // 4. İyileştirilmiş şablonlar oluştur
            console.log('🏭 [Hunter] Step 4: Generating improved templates...');
            const templates = await this.generateTemplates(analyzedProblems);

            // 5. Rapor oluştur
            const report: HunterReport = {
                runId,
                startedAt,
                completedAt: new Date().toISOString(),
                sourcesSearched: this.sources.filter(s => s.enabled).map(s => s.name),
                problemsFound: analyzedProblems.length,
                templatesGenerated: templates.length,
                topOpportunities: analyzedProblems.slice(0, 5),
                generatedTemplates: templates
            };

            this.reports.push(report);
            this.discoveredProblems.push(...analyzedProblems);
            this.generatedTemplates.push(...templates);

            console.log(`\n✅ [Hunter] Hunt complete! Found ${problems.length} problems, generated ${templates.length} templates\n`);

            return report;

        } catch (error) {
            console.error('❌ [Hunter] Hunt failed:', error);
            throw error;
        }
    }

    // ========================================
    // RESEARCH METHODS
    // ========================================

    /**
     * Tüm kaynaklardan araştırma
     */
    private async researchAllSources(): Promise<Map<string, any[]>> {
        const results = new Map<string, any[]>();

        for (const source of this.sources) {
            if (!source.enabled) continue;

            try {
                console.log(`  📍 Searching ${source.name}...`);
                const data = await this.searchSource(source);
                results.set(source.name, data);
            } catch (error) {
                console.warn(`  ⚠️ Failed to search ${source.name}:`, error);
                results.set(source.name, []);
            }
        }

        return results;
    }

    /**
     * Tek kaynak araştırma
     */
    private async searchSource(source: ResearchSource): Promise<any[]> {
        switch (source.type) {
            case 'github':
                return this.searchGitHub(source.searchTerms);
            case 'n8n':
                return this.searchN8N(source.searchTerms);
            case 'zapier':
                return this.searchZapier(source.searchTerms);
            case 'gumroad':
                return this.searchGumroad(source.searchTerms);
            case 'web':
                return this.searchWeb(source.searchTerms);
            default:
                return [];
        }
    }

    /**
     * GitHub araştırması
     */
    private async searchGitHub(terms: string[]): Promise<any[]> {
        const results: any[] = [];

        // GitHub trending repos and awesome lists için AI analizi
        const prompt = `GitHub'da şu konularda trend olan projeler ve awesome listelerinden otomasyon fırsatları bul:
Konular: ${terms.join(', ')}

Her fırsat için şunu belirt:
1. Proje/Tool adı
2. Ne yapıyor
3. Hangi problemi çözüyor
4. API var mı
5. Self-hosted mi

JSON array olarak 5 fırsat döndür: [{"name":"", "description":"", "problem":"", "hasApi":true, "selfHosted":true}]`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            const parsed = JSON.parse(response.match(/\[[\s\S]*\]/)?.[0] || '[]');
            results.push(...parsed);
        } catch (e) {
            console.warn('    GitHub AI search failed');
        }

        return results;
    }

    /**
     * n8n template araştırması
     */
    private async searchN8N(terms: string[]): Promise<any[]> {
        const results: any[] = [];

        const prompt = `n8n.io platformunda popüler workflow template'leri araştır:
Kategoriler: ${terms.join(', ')}

En çok kullanılan 5 workflow tipi için:
1. Workflow adı
2. Ne yapıyor
3. Hangi entegrasyonları kullanıyor
4. Potansiyel gelir

JSON: [{"name":"", "description":"", "integrations":[], "revenue":"$X/ay"}]`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            const parsed = JSON.parse(response.match(/\[[\s\S]*\]/)?.[0] || '[]');
            results.push(...parsed);
        } catch (e) {
            console.warn('    n8n AI search failed');
        }

        return results;
    }

    /**
     * Zapier araştırması
     */
    private async searchZapier(terms: string[]): Promise<any[]> {
        const results: any[] = [];

        const prompt = `Zapier'da en popüler entegrasyonlar ve otomasyon fikirleri:
Konular: ${terms.join(', ')}

5 popüler Zapier zap türü için:
1. Zap adı
2. Trigger → Action akışı
3. Kullanım alanı
4. Zayıf yanları (iyileştirme fırsatı)

JSON: [{"name":"", "flow":"trigger → action", "useCase":"", "weaknesses":[]}]`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            const parsed = JSON.parse(response.match(/\[[\s\S]*\]/)?.[0] || '[]');
            results.push(...parsed);
        } catch (e) {
            console.warn('    Zapier AI search failed');
        }

        return results;
    }

    /**
     * Gumroad araştırması
     */
    private async searchGumroad(terms: string[]): Promise<any[]> {
        const results: any[] = [];

        const prompt = `Gumroad'da satılan dijital otomasyon ürünlerini araştır:
Kategoriler: ${terms.join(', ')}

En çok satan 5 otomasyon/template ürünü için:
1. Ürün adı
2. Ne sunuyor
3. Fiyat aralığı
4. Satış adedi tahmini
5. İyileştirme fırsatları

JSON: [{"name":"", "offering":"", "priceRange":"", "salesEstimate":"", "improvements":[]}]`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            const parsed = JSON.parse(response.match(/\[[\s\S]*\]/)?.[0] || '[]');
            results.push(...parsed);
        } catch (e) {
            console.warn('    Gumroad AI search failed');
        }

        return results;
    }

    /**
     * Web trend araştırması
     */
    private async searchWeb(terms: string[]): Promise<any[]> {
        const results: any[] = [];

        const prompt = `2024-2025 otomasyon ve SaaS trendlerini araştır:
Konular: ${terms.join(', ')}

Şu anda en çok talep gören 5 otomasyon ihtiyacı:
1. Problem/İhtiyaç adı
2. Hedef kitle
3. Ağrı seviyesi (1-10)
4. Mevcut çözümler ve eksiklikleri
5. Otomasyon fırsatı

JSON: [{"problem":"", "audience":"", "painLevel":8, "existingSolutions":[], "opportunity":""}]`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            const parsed = JSON.parse(response.match(/\[[\s\S]*\]/)?.[0] || '[]');
            results.push(...parsed);
        } catch (e) {
            console.warn('    Web AI search failed');
        }

        return results;
    }

    // ========================================
    // PROBLEM IDENTIFICATION
    // ========================================

    /**
     * Araştırma verilerinden problem tespiti
     */
    private async identifyProblems(rawData: Map<string, any[]>): Promise<DiscoveredProblem[]> {
        const problems: DiscoveredProblem[] = [];

        // Her kaynaktan gelen veriyi analiz et
        for (const [source, data] of rawData) {
            for (const item of data) {
                const problem = this.extractProblem(source, item);
                if (problem) {
                    problems.push(problem);
                }
            }
        }

        // Duplicate'leri filtrele
        const uniqueProblems = this.deduplicateProblems(problems);

        // Öncelik sıralaması
        return uniqueProblems.sort((a, b) => {
            const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            return priorityOrder[a.painLevel] - priorityOrder[b.painLevel];
        });
    }

    /**
     * Ham veriden problem çıkar
     */
    private extractProblem(source: string, item: any): DiscoveredProblem | null {
        if (!item) return null;

        const problemText = item.problem || item.description || item.offering || '';
        if (!problemText) return null;

        // Kategori belirle
        const category = this.detectCategory(problemText);

        // Pain level belirle
        const painLevel = this.assessPainLevel(item);

        return {
            id: uuidv4(),
            title: item.name || 'Unnamed Problem',
            description: problemText,
            source,
            category,
            painLevel,
            targetAudience: item.audience || 'Businesses',
            existingSolutions: [],
            discoveredAt: new Date().toISOString()
        };
    }

    /**
     * Kategori tespit
     */
    private detectCategory(text: string): string {
        const lowerText = text.toLowerCase();

        for (const cat of PROBLEM_CATEGORIES) {
            if (cat.keywords.some(kw => lowerText.includes(kw))) {
                return cat.id;
            }
        }

        return 'productivity';
    }

    /**
     * Ağrı seviyesi değerlendirme
     */
    private assessPainLevel(item: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
        const painScore = item.painLevel || 5;

        if (painScore >= 9) return 'CRITICAL';
        if (painScore >= 7) return 'HIGH';
        if (painScore >= 4) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Duplicate filtreleme
     */
    private deduplicateProblems(problems: DiscoveredProblem[]): DiscoveredProblem[] {
        const seen = new Set<string>();
        return problems.filter(p => {
            const key = p.title.toLowerCase().replace(/\s+/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // ========================================
    // SOLUTION ANALYSIS
    // ========================================

    /**
     * Mevcut çözümleri analiz et
     */
    private async analyzeExistingSolutions(problems: DiscoveredProblem[]): Promise<DiscoveredProblem[]> {
        const analyzed: DiscoveredProblem[] = [];

        for (const problem of problems.slice(0, 10)) { // İlk 10 problemi analiz et
            try {
                const solutions = await this.findExistingSolutions(problem);
                problem.existingSolutions = solutions;
                analyzed.push(problem);
            } catch (e) {
                analyzed.push(problem);
            }
        }

        return analyzed;
    }

    /**
     * Problem için mevcut çözümleri bul
     */
    private async findExistingSolutions(problem: DiscoveredProblem): Promise<ExistingSolution[]> {
        const prompt = `"${problem.title}" problemi için mevcut dijital çözümleri araştır.

Problem: ${problem.description}
Kategori: ${problem.category}

Mevcut 3 çözümü analiz et:
1. Çözüm adı
2. Kaynak (Zapier/n8n/SaaS/Template)
3. Fiyat
4. Güçlü yanları
5. Zayıf yanları (iyileştirme fırsatı!)

JSON: [{"name":"", "source":"", "price":"", "features":[], "weaknesses":[]}]`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            return JSON.parse(response.match(/\[[\s\S]*\]/)?.[0] || '[]');
        } catch (e) {
            return [];
        }
    }

    // ========================================
    // TEMPLATE GENERATION
    // ========================================

    /**
     * Problemlerden iyileştirilmiş şablonlar üret
     */
    private async generateTemplates(problems: DiscoveredProblem[]): Promise<GeneratedTemplate[]> {
        const templates: GeneratedTemplate[] = [];

        for (const problem of problems.slice(0, 5)) { // İlk 5 problem için template üret
            try {
                const template = await this.createImprovedTemplate(problem);
                if (template) {
                    templates.push(template);
                }
            } catch (e) {
                console.warn(`  ⚠️ Template generation failed for: ${problem.title}`);
            }
        }

        return templates;
    }

    /**
     * İyileştirilmiş şablon oluştur
     */
    private async createImprovedTemplate(problem: DiscoveredProblem): Promise<GeneratedTemplate | null> {
        // Mevcut çözümlerin zayıf yanlarını topla
        const allWeaknesses = problem.existingSolutions.flatMap(s => s.weaknesses);

        const prompt = `Bir otomasyon şablonu oluştur:

PROBLEM: ${problem.title}
AÇIKLAMA: ${problem.description}
KATEGORİ: ${problem.category}
HEDEF KİTLE: ${problem.targetAudience}

MEVCUT ÇÖZÜMLERİN ZAYIF YANLARI:
${allWeaknesses.join('\n')}

Bu zayıflıkları giderten, daha iyi bir otomasyon şablonu tasarla:

1. Şablon Adı (Türkçe, emoji ile başlasın)
2. Açıklama (satış odaklı, 100-150 karakter)
3. İyileştirmeler (mevcut çözümlerden farkları)
4. Workflow Adımları (5-7 node)
5. Gelir Tahmini
6. Tags (5 adet)

JSON formatında döndür:
{
  "name": "🔥 Şablon Adı",
  "description": "Açıklama...",
  "improvements": ["iyileştirme1", "iyileştirme2"],
  "nodes": [{"type":"trigger", "title":"", "task":""}],
  "estimatedRevenue": "$X-Y/ay",
  "difficulty": "easy/medium/hard",
  "tags": ["tag1", "tag2"]
}`;

        try {
            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || '{}');

            if (!parsed.name) return null;

            return {
                id: `hunter-${uuidv4().slice(0, 8)}`,
                name: parsed.name,
                description: parsed.description,
                category: problem.category,
                problem,
                improvements: parsed.improvements || [],
                blueprint: {
                    id: uuidv4(),
                    nodes: parsed.nodes || [],
                    connections: []
                },
                estimatedRevenue: parsed.estimatedRevenue || '$500-2000/ay',
                difficulty: parsed.difficulty || 'medium',
                tags: parsed.tags || [],
                status: 'draft',
                createdAt: new Date().toISOString()
            };

        } catch (e) {
            return null;
        }
    }

    // ========================================
    // GETTERS & UTILITIES
    // ========================================

    /**
     * Tüm bulunan problemleri getir
     */
    getDiscoveredProblems(): DiscoveredProblem[] {
        return this.discoveredProblems;
    }

    /**
     * Üretilen şablonları getir
     */
    getGeneratedTemplates(): GeneratedTemplate[] {
        return this.generatedTemplates;
    }

    /**
     * Raporları getir
     */
    getReports(): HunterReport[] {
        return this.reports;
    }

    /**
     * Son raporu getir
     */
    getLastReport(): HunterReport | null {
        return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null;
    }

    /**
     * Şablon durumunu güncelle
     */
    updateTemplateStatus(templateId: string, status: GeneratedTemplate['status']): boolean {
        const template = this.generatedTemplates.find(t => t.id === templateId);
        if (template) {
            template.status = status;
            return true;
        }
        return false;
    }

    /**
     * Özet rapor (Optimus için)
     */
    async getSummary(): Promise<string> {
        const lastReport = this.getLastReport();
        const status = this.getStatus();

        if (!lastReport) {
            return `
🔍 AUTONOMOUS HUNTER DURUMU
━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Durum: ${status.isRunning ? '🟢 Çalışıyor' : '🔴 Durdu'}
📅 Interval: ${status.intervalHours} saat
📊 Son Çalışma: Henüz yok

"OPTIMUS.hunter.start()" ile başlatabilirsin.
`;
        }

        return `
🔍 AUTONOMOUS HUNTER RAPORU
━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Durum: ${status.isRunning ? '🟢 Çalışıyor' : '🔴 Durdu'}
📅 Son Çalışma: ${new Date(lastReport.completedAt).toLocaleString('tr-TR')}

📊 SON AV SONUÇLARI:
├─ Aranan Kaynaklar: ${lastReport.sourcesSearched.length}
├─ Bulunan Problemler: ${lastReport.problemsFound}
└─ Üretilen Şablonlar: ${lastReport.templatesGenerated}

🎯 EN İYİ FIRSATLAR:
${lastReport.topOpportunities.slice(0, 3).map((p, i) =>
            `${i + 1}. [${p.painLevel}] ${p.title}`
        ).join('\n')}

📦 YENİ ŞABLONLAR:
${lastReport.generatedTemplates.slice(0, 3).map((t, i) =>
            `${i + 1}. ${t.name} (${t.estimatedRevenue})`
        ).join('\n')}

${this.generatedTemplates.filter(t => t.status === 'draft').length > 0
                ? `⚠️ ${this.generatedTemplates.filter(t => t.status === 'draft').length} şablon onay bekliyor!`
                : '✅ Tüm şablonlar işlendi'}
`;
    }

    /**
     * Manuel tek kaynak araştırma
     */
    async searchSingleSource(sourceType: ResearchSource['type']): Promise<any[]> {
        const source = this.sources.find(s => s.type === sourceType);
        if (!source) return [];
        return this.searchSource(source);
    }

    /**
     * Kaynak ayarlarını güncelle
     */
    updateSource(sourceType: ResearchSource['type'], enabled: boolean): void {
        const source = this.sources.find(s => s.type === sourceType);
        if (source) {
            source.enabled = enabled;
        }
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const autonomousHunter = new OptimusAutonomousHunter();
export default autonomousHunter;
