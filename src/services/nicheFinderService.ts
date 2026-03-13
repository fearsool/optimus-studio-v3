
import { AUTOMATION_TEMPLATES } from './templateService';
import { coinGeckoService } from './integrations/coinGeckoService';
import { groqService } from './integrations/groqService';

export interface NicheIdea {
    id: string;
    title: string;
    description: string;
    category: 'High ROI' | 'Low Competition' | 'Trending' | 'Blue Ocean';
    estimatedRevenue: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    demand: number; // 0-100 score
    targetAudience: string;
    implementationSteps: string[];
}

export const nicheFinderService = {
    async scanForOpportunities(): Promise<NicheIdea[]> {
        console.log('📡 Radar Scanning: Connecting to Niche Intelligence Network...');

        // 1. Fetch Crypto Trends (CoinGecko)
        let cryptoIdeas: NicheIdea[] = [];
        try {
            const coins = await coinGeckoService.getMarketTrends(3);
            cryptoIdeas = coins.map(coin => ({
                id: `crypto-${coin.id}`,
                title: `${coin.name} Arbitrage Bot`,
                description: `Automated trading for ${coin.symbol.toUpperCase()} ($${coin.current_price}). Growth: ${coin.price_change_percentage_24h.toFixed(2)}%`,
                category: 'Trending',
                estimatedRevenue: '$500-$2000/mo',
                difficulty: 'Medium',
                demand: 95,
                targetAudience: 'Crypto Traders',
                implementationSteps: ['Connect Binance API', 'Set Thresholds', 'Start Bot']
            }));
            console.log('🦎 CoinGecko Trends Loaded:', cryptoIdeas.length);
        } catch (e) {
            console.warn('CoinGecko fetch failed', e);
        }

        // 2. Use Groq via Unified Service
        const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY; // Legacy check, service handles it too.

        // Mevcut şablonları listele
        const existingTemplates = AUTOMATION_TEMPLATES.map(t => t.name).join(', ');

        // If no global key and no local key, service will return null.
        // We let the service handle the key retrieval.

        try {
            const prompt = `
            You are a Micro-SaaS & Automation Expert.
            Identify 5 UNTAPPED, HIGH-PROFIT automation opportunities for 2024-2025.
            
            IMPORTANT: We ALREADY HAVE the following templates, DO NOT SUGGEST SIMILAR IDEAS:
            [${existingTemplates}]

            Focus on completely different niches (e.g., Specialized Law Firms, Boutique Hotels, High-Ticket Coaches, Construction, Local Service Businesses, Agriculture, Logistics).
            Think about "Blue Ocean" markets where no one is selling automation yet.
            
            Return ONLY a valid JSON array with this structure:
            [
              {
                "title": "Short catchy title",
                "description": "Specific problem solution (max 20 words)",
                "category": "High ROI" | "Low Competition" | "Trending" | "Blue Ocean",
                "estimatedRevenue": "Estimate monthly revenue (e.g. $2k-$5k/mo)",
                "difficulty": "Easy" | "Medium" | "Hard",
                "demand": 85,
                "targetAudience": "Who buys this?",
                "implementationSteps": ["Step 1", "Step 2", "Step 3"]
              }
            ]
            `;

            // Refactored to use groqService
            const ideas = await groqService.generateJSON<any[]>(
                'You are a JSON generator. Always output valid JSON only.',
                prompt
            );

            if (!ideas || !Array.isArray(ideas)) {
                throw new Error('Groq returned invalid data');
            }

            const pIdeas = ideas.map((idea: any, index: number) => ({
                id: `idea-${Date.now()}-${index}`,
                ...idea,
                demand: idea.demand || Math.floor(Math.random() * 20) + 80 // 80-99 score if missing
            }));

            return [...cryptoIdeas, ...pIdeas];

        } catch (error) {
            console.error('Radar Scan Failed (Groq Error):', error);
            // Fallback to offline simulation if API fails
            return [...cryptoIdeas, ...this.getSimulatedIdeas()];
        }
    },

    getSimulatedIdeas(): NicheIdea[] {
        return [
            {
                id: 'offline-1',
                title: 'API Anahtarı Eksik / Hata',
                description: 'Gerçek zamanlı tarama için VITE_GROQ_API_KEY gereklidir. Bu bir simülasyondur.',
                category: 'Trending',
                estimatedRevenue: '---',
                difficulty: 'Easy',
                demand: 0,
                targetAudience: 'System Admin',
                implementationSteps: ['Check .env', 'Get Groq Key']
            },
            {
                id: 'offline-2',
                title: 'Diş Hekimi Randevu Botu (Örnek)',
                description: 'Randevu kaçıran hastaları otomatik takip eden sistem.',
                category: 'High ROI',
                estimatedRevenue: '₺10,000/mo',
                difficulty: 'Medium',
                demand: 90,
                targetAudience: 'Diş Klinikleri',
                implementationSteps: ['WhatsApp API Bağla', 'Randevu Takvimi Entegre Et']
            }
        ];
    }
};
