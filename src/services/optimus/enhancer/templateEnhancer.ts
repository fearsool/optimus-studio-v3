/**
 * 🧠 OPTIMUS TEMPLATE ENHANCER
 * =============================
 * Mevcut şablonları analiz eder, puanlar ve iyileştirme önerileri sunar
 * 
 * Özellikler:
 * - Template kalite puanlama (0-100)
 * - Eksik alan tespiti
 * - AI ile iyileştirme önerileri
 * - Batch analiz modu
 * - Otomatik güncelleme (onay ile)
 */

import { AutomationTemplate, getTemplates } from '../../templates/store';
import { groqService } from '../../integrations/groqService';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface TemplateScoreCard {
    templateId: string;
    templateName: string;

    // Ana puanlar (her biri 0-100)
    scores: {
        completeness: number;      // Eksik alan kontrolü
        nodeQuality: number;       // Blueprint node kalitesi
        monetization: number;      // Gelir potansiyeli
        marketFit: number;         // Pazar uyumu
        clarity: number;           // Açıklama netliği
        usability: number;         // Kullanım kolaylığı
    };

    // Toplam puan
    finalScore: number;

    // Durum
    status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

    // Eksik alanlar
    missingFields: string[];

    // İyileştirme önerileri
    improvements: TemplateImprovement[];

    // Analiz tarihi
    analyzedAt: string;
}

export interface TemplateImprovement {
    field: string;
    currentValue: string | null;
    suggestedValue: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
}

export interface EnhancerReport {
    totalTemplates: number;
    analyzed: number;
    excellent: number;
    good: number;
    needsImprovement: number;
    poor: number;
    averageScore: number;
    topImprovementAreas: string[];
    generatedAt: string;
}

// ============================================
// SCORE THRESHOLDS
// ============================================

const THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    NEEDS_IMPROVEMENT: 50,
    POOR: 0
};

// ============================================
// OPTIMUS TEMPLATE ENHANCER CLASS
// ============================================

class OptimusTemplateEnhancer {
    private useAI: boolean = true;

    // ========================================
    // SINGLE TEMPLATE ANALYSIS
    // ========================================

    /**
     * Tek bir template'i analiz et ve puanla
     */
    async analyzeTemplate(template: AutomationTemplate): Promise<TemplateScoreCard> {
        console.log(`🔍 [Enhancer] Analyzing: ${template.name}`);

        // 1. Completeness Score - Eksik alan kontrolü
        const { completeness, missingFields } = this.checkCompleteness(template);

        // 2. Node Quality Score - Blueprint node kalitesi
        const nodeQuality = this.checkNodeQuality(template);

        // 3. Monetization Score - Gelir potansiyeli
        const monetization = this.checkMonetization(template);

        // 4. Market Fit Score - Pazar uyumu
        const marketFit = this.checkMarketFit(template);

        // 5. Clarity Score - Açıklama netliği
        const clarity = this.checkClarity(template);

        // 6. Usability Score - Kullanım kolaylığı
        const usability = this.checkUsability(template);

        // Final Score (ağırlıklı ortalama)
        const finalScore = Math.round(
            (completeness * 0.20) +
            (nodeQuality * 0.20) +
            (monetization * 0.15) +
            (marketFit * 0.15) +
            (clarity * 0.15) +
            (usability * 0.15)
        );

        // Status belirleme
        let status: TemplateScoreCard['status'];
        if (finalScore >= THRESHOLDS.EXCELLENT) status = 'EXCELLENT';
        else if (finalScore >= THRESHOLDS.GOOD) status = 'GOOD';
        else if (finalScore >= THRESHOLDS.NEEDS_IMPROVEMENT) status = 'NEEDS_IMPROVEMENT';
        else status = 'POOR';

        // İyileştirme önerileri
        const improvements = await this.generateImprovements(template, {
            completeness, nodeQuality, monetization, marketFit, clarity, usability
        }, missingFields);

        return {
            templateId: template.id,
            templateName: template.name,
            scores: { completeness, nodeQuality, monetization, marketFit, clarity, usability },
            finalScore,
            status,
            missingFields,
            improvements,
            analyzedAt: new Date().toISOString()
        };
    }

    // ========================================
    // SCORING METHODS
    // ========================================

    /**
     * Completeness - Eksik alan kontrolü
     */
    private checkCompleteness(template: AutomationTemplate): { completeness: number, missingFields: string[] } {
        const fields = {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            difficulty: template.difficulty,
            estimatedRevenue: template.estimatedRevenue,
            icon: template.icon,
            tags: template.tags?.length > 0,
            blueprint: !!template.blueprint,
            blueprintNodes: template.blueprint?.nodes?.length > 0,
            requiredApis: template.requiredApis?.length > 0,
            businessOutcome: !!template.businessOutcome
        };

        const missingFields: string[] = [];
        let score = 0;
        let total = 0;

        for (const [key, value] of Object.entries(fields)) {
            total++;
            if (value) {
                score++;
            } else {
                missingFields.push(key);
            }
        }

        return {
            completeness: Math.round((score / total) * 100),
            missingFields
        };
    }

    /**
     * Node Quality - Blueprint node kalitesi
     */
    private checkNodeQuality(template: AutomationTemplate): number {
        const nodes = template.blueprint?.nodes || [];

        if (nodes.length === 0) return 0;
        if (nodes.length < 3) return 30;
        if (nodes.length < 5) return 60;

        // Node çeşitliliği kontrolü
        const uniqueTypes = new Set(nodes.map(n => n.type));
        const typeScore = Math.min(uniqueTypes.size * 15, 40);

        // Connection kontrolü
        const connectedNodes = nodes.filter(n =>
            n.connections && n.connections.length > 0
        ).length;
        const connectionScore = Math.round((connectedNodes / nodes.length) * 30);

        // Title/role/task doluluğu
        const filledNodes = nodes.filter(n =>
            n.title && n.role && n.task
        ).length;
        const detailScore = Math.round((filledNodes / nodes.length) * 30);

        return Math.min(typeScore + connectionScore + detailScore, 100);
    }

    /**
     * Monetization - Gelir potansiyeli
     */
    private checkMonetization(template: AutomationTemplate): number {
        const revenue = template.estimatedRevenue || '';

        // Revenue string'den rakam çıkar
        const numbers = revenue.match(/\d+/g);
        if (!numbers) return 20;

        const avgRevenue = numbers.reduce((sum, n) => sum + parseInt(n), 0) / numbers.length;

        // Kategori bazlı bonus
        const highValueCategories = ['money-maker', 'finance', 'e-commerce', 'ai'];
        const categoryBonus = highValueCategories.includes(template.category || '') ? 20 : 0;

        // Revenue skorlama
        if (avgRevenue >= 5000) return Math.min(80 + categoryBonus, 100);
        if (avgRevenue >= 2000) return Math.min(60 + categoryBonus, 100);
        if (avgRevenue >= 1000) return Math.min(40 + categoryBonus, 100);
        if (avgRevenue >= 500) return Math.min(30 + categoryBonus, 100);

        return 20 + categoryBonus;
    }

    /**
     * Market Fit - Pazar uyumu
     */
    private checkMarketFit(template: AutomationTemplate): number {
        const tags = template.tags || [];
        const description = template.description || '';

        // Trend anahtar kelimeler
        const trendKeywords = ['ai', 'automation', 'no-code', 'self-hosted', 'saas',
            'e-ticaret', 'dropshipping', 'affiliate', 'sosyal medya', 'tiktok',
            'instagram', 'youtube', 'chatbot', 'crm', 'analytics'];

        let keywordScore = 0;
        for (const keyword of trendKeywords) {
            if (tags.some(t => t.toLowerCase().includes(keyword)) ||
                description.toLowerCase().includes(keyword)) {
                keywordScore += 10;
            }
        }

        // Tag zenginliği
        const tagScore = Math.min(tags.length * 5, 30);

        return Math.min(keywordScore + tagScore, 100);
    }

    /**
     * Clarity - Açıklama netliği
     */
    private checkClarity(template: AutomationTemplate): number {
        const desc = template.description || '';
        const name = template.name || '';

        let score = 0;

        // Açıklama uzunluğu
        if (desc.length >= 100) score += 30;
        else if (desc.length >= 50) score += 20;
        else if (desc.length >= 20) score += 10;

        // İsim uzunluğu ve emoji
        if (name.length >= 10 && name.length <= 50) score += 20;
        if (/[\u{1F300}-\u{1F9FF}]/u.test(name)) score += 10; // Emoji var

        // Türkçe karakter kontrolü (lokalizasyon)
        if (/[çğıöşüÇĞİÖŞÜ]/.test(desc)) score += 20;

        // Fayda odaklı açıklama
        const benefitKeywords = ['otomatik', 'kazanç', 'tasarruf', 'artır', 'kolaylaştır', 'hızlandır'];
        if (benefitKeywords.some(k => desc.toLowerCase().includes(k))) score += 20;

        return Math.min(score, 100);
    }

    /**
     * Usability - Kullanım kolaylığı
     */
    private checkUsability(template: AutomationTemplate): number {
        let score = 0;

        // Difficulty rating
        if (template.difficulty === 'easy') score += 40;
        else if (template.difficulty === 'medium') score += 25;
        else if (template.difficulty === 'hard') score += 10;

        // API gereksinimleri (az = daha kolay)
        const apiCount = template.requiredApis?.length || 0;
        if (apiCount === 0) score += 30;
        else if (apiCount <= 2) score += 20;
        else if (apiCount <= 4) score += 10;

        // Node sayısı (az = daha basit)
        const nodeCount = template.blueprint?.nodes?.length || 0;
        if (nodeCount <= 4) score += 30;
        else if (nodeCount <= 6) score += 20;
        else if (nodeCount <= 8) score += 10;

        return Math.min(score, 100);
    }

    // ========================================
    // AI IMPROVEMENT SUGGESTIONS
    // ========================================

    /**
     * AI ile iyileştirme önerileri üret
     */
    private async generateImprovements(
        template: AutomationTemplate,
        scores: Record<string, number>,
        missingFields: string[]
    ): Promise<TemplateImprovement[]> {
        const improvements: TemplateImprovement[] = [];

        // Eksik alanlar için öneriler
        for (const field of missingFields) {
            improvements.push({
                field,
                currentValue: null,
                suggestedValue: await this.suggestFieldValue(template, field),
                priority: 'HIGH',
                reason: `${field} alanı eksik - şablonun tamamlanması için gerekli`
            });
        }

        // Düşük skorlu alanlar için öneriler
        if (scores.clarity < 70) {
            improvements.push({
                field: 'description',
                currentValue: template.description,
                suggestedValue: await this.improveDescription(template),
                priority: 'MEDIUM',
                reason: 'Açıklama daha net ve satış odaklı olabilir'
            });
        }

        if (scores.monetization < 60) {
            improvements.push({
                field: 'estimatedRevenue',
                currentValue: template.estimatedRevenue,
                suggestedValue: await this.suggestBetterRevenue(template),
                priority: 'MEDIUM',
                reason: 'Gelir potansiyeli güncellenmeli'
            });
        }

        if (scores.nodeQuality < 50 && template.blueprint) {
            improvements.push({
                field: 'blueprint.nodes',
                currentValue: `${template.blueprint.nodes?.length || 0} nodes`,
                suggestedValue: 'Daha fazla node ve bağlantı eklenebilir',
                priority: 'MEDIUM',
                reason: 'Workflow daha detaylı olabilir'
            });
        }

        return improvements;
    }

    /**
     * Eksik alan değeri öner
     */
    private async suggestFieldValue(template: AutomationTemplate, field: string): Promise<string> {
        if (!this.useAI) {
            return `[${field} için değer önerisi]`;
        }

        try {
            const prompt = `Bir otomasyon şablonu için "${field}" alanı eksik.
Şablon adı: ${template.name}
Açıklama: ${template.description}
Kategori: ${template.category}

Bu alan için uygun bir değer öner. Sadece değeri yaz, açıklama yapma.`;

            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            return response?.slice(0, 200) || `[${field}]`;
        } catch {
            return `[${field} için değer önerisi]`;
        }
    }

    /**
     * Açıklama iyileştir
     */
    private async improveDescription(template: AutomationTemplate): Promise<string> {
        if (!this.useAI) {
            return template.description || '';
        }

        try {
            const prompt = `Bu otomasyon şablonunun açıklamasını daha satış odaklı ve net hale getir.

Mevcut: ${template.description}
Kategori: ${template.category}

Yeni açıklama (max 150 karakter, Türkçe, fayda odaklı):`;

            const response = await groqService.generateText([
                { role: 'user', content: prompt }
            ]);

            return response?.slice(0, 200) || template.description || '';
        } catch {
            return template.description || '';
        }
    }

    /**
     * Gelir tahmini güncelle
     */
    private async suggestBetterRevenue(template: AutomationTemplate): Promise<string> {
        const category = template.category || 'other';

        // Kategori bazlı gelir önerileri
        const revenueGuides: Record<string, string> = {
            'money-maker': '$2000-8000/ay',
            'ai': '$3000-10000/ay',
            'finance': '$1500-6000/ay',
            'e-commerce': '$2000-7000/ay',
            'social-media': '$1000-4000/ay',
            'productivity': '$1000-3500/ay',
            'content-creation': '$1500-5000/ay',
            'development': '$2000-6000/ay',
            'analytics': '$1000-4000/ay',
            'other': '$500-2000/ay'
        };

        return revenueGuides[category] || '$1000-4000/ay';
    }

    // ========================================
    // BATCH ANALYSIS
    // ========================================

    /**
     * Tüm şablonları analiz et
     */
    async analyzeAllTemplates(): Promise<{ scorecards: TemplateScoreCard[], report: EnhancerReport }> {
        console.log('🔄 [Enhancer] Starting batch analysis...');

        const templates = await getTemplates();
        const scorecards: TemplateScoreCard[] = [];

        for (const template of templates) {
            try {
                const scorecard = await this.analyzeTemplate(template);
                scorecards.push(scorecard);
            } catch (error) {
                console.warn(`⚠️ [Enhancer] Failed to analyze ${template.id}:`, error);
            }
        }

        // Rapor oluştur
        const report = this.generateReport(scorecards);

        console.log(`✅ [Enhancer] Batch analysis complete: ${scorecards.length} templates`);
        return { scorecards, report };
    }

    /**
     * Sadece düşük puanlıları analiz et
     */
    async analyzeWeakTemplates(threshold: number = 70): Promise<TemplateScoreCard[]> {
        const { scorecards } = await this.analyzeAllTemplates();
        return scorecards.filter(sc => sc.finalScore < threshold);
    }

    /**
     * Rapor oluştur
     */
    private generateReport(scorecards: TemplateScoreCard[]): EnhancerReport {
        const excellent = scorecards.filter(s => s.status === 'EXCELLENT').length;
        const good = scorecards.filter(s => s.status === 'GOOD').length;
        const needsImprovement = scorecards.filter(s => s.status === 'NEEDS_IMPROVEMENT').length;
        const poor = scorecards.filter(s => s.status === 'POOR').length;

        const averageScore = scorecards.length > 0
            ? Math.round(scorecards.reduce((sum, s) => sum + s.finalScore, 0) / scorecards.length)
            : 0;

        // En çok iyileştirme gereken alanlar
        const fieldCounts: Record<string, number> = {};
        for (const sc of scorecards) {
            for (const imp of sc.improvements) {
                fieldCounts[imp.field] = (fieldCounts[imp.field] || 0) + 1;
            }
        }

        const topImprovementAreas = Object.entries(fieldCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([field]) => field);

        return {
            totalTemplates: scorecards.length,
            analyzed: scorecards.length,
            excellent,
            good,
            needsImprovement,
            poor,
            averageScore,
            topImprovementAreas,
            generatedAt: new Date().toISOString()
        };
    }

    // ========================================
    // OPTIMUS INTEGRATION
    // ========================================

    /**
     * Optimus için özet rapor
     */
    async getOptimusSummary(): Promise<string> {
        const { scorecards, report } = await this.analyzeAllTemplates();

        const summary = `
📊 ŞABLON ANALİZ RAPORU
━━━━━━━━━━━━━━━━━━━━━━
📦 Toplam: ${report.totalTemplates} şablon
⭐ Ortalama Puan: ${report.averageScore}/100

📈 DAĞILIM:
🟢 Mükemmel (90+): ${report.excellent}
🔵 İyi (75-89): ${report.good}
🟡 Geliştirilebilir (50-74): ${report.needsImprovement}
🔴 Zayıf (<50): ${report.poor}

🔧 EN ÇOK İYİLEŞTİRME GEREKEN ALANLAR:
${report.topImprovementAreas.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${report.poor > 0 ? `⚠️ ${report.poor} şablon acil iyileştirme bekliyor!` : '✅ Kritik sorun yok'}
`;

        return summary;
    }

    /**
     * Belirli template için detaylı rapor
     */
    formatScoreCard(sc: TemplateScoreCard): string {
        return `
📋 ${sc.templateName}
━━━━━━━━━━━━━━━━━━━━
🎯 Toplam Puan: ${sc.finalScore}/100 [${sc.status}]

📊 DETAYLI PUANLAR:
├─ Tamlık: ${sc.scores.completeness}/100
├─ Node Kalitesi: ${sc.scores.nodeQuality}/100
├─ Gelir Potansiyeli: ${sc.scores.monetization}/100
├─ Pazar Uyumu: ${sc.scores.marketFit}/100
├─ Netlik: ${sc.scores.clarity}/100
└─ Kullanılabilirlik: ${sc.scores.usability}/100

${sc.missingFields.length > 0 ? `⚠️ EKSİK ALANLAR: ${sc.missingFields.join(', ')}` : '✅ Tüm alanlar dolu'}

💡 ÖNERİLER (${sc.improvements.length}):
${sc.improvements.slice(0, 3).map(i => `• [${i.priority}] ${i.field}: ${i.reason}`).join('\n')}
`;
    }

    /**
     * AI kullanımını aç/kapa
     */
    setUseAI(enabled: boolean): void {
        this.useAI = enabled;
        console.log(`🤖 [Enhancer] AI ${enabled ? 'aktif' : 'pasif'}`);
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const templateEnhancer = new OptimusTemplateEnhancer();
export default templateEnhancer;
