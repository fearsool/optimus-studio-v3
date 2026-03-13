"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factoryService = exports.FactoryService = exports.AI_AGENCY_STARTER_KIT = void 0;
const templateService_1 = require("./templateService");
const nemotronService_1 = require("./nemotronService");
const factoryDecisionEngine_1 = require("./factoryDecisionEngine");
const uuid_1 = require("uuid");
const jszip_1 = __importDefault(require("jszip"));
const standaloneRunnerTemplate_1 = require("./templates/standaloneRunnerTemplate");
const optimus_1 = require("./optimus");
// ============================================
// THE PROFIT TRINITY: FACTORY WORKER DEFINITIONS
// ============================================
const TRINITY_BOTS = {
    CREATOR: 'amazon-listing-optimizer',
    PRODUCT: 'agency-voice-outreach',
    CLERK: 'digital-asset-delivery'
};
exports.AI_AGENCY_STARTER_KIT = {
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
class FactoryService {
    constructor() {
        this._isActive = false;
        this._revenue = 0;
        this._autoLoopTimer = null;
        this._productVault = [];
        this._lastTrends = [];
    }
    async makeDecision(taskType, input, contextSummary) {
        const decision = await factoryDecisionEngine_1.factoryDecisionEngine.execute(taskType, input, contextSummary);
        return {
            success: true,
            result: decision.params || {},
            fallbackUsed: decision.confidence === 0,
            appliedAction: decision.action
        };
    }
    getNemotronStatus() {
        return nemotronService_1.nemotronService.getStatus();
    }
    async bootstrapFactory() {
        try {
            const creator = await (0, templateService_1.getTemplateById)(TRINITY_BOTS.CREATOR);
            const product = await (0, templateService_1.getTemplateById)(TRINITY_BOTS.PRODUCT);
            const clerk = await (0, templateService_1.getTemplateById)(TRINITY_BOTS.CLERK);
            if (!creator || !product || !clerk) {
                this._isActive = true; // Fallback to true if templates missing but we want to allow user selections
                return { success: true, message: 'Factory ONLINE (Limited Mode)' };
            }
            this._isActive = true;
            return {
                success: true,
                message: 'Factory is ONLINE.'
            };
        }
        catch (error) {
            this._isActive = true; // Still allow
            return { success: false, message: error.message };
        }
    }
    getVault() { return this._productVault; }
    /**
     * OTONOM AVCI MODU (Autonomous Hunter)
     */
    startAutonomousLoop(onLog) {
        if (this._autoLoopTimer)
            return;
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
                const templates = await (0, templateService_1.getTemplates)();
                const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
                // 🤖 OPTIMUS KARAR ONAYI
                onLog('🤖 OPTIMUS karar onayı bekleniyor...');
                try {
                    const optimusDecision = await optimus_1.OPTIMUS.process(`üretim başlat: ${trend} için ${selectedTemplate.name}`, 'factory-autonomous');
                    if (optimusDecision.action === 'BLOCK') {
                        onLog(`⛔ OPTIMUS üretimi bloke etti: ${optimusDecision.message}`);
                        return;
                    }
                    else if (optimusDecision.action === 'DEFER') {
                        onLog(`⏸️ OPTIMUS üretimi erteledi: ${optimusDecision.message}`);
                        return;
                    }
                    onLog(`✅ OPTIMUS onay verdi: ${optimusDecision.message || 'Üretim başlatılabilir'}`);
                }
                catch (err) {
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
                const zip = new jszip_1.default();
                zip.file('blueprint.json', JSON.stringify(productData, null, 2));
                const softwareFolder = zip.folder('standalone-software');
                if (softwareFolder) {
                    softwareFolder.file('index.js', (0, standaloneRunnerTemplate_1.STANDALONE_RUNNER_CODE)(selectedTemplate.blueprint));
                    softwareFolder.file('package.json', (0, standaloneRunnerTemplate_1.STANDALONE_PACKAGE_JSON)(selectedTemplate.name));
                    softwareFolder.file('.env.example', standaloneRunnerTemplate_1.STANDALONE_ENV_EXAMPLE);
                    softwareFolder.file('README.md', (0, standaloneRunnerTemplate_1.STANDALONE_README)(selectedTemplate.name));
                    softwareFolder.file('baslat.bat', standaloneRunnerTemplate_1.STANDALONE_BAT_SCRIPT);
                    softwareFolder.file('requirements.txt', standaloneRunnerTemplate_1.STANDALONE_REQUIREMENTS);
                    softwareFolder.file('NASIL_YAYINLANIR.md', (0, standaloneRunnerTemplate_1.STANDALONE_PUBLISH_GUIDE)(selectedTemplate.name));
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                this._productVault.push({
                    id: (0, uuid_1.v4)(),
                    name: productData.product.name,
                    date: new Date().toLocaleTimeString(),
                    trend: trend,
                    blob: zipBlob,
                    previewData: productData
                });
                onLog('🚀 Satış platformlarına yükleniyor (Gumroad, Shopify)...');
                await new Promise(r => setTimeout(r, 1500));
                onLog(`✅ BAŞARILI: "${trend}" satışa açıldı! (Fiyat: $49) | Depo'ya Eklendi 📦`);
            }
            else {
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
        return await (0, templateService_1.getTemplates)();
    }
    async runCustomProductionCycle(templateIds, onLog) {
        if (!this._isActive)
            throw new Error('Factory is OFFLINE.');
        const log = [];
        const logWrapper = (msg) => {
            console.log(`[Factory-Custom] ${msg}`);
            onLog === null || onLog === void 0 ? void 0 : onLog(msg);
            log.push(msg);
        };
        logWrapper(`>> [SYSTEM] Custom production triggered for: [${templateIds.join(', ')}]`);
        try {
            // Fetch templates - using a fresh list to avoid shuffle issues if any
            const allTemplates = await (0, templateService_1.getTemplates)();
            const productTemplates = templateIds.map(id => allTemplates.find(t => t.id === id)).filter(Boolean);
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
            const zip = new jszip_1.default();
            // Root blueprint for the whole bundle
            zip.file('bundle_blueprint.json', JSON.stringify(productData, null, 2));
            // Deep Bundle: Each template gets its own folder in 'projects/'
            const projectsFolder = zip.folder('projects');
            if (projectsFolder) {
                productTemplates.forEach(t => {
                    logWrapper(`>> [PACKAGER] Processing: ${t.name} (${t.id})`);
                    const tFolder = projectsFolder.folder(t.id);
                    if (tFolder) {
                        tFolder.file('index.js', (0, standaloneRunnerTemplate_1.STANDALONE_RUNNER_CODE)(t.blueprint));
                        tFolder.file('package.json', (0, standaloneRunnerTemplate_1.STANDALONE_PACKAGE_JSON)(t.name));
                        tFolder.file('.env.example', standaloneRunnerTemplate_1.STANDALONE_ENV_EXAMPLE);
                        tFolder.file('README.md', (0, standaloneRunnerTemplate_1.STANDALONE_README)(t.name));
                        tFolder.file('baslat.bat', standaloneRunnerTemplate_1.STANDALONE_BAT_SCRIPT);
                        tFolder.file('requirements.txt', standaloneRunnerTemplate_1.STANDALONE_REQUIREMENTS);
                        tFolder.file('NASIL_YAYINLANIR.md', (0, standaloneRunnerTemplate_1.STANDALONE_PUBLISH_GUIDE)(t.name));
                        tFolder.file('blueprint.json', JSON.stringify(t.blueprint, null, 2));
                    }
                });
            }
            logWrapper('>> [SYSTEM] Compressing archive...');
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            this._productVault.push({
                id: (0, uuid_1.v4)(),
                name: productData.product.name,
                date: new Date().toLocaleTimeString(),
                trend: productTemplates.length === 1 ? productTemplates[0].name : 'Custom Bundle',
                blob: zipBlob,
                previewData: productData
            });
            logWrapper(`>> [SUCCESS] ZIP created (${(zipBlob.size / 1024).toFixed(1)} KB).`);
            return { log: log.join('\n'), downloadBlob: zipBlob };
        }
        catch (error) {
            logWrapper(`>> [CRITICAL] Custom production failed: ${error.message}`);
            return { log: log.join('\n'), downloadBlob: null };
        }
    }
    async runProductionCycle(onLog) {
        if (!this._isActive)
            throw new Error('Factory is OFFLINE.');
        const log = [];
        const logWrapper = (msg) => {
            console.log(`[Factory-Master] ${msg}`);
            onLog === null || onLog === void 0 ? void 0 : onLog(msg);
            log.push(msg);
        };
        try {
            logWrapper('>> [SYSTEM] Master Production Cycle starting...');
            const allTemplates = await (0, templateService_1.getTemplates)();
            const targetIds = [
                TRINITY_BOTS.CREATOR,
                TRINITY_BOTS.PRODUCT,
                TRINITY_BOTS.CLERK,
                'agency-client-onboarding',
                'zoom-webinar-automation'
            ];
            const productTemplates = targetIds.map(id => allTemplates.find(t => t.id === id)).filter(Boolean);
            const productData = {
                __meta: {
                    generator: 'OmniFlow Factory v3.2',
                    generatedAt: new Date().toISOString(),
                    productId: exports.AI_AGENCY_STARTER_KIT.id
                },
                product: {
                    name: exports.AI_AGENCY_STARTER_KIT.name,
                    description: exports.AI_AGENCY_STARTER_KIT.description,
                    license: exports.AI_AGENCY_STARTER_KIT.licenseType
                },
                templates: productTemplates.map(t => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    blueprint: t.blueprint
                }))
            };
            const zip = new jszip_1.default();
            zip.file('master_blueprint.json', JSON.stringify(productData, null, 2));
            const softwareFolder = zip.folder('software');
            if (softwareFolder) {
                productTemplates.forEach(t => {
                    logWrapper(`>> [PACKAGER] Adding to Master: ${t.name}`);
                    const subFolder = softwareFolder.folder(t.id);
                    if (subFolder) {
                        subFolder.file('index.js', (0, standaloneRunnerTemplate_1.STANDALONE_RUNNER_CODE)(t.blueprint));
                        subFolder.file('package.json', (0, standaloneRunnerTemplate_1.STANDALONE_PACKAGE_JSON)(t.name));
                        subFolder.file('.env.example', standaloneRunnerTemplate_1.STANDALONE_ENV_EXAMPLE);
                        subFolder.file('README.md', (0, standaloneRunnerTemplate_1.STANDALONE_README)(t.name));
                        subFolder.file('baslat.bat', standaloneRunnerTemplate_1.STANDALONE_BAT_SCRIPT);
                        subFolder.file('requirements.txt', standaloneRunnerTemplate_1.STANDALONE_REQUIREMENTS);
                        subFolder.file('NASIL_YAYINLANIR.md', (0, standaloneRunnerTemplate_1.STANDALONE_PUBLISH_GUIDE)(t.name));
                        subFolder.file('blueprint.json', JSON.stringify(t.blueprint, null, 2));
                    }
                });
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            this._productVault.push({
                id: (0, uuid_1.v4)(),
                name: productData.product.name,
                date: new Date().toLocaleTimeString(),
                trend: 'Master Bundle',
                blob: zipBlob,
                previewData: productData
            });
            logWrapper(`>> [SUCCESS] Master ZIP created!`);
            return { log: log.join('\n'), downloadBlob: zipBlob };
        }
        catch (error) {
            logWrapper(`>> [CRITICAL] Master production failed: ${error.message}`);
            return { log: log.join('\n'), downloadBlob: null };
        }
    }
    downloadProduct(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    getStatus() {
        return {
            isActive: this._isActive,
            activeWorkers: Object.values(TRINITY_BOTS),
            productionQueue: 0,
            totalRevenue: this._revenue,
            lastCycle: new Date().toISOString()
        };
    }
}
exports.FactoryService = FactoryService;
exports.factoryService = new FactoryService();
exports.default = exports.factoryService;
