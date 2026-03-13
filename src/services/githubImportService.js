"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubImportService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const types_1 = require("../types");
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
}
// Sadece bu kelimeleri içeren modülleri çek (PAZAR DEĞERİ OLANLAR)
const PROFITABLE_KEYWORDS = [
    // Core Money Makers
    'openai', 'chatgpt', 'stripe', 'shopify', 'woocommerce', 'saas', 'passive-income', 'funnel',
    'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'ads', 'marketing', 'lead-gen',
    'discord', 'slack', 'telegram', 'whatsapp', 'messenger', 'n8n', 'zapier', 'make',
    'google-sheets', 'airtable', 'notion', 'hubspot', 'salesforce', 'crm', 'pipeline',
    'mailchimp', 'gmail', 'youtube', 'binance', 'crypto', 'web3', 'trading', 'arbitrage',
    'wordpress', 'ghost', 'medium', 'devto', 'trading', 'forex', 'stocks',
    'amazon', 'ebay', 'etsy', 'ali', 'dropshipping', 'fulfillment',
    'analytics', 'mixpanel', 'amplitude', 'ga4', 'hotjar', 'pixel',
    'trello', 'asana', 'clickup', 'jira', 'monday', 'task',
    'zoom', 'calendly', 'typeform', 'jotform', 'survey', 'form',
    'ai', 'model', 'anthropic', 'mistral', 'llama', 'stable-diffusion', 'sora', 'gen-ai'
];
exports.githubImportService = {
    /**
     * ActivePieces GitHub reposundaki parçaları tarar ve şablon olarak ekler - FİLTRELİ VE KONTROLLÜ
     */
    async importActivePiecesAsTemplates() {
        console.log('🐙 GitHub Import Başlatılıyor (Curated Mode)...');
        try {
            // 1. ActivePieces 'pieces' klasörünü listele (Community ve Core)
            const pathsToTry = [
                'packages/pieces/community',
                'packages/pieces',
                'pieces'
            ];
            let contents = [];
            for (const path of pathsToTry) {
                try {
                    console.log(`Trying path: ${path}`);
                    const response = await fetch(`https://api.github.com/repos/activepieces/activepieces/contents/${path}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data) && data.length > 0) {
                            contents = data;
                            console.log(`✅ Found pieces in: ${path}`);
                            break;
                        }
                    }
                }
                catch (e) {
                    console.warn(`Path failed: ${path}`, e);
                }
            }
            if (contents.length === 0) {
                console.warn('⚠️ Parça bulunamadı. GitHub API limit veya yol hatası.');
                return { success: false, count: 0, total: 0 };
            }
            // Sadece type='dir' olanları al
            const pieceDirs = contents.filter(c => c.type === 'dir');
            console.log(`📦 ${pieceDirs.length} adet ham parça bulundu.`);
            // FİLTRELEME VE İŞLEME
            let addedCount = 0;
            let skippedCount = 0;
            for (const dir of pieceDirs) {
                const rawName = dir.name.replace('piece-', '').toLowerCase();
                // Keyword Kontrolü (Gürültüyü engelemek için)
                const isProfitable = PROFITABLE_KEYWORDS.some(k => rawName.includes(k));
                if (!isProfitable) {
                    skippedCount++;
                    continue;
                }
                const cleanName = rawName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                // Basit bir Blueprint oluştur
                const blueprint = {
                    nodes: [
                        {
                            id: 'trigger-1',
                            type: types_1.NodeType.STATE_MANAGER,
                            title: 'Başlangıç',
                            role: 'System',
                            task: 'Otomasyonu başlat',
                            status: types_1.StepStatus.IDLE,
                            connections: [{ targetId: 'action-1' }]
                        },
                        {
                            id: 'action-1',
                            type: types_1.NodeType.EXTERNAL_CONNECTOR, // External integration
                            title: `${cleanName} Entegrasyonu`,
                            role: cleanName,
                            task: `Execute action in ${cleanName}`,
                            status: types_1.StepStatus.IDLE,
                            connections: []
                        }
                    ]
                };
                // Kategori Tahmini - LÜKS/YÜKSEK KAZANÇ ODAKLI
                let category = 'other';
                // Money Maker - Revenue generating tools
                if (rawName.includes('stripe') || rawName.includes('money') || rawName.includes('saas') || rawName.includes('funnel') || rawName.includes('ads') || rawName.includes('lead')) {
                    category = 'money-maker';
                }
                else if (rawName.includes('instagram') || rawName.includes('tiktok') || rawName.includes('twitter') || rawName.includes('facebook') || rawName.includes('social')) {
                    category = 'social-media';
                }
                else if (rawName.includes('mail') || rawName.includes('smtp') || rawName.includes('newsletter') || rawName.includes('mailchimp')) {
                    category = 'money-maker'; // Email marketing is money-maker
                }
                else if (rawName.includes('shopify') || rawName.includes('woo') || rawName.includes('shop') || rawName.includes('amazon') || rawName.includes('etsy')) {
                    category = 'ecommerce';
                }
                else if (rawName.includes('gpt') || rawName.includes('ai') || rawName.includes('intelligence') || rawName.includes('anthropic') || rawName.includes('mistral')) {
                    category = 'assistant';
                }
                else if (rawName.includes('sheet') || rawName.includes('airtable') || rawName.includes('notion') || rawName.includes('trello') || rawName.includes('task')) {
                    category = 'productivity';
                }
                else if (rawName.includes('crypto') || rawName.includes('binance') || rawName.includes('bitcoin') || rawName.includes('trading') || rawName.includes('forex')) {
                    category = 'crypto';
                }
                else if (rawName.includes('analytics') || rawName.includes('ga4') || rawName.includes('amplitude') || rawName.includes('pixel')) {
                    category = 'analytics';
                }
                else if (rawName.includes('video') || rawName.includes('youtube') || rawName.includes('ovi') || rawName.includes('stable-diffusion')) {
                    category = 'video';
                }
                // Supabase'e ekle
                const newTemplate = {
                    id: `imported-${rawName}-raw`, // Unique ID
                    name: `[HAM] ${cleanName} Modülü`, // HAM İŞARETİ
                    description: `⚠️ DİKKAT: Bu şablon GitHub'dan otomatik çekilmiştir. Lisans ve güvenlik kontrolü yapılmamıştır. Fabrika'da işlendikten sonra kullanılmalıdır. (Source: ActivePieces)`,
                    category: category,
                    difficulty: 'hard', // Raw olduğu için zor
                    // REFINERY STATE - LOCKDOWN
                    refineLevel: 'ore', // HAM CEVHER
                    sellable: false, // SATILAMAZ
                    businessOutcome: {
                        problem: 'Belli Değil',
                        solution: 'Belli Değil',
                        value: 'Analiz Gerekli',
                        targetUser: ['Bilinmiyor']
                    },
                    monetizationType: 'unknown',
                    blockingReasons: [
                        { reason: 'Lisans Kontrolü', source: 'importer', resolved: false },
                        { reason: 'Güvenlik Taraması', source: 'importer', resolved: false },
                        { reason: 'İş Çıktısı (Outcome) Tanımı', source: 'importer', resolved: false }
                    ],
                    estimatedRevenue: 'Analiz Edilmeli',
                    icon: '📦',
                    tags: ['imported', 'raw', 'ore', rawName], // Etiketler
                    blueprint: blueprint,
                    isOfficial: false, // ASLA OFFICIAL OLAMAZ
                    sourceUrl: dir.url
                };
                // Store in localStorage instead of Supabase (no DB dependency)
                try {
                    const existingTemplates = JSON.parse(localStorage.getItem('imported_templates') || '[]');
                    const existingIndex = existingTemplates.findIndex((t) => t.id === newTemplate.id);
                    if (existingIndex >= 0) {
                        existingTemplates[existingIndex] = newTemplate;
                    }
                    else {
                        existingTemplates.push(newTemplate);
                    }
                    localStorage.setItem('imported_templates', JSON.stringify(existingTemplates));
                    addedCount++;
                    console.log(`✅ [RAW] Eklendi: ${cleanName}`);
                }
                catch (storageError) {
                    console.warn(`⚠️ Storage hatası (${cleanName}):`, storageError);
                }
            }
            return {
                success: true,
                count: addedCount,
                skipped: skippedCount,
                total: pieceDirs.length,
                message: `${addedCount} değerli şablon [HAM] olarak eklendi. ${skippedCount} adet ilgisiz parça atlandı.`
            };
        }
        catch (error) {
            console.error('Import Failed:', error);
            throw error;
        }
    }
};
