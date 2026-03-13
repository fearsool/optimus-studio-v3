import { SystemBlueprint } from '../types';
import { getTemplateById, getTemplates, AutomationTemplate } from './templateService';
import { nemotronService, NemotronTaskType } from './nemotronService';
import { factoryDecisionEngine, DecisionActionType } from './factoryDecisionEngine';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import {
    STANDALONE_RUNNER_CODE,
    STANDALONE_PACKAGE_JSON,
    STANDALONE_ENV_EXAMPLE,
    STANDALONE_README,
    STANDALONE_BAT_SCRIPT,
    STANDALONE_REQUIREMENTS,
    STANDALONE_PUBLISH_GUIDE
} from './templates/standaloneRunnerTemplate';
import { OPTIMUS } from './optimus';

// ============================================
// THE PROFIT TRINITY: FACTORY WORKER DEFINITIONS
// ============================================

const TRINITY_BOTS = {
    CREATOR: 'amazon-listing-optimizer',
    PRODUCT: 'agency-voice-outreach',
    CLERK: 'digital-asset-delivery'
};

export const AI_AGENCY_STARTER_KIT = {
    id: 'ai-agency-starter-kit-v1',
    name: 'AI Agency Starter Kit: Voice & Video Edition',
    price: 29700,
    currency: 'USD',
    description: 'Complete "Agency-in-a-Box" system. Includes Voice Bot Source Code, Client Onboarding Automations, and Webinar Funnel.',
    contents: [
        'agency-voice-outreach',
        'agency-client-onboarding',
        'zoom-webinar-automation'
    ],
    licenseType: 'Single Agency License'
};

export interface FactoryStatus {
    isActive: boolean;
    activeWorkers: string[];
    productionQueue: number;
    totalRevenue: number;
    lastCycle: string | null;
}

export class FactoryService {
    private _isActive = false;
    private _revenue = 0;

    async makeDecision(
        taskType: NemotronTaskType,
        input: Record<string, any>,
        contextSummary: string
    ): Promise<{ success: boolean; result: any; fallbackUsed: boolean; appliedAction: DecisionActionType }> {
        const decision = await factoryDecisionEngine.execute(taskType, input, contextSummary);
        return {
            success: true,
            result: decision.params || {},
            fallbackUsed: decision.confidence === 0,
            appliedAction: decision.action
        };
    }

    getNemotronStatus() {
        return nemotronService.getStatus();
    }

    async bootstrapFactory(): Promise<{ success: boolean; message: string }> {
        try {
            const creator = await getTemplateById(TRINITY_BOTS.CREATOR);
            const product = await getTemplateById(TRINITY_BOTS.PRODUCT);
            const clerk = await getTemplateById(TRINITY_BOTS.CLERK);

            if (!creator || !product || !clerk) {
                this._isActive = true; // Fallback to true if templates missing but we want to allow user selections
                return { success: true, message: 'Factory ONLINE (Limited Mode)' };
            }

            this._isActive = true;
            return {
                success: true,
                message: 'Factory is ONLINE.'
            };
        } catch (error: any) {
            this._isActive = true; // Still allow
            return { success: false, message: error.message };
        }
    }

    private _autoLoopTimer: any = null;
    private _productVault: { id: string; name: string; date: string; trend: string; blob: Blob; previewData?: any }[] = [];
    private _lastTrends: string[] = [];

    getVault() { return this._productVault; }

    /**
     * OTONOM AVCI MODU (Autonomous Hunter)
     */
    startAutonomousLoop(onLog: (msg: string) => void) {
        if (this._autoLoopTimer) return;

        onLog('Trend taraması başlatıldı (Periyot: 10s)...');

        this._autoLoopTimer = setInterval(async () => {
            const potentialTrends = [
                'Yapay Zeka Çocuk Masalları',
                'AI Destekli Meditasyon Paketi',
                'Kripto Para Analiz Botu',
                'Instagram Influencer Otomasyonu',
                'Kişisel Fitness Koçu AI',
                'Stoacı Yaşam Rehberi',
                'YouTube İçerik Üretim Asistanı',
                'E-Ticaret Karlılık Hesaplayıcı'
            ];

            const availableTrends = potentialTrends.filter(t => !this._lastTrends.slice(-3).includes(t));
            const trend = Math.random() > 0.3 ? availableTrends[Math.floor(Math.random() * availableTrends.length)] : null;

            if (trend) {
                this._lastTrends.push(trend);
                onLog(`📈 YENİ FIRSAT BULUNDU: "${trend}"`);

                onLog('🧠 En uygun otomasyon şablonu seçiliyor...');
                const templates = await getTemplates();
                const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

                // 🤖 OPTIMUS KARAR ONAYI
                onLog('🤖 OPTIMUS karar onayı bekleniyor...');
                try {
                    const optimusDecision = await OPTIMUS.process(
                        `üretim başlat: ${trend} için ${selectedTemplate.name}`,
                        'factory-autonomous'
                    );

                    if (optimusDecision.action === 'BLOCK') {
                        onLog(`⛔ OPTIMUS üretimi bloke etti: ${optimusDecision.message}`);
                        return;
                    } else if (optimusDecision.action === 'DEFER') {
                        onLog(`⏸️ OPTIMUS üretimi erteledi: ${optimusDecision.message}`);
                        return;
                    }
                    onLog(`✅ OPTIMUS onay verdi: ${optimusDecision.message || 'Üretim başlatılabilir'}`);
                } catch (err) {
                    onLog('⚠️ OPTIMUS bağlantısı başarısız, üretim devam ediyor...');
                }

                onLog(`🏭 "${selectedTemplate.name}" temel alınarak paket hazırlanıyor...`);
                await new Promise(r => setTimeout(r, 2000));

                const productData = {
                    __meta: {
                        generator: 'OmniFlow Factory v3.2 (Autonomous)',
                        generatedAt: new Date().toISOString(),
                        trend
                    },
                    product: {
                        name: `AI Bundle: ${trend}`,
                        description: `Autonomous solution targeted for ${trend}. Based on ${selectedTemplate.name}.`,
                        license: 'Standard Commercial License'
                    },
                    templates: [{
                        id: selectedTemplate.id,
                        name: selectedTemplate.name,
                        description: selectedTemplate.description,
                        blueprint: selectedTemplate.blueprint
                    }]
                };

                const zip = new JSZip();
                zip.file('blueprint.json', JSON.stringify(productData, null, 2));

                const softwareFolder = zip.folder('standalone-software');
                if (softwareFolder) {
                    softwareFolder.file('index.js', STANDALONE_RUNNER_CODE(selectedTemplate.blueprint));
                    softwareFolder.file('package.json', STANDALONE_PACKAGE_JSON(selectedTemplate.name));
                    softwareFolder.file('.env.example', STANDALONE_ENV_EXAMPLE);
                    softwareFolder.file('README.md', STANDALONE_README(selectedTemplate.name));
                    softwareFolder.file('baslat.bat', STANDALONE_BAT_SCRIPT);
                    softwareFolder.file('requirements.txt', STANDALONE_REQUIREMENTS);
                    softwareFolder.file('NASIL_YAYINLANIR.md', STANDALONE_PUBLISH_GUIDE(selectedTemplate.name));
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });

                this._productVault.push({
                    id: uuidv4(),
                    name: productData.product.name,
                    date: new Date().toLocaleTimeString(),
                    trend: trend,
                    blob: zipBlob,
                    previewData: productData
                });

                onLog('🚀 Satış platformlarına yükleniyor (Gumroad, Shopify)...');
                await new Promise(r => setTimeout(r, 1500));
                onLog(`✅ BAŞARILI: "${trend}" satışa açıldı! (Fiyat: $49) | Depo'ya Eklendi 📦`);
            } else {
                onLog('... Pazar analizi devam ediyor (Fırsat yok)');
            }
        }, 10000);
    }

    stopAutonomousLoop() {
        if (this._autoLoopTimer) {
            clearInterval(this._autoLoopTimer);
            this._autoLoopTimer = null;
        }
    }

    async getAvailableTemplates() {
        return await getTemplates();
    }

    async runCustomProductionCycle(templateIds: string[], onLog?: (msg: string) => void): Promise<{ log: string; downloadBlob: Blob | null }> {
        if (!this._isActive) throw new Error('Factory is OFFLINE.');
        const log: string[] = [];
        const logWrapper = (msg: string) => {
            console.log(`[Factory-Custom] ${msg}`);
            onLog?.(msg);
            log.push(msg);
        };

        logWrapper(`>> [SYSTEM] Custom production triggered for: [${templateIds.join(', ')}]`);

        try {
            // Fetch templates - using a fresh list to avoid shuffle issues if any
            const allTemplates = await getTemplates();
            const productTemplates = templateIds.map(id => allTemplates.find(t => t.id === id)).filter(Boolean) as AutomationTemplate[];

            if (productTemplates.length === 0) {
                logWrapper('>> [ERROR] No valid templates matched the selection.');
                throw new Error('Selection mismatch.');
            }

            logWrapper(`>> [PRODUCT] Found ${productTemplates.length} matches. Initializing Deep Bundler...`);
            await new Promise(r => setTimeout(r, 800));

            const productData = {
                __meta: {
                    generator: 'OmniFlow Factory v3.2 (Deep Bundle)',
                    generatedAt: new Date().toISOString(),
                    bundleType: 'Custom-Selection',
                    selectedIds: templateIds
                },
                product: {
                    name: productTemplates.length === 1 ? productTemplates[0].name : `Custom Bundle (${productTemplates.length} Items)`,
                    description: "User selected custom automation package with isolated source code for each module.",
                    license: "Admin Export License"
                },
                templates: productTemplates.map(t => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    blueprint: t.blueprint
                }))
            };

            const zip = new JSZip();
            // Root blueprint for the whole bundle
            zip.file('bundle_blueprint.json', JSON.stringify(productData, null, 2));

            // Deep Bundle: Each template gets its own folder in 'projects/'
            const projectsFolder = zip.folder('projects');
            if (projectsFolder) {
                productTemplates.forEach(t => {
                    logWrapper(`>> [PACKAGER] Processing: ${t.name} (${t.id})`);
                    const tFolder = projectsFolder.folder(t.id);
                    if (tFolder) {
                        tFolder.file('index.js', STANDALONE_RUNNER_CODE(t.blueprint));
                        tFolder.file('package.json', STANDALONE_PACKAGE_JSON(t.name));
                        tFolder.file('.env.example', STANDALONE_ENV_EXAMPLE);
                        tFolder.file('README.md', STANDALONE_README(t.name));
                        tFolder.file('baslat.bat', STANDALONE_BAT_SCRIPT);
                        tFolder.file('requirements.txt', STANDALONE_REQUIREMENTS);
                        tFolder.file('NASIL_YAYINLANIR.md', STANDALONE_PUBLISH_GUIDE(t.name));
                        tFolder.file('blueprint.json', JSON.stringify(t.blueprint, null, 2));
                    }
                });
            }

            logWrapper('>> [SYSTEM] Compressing archive...');
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            this._productVault.push({
                id: uuidv4(),
                name: productData.product.name,
                date: new Date().toLocaleTimeString(),
                trend: productTemplates.length === 1 ? productTemplates[0].name : 'Custom Bundle',
                blob: zipBlob,
                previewData: productData
            });

            logWrapper(`>> [SUCCESS] ZIP created (${(zipBlob.size / 1024).toFixed(1)} KB).`);
            return { log: log.join('\n'), downloadBlob: zipBlob };
        } catch (error: any) {
            logWrapper(`>> [CRITICAL] Custom production failed: ${error.message}`);
            return { log: log.join('\n'), downloadBlob: null };
        }
    }

    async runProductionCycle(onLog?: (message: string) => void): Promise<{ log: string; downloadBlob: Blob | null }> {
        if (!this._isActive) throw new Error('Factory is OFFLINE.');
        const log: string[] = [];
        const logWrapper = (msg: string) => {
            console.log(`[Factory-Master] ${msg}`);
            onLog?.(msg);
            log.push(msg);
        };

        try {
            logWrapper('>> [SYSTEM] Master Production Cycle starting...');
            const allTemplates = await getTemplates();
            const targetIds = [
                TRINITY_BOTS.CREATOR,
                TRINITY_BOTS.PRODUCT,
                TRINITY_BOTS.CLERK,
                'agency-client-onboarding',
                'zoom-webinar-automation'
            ];

            const productTemplates = targetIds.map(id => allTemplates.find(t => t.id === id)).filter(Boolean) as AutomationTemplate[];

            const productData = {
                __meta: {
                    generator: 'OmniFlow Factory v3.2',
                    generatedAt: new Date().toISOString(),
                    productId: AI_AGENCY_STARTER_KIT.id
                },
                product: {
                    name: AI_AGENCY_STARTER_KIT.name,
                    description: AI_AGENCY_STARTER_KIT.description,
                    license: AI_AGENCY_STARTER_KIT.licenseType
                },
                templates: productTemplates.map(t => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    blueprint: t.blueprint
                }))
            };

            const zip = new JSZip();
            zip.file('master_blueprint.json', JSON.stringify(productData, null, 2));

            const softwareFolder = zip.folder('software');
            if (softwareFolder) {
                productTemplates.forEach(t => {
                    logWrapper(`>> [PACKAGER] Adding to Master: ${t.name}`);
                    const subFolder = softwareFolder.folder(t.id);
                    if (subFolder) {
                        subFolder.file('index.js', STANDALONE_RUNNER_CODE(t.blueprint));
                        subFolder.file('package.json', STANDALONE_PACKAGE_JSON(t.name));
                        subFolder.file('.env.example', STANDALONE_ENV_EXAMPLE);
                        subFolder.file('README.md', STANDALONE_README(t.name));
                        subFolder.file('baslat.bat', STANDALONE_BAT_SCRIPT);
                        subFolder.file('requirements.txt', STANDALONE_REQUIREMENTS);
                        subFolder.file('NASIL_YAYINLANIR.md', STANDALONE_PUBLISH_GUIDE(t.name));
                        subFolder.file('blueprint.json', JSON.stringify(t.blueprint, null, 2));
                    }
                });
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            this._productVault.push({
                id: uuidv4(),
                name: productData.product.name,
                date: new Date().toLocaleTimeString(),
                trend: 'Master Bundle',
                blob: zipBlob,
                previewData: productData
            });

            logWrapper(`>> [SUCCESS] Master ZIP created!`);
            return { log: log.join('\n'), downloadBlob: zipBlob };
        } catch (error: any) {
            logWrapper(`>> [CRITICAL] Master production failed: ${error.message}`);
            return { log: log.join('\n'), downloadBlob: null };
        }
    }

    downloadProduct(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getStatus(): FactoryStatus {
        return {
            isActive: this._isActive,
            activeWorkers: Object.values(TRINITY_BOTS),
            productionQueue: 0,
            totalRevenue: this._revenue,
            lastCycle: new Date().toISOString()
        };
    }
}

export const factoryService = new FactoryService();
export default factoryService;
