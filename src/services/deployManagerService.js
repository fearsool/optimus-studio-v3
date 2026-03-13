"use strict";
/**
 * Deploy Manager Service
 * Otomasyonları çalıştırma ve deploy etme işlemlerini yönetir
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployManager = exports.getAutomationStatus = exports.getRunningAutomations = exports.runAutomation = exports.hasRealImplementation = exports.getRealTemplates = exports.generateAutomationFiles = void 0;
const codeGeneratorService_1 = require("./codeGeneratorService");
// Çalışan otomasyonları takip et
const runningAutomations = new Map();
/**
 * Otomasyon için gerekli dosyaları oluştur
 */
function generateAutomationFiles(templateId, env = {}) {
    const template = codeGeneratorService_1.PYTHON_TEMPLATES[templateId];
    if (!template) {
        throw new Error(`Template bulunamadı: ${templateId}`);
    }
    const pythonCode = (0, codeGeneratorService_1.generatePythonFile)(templateId, env);
    const requirements = (0, codeGeneratorService_1.generateRequirements)(template.connectors);
    const workflow = (0, codeGeneratorService_1.generateWorkflow)(template.name);
    const envExample = template.connectors
        .flatMap(c => {
        const connectorEnvVars = {
            'huggingface': ['HUGGINGFACE_TOKEN=hf_your_token_here'],
            'gemini': ['GEMINI_API_KEY=your_gemini_key'],
            'email': ['SMTP_HOST=smtp.gmail.com', 'SMTP_PORT=587', 'SMTP_USER=your_email', 'SMTP_PASS=your_password', 'SMTP_FROM=your_email'],
            'telegram': ['TELEGRAM_BOT_TOKEN=your_bot_token', 'TELEGRAM_CHAT_ID=your_chat_id'],
            'sheets': ['GOOGLE_SHEETS_CREDENTIALS_JSON={}', 'GOOGLE_SHEET_ID=your_sheet_id'],
            'binance': ['BINANCE_API_KEY=your_api_key', 'BINANCE_API_SECRET=your_api_secret']
        };
        return connectorEnvVars[c] || [];
    })
        .join('\n');
    return { pythonCode, requirements, workflow, envExample };
}
exports.generateAutomationFiles = generateAutomationFiles;
/**
 * Desteklenen gerçek çalışan şablonları listele
 */
function getRealTemplates() {
    return Object.values(codeGeneratorService_1.PYTHON_TEMPLATES).map(t => ({
        id: t.templateId,
        name: t.name,
        description: t.description,
        category: t.category,
        connectors: t.connectors,
        isReal: true
    }));
}
exports.getRealTemplates = getRealTemplates;
/**
 * Şablonun gerçek çalışan versiyonu var mı?
 */
function hasRealImplementation(templateId) {
    return templateId in codeGeneratorService_1.PYTHON_TEMPLATES;
}
exports.hasRealImplementation = hasRealImplementation;
/**
 * Otomasyon çalıştır (simülasyon - gerçek çalıştırma backend gerektirir)
 */
async function runAutomation(templateId, params = {}) {
    const runId = `run_${Date.now()}`;
    const run = {
        id: runId,
        templateId,
        status: 'pending',
        startedAt: new Date().toISOString()
    };
    runningAutomations.set(runId, run);
    // Gerçek çalıştırma için Netlify Function veya backend gerekir
    // Şimdilik simülasyon yapıyoruz
    try {
        run.status = 'running';
        // Simüle edilmiş gecikme
        await new Promise(resolve => setTimeout(resolve, 2000));
        const template = codeGeneratorService_1.PYTHON_TEMPLATES[templateId];
        if (template) {
            run.status = 'success';
            run.output = `✅ ${template.name} başarıyla çalıştırıldı!\n\nÇıktı simülasyonu:\n${generateSampleOutput(templateId, params)}`;
        }
        else {
            run.status = 'error';
            run.error = 'Template bulunamadı';
        }
        run.completedAt = new Date().toISOString();
        return run;
    }
    catch (error) {
        run.status = 'error';
        run.error = String(error);
        run.completedAt = new Date().toISOString();
        return run;
    }
}
exports.runAutomation = runAutomation;
/**
 * Örnek çıktı üret (demo amaçlı)
 */
function generateSampleOutput(templateId, params) {
    const outputs = {
        'blog-post-generator': `
# Yapay Zeka ile Geleceğin İş Dünyası

Yapay zeka, iş dünyasını köklü bir şekilde dönüştürüyor...

## Otomasyon ve Verimlilik
AI destekli araçlar, rutin görevleri otomatikleştirerek...

## Yeni İş Modelleri
Girişimciler artık AI'ı kullanarak...

## Sonuç
Gelecekte başarılı olmak için AI'ı...

(523 kelime)
`,
        'instagram-caption-generator': `
🚀 Başarı tesadüf değil, hazırlık ile fırsatın buluşmasıdır!

Her sabah 5'te kalkmak gerekmiyor, ama HEDEFİN için erken kalkmak gerek 💪

Bugün hangi hedefe bir adım daha yaklaştın?

#girişimcilik #motivasyon #başarı #hedef #türkiye #işdünyası #kariyer #gelişim
(8 hashtag)
`,
        'etsy-seo-generator': `
BAŞLIK (138 karakter):
Digital Planner 2024 | Günlük Haftalık Aylık Planlayıcı | GoodNotes Notability iPad Planner | Anında İndirme

AÇIKLAMA:
Bu dijital planner ile hayatınızı organize edin! 365 günlük sayfa, haftalık hedefler, aylık bakış...

TAG'LER (13 adet):
digital planner, 2024 planner, goodnotes planner, ipad planner, daily planner, weekly planner, monthly planner, notability, digital stickers, productivity, organization, minimalist planner, instant download
`,
        'tweet-generator': `
🧵 AI ile para kazanmanın 5 yolu:

1/ Freelance AI servisleri sat - ChatGPT prompt yazımı, AI görsel üretimi
2/ AI destekli içerik üret - Blog, sosyal medya, video script
3/ AI araçları affiliate olarak tanıt
4/ Kendi AI ürününü oluştur
5/ AI eğitimleri ver

RT + Kaydet 🔖

(276/280 karakter)
`,
        'email-responder': `
Merhaba Ahmet Bey,

Ürünümüzle ilgilendiğiniz için teşekkür ederiz!

Dijital ürünlerimiz anında indirilebilir formattadır. Ödeme onaylandıktan hemen sonra erişim linki email adresinize gönderilir.

Fiyatlarımız ürüne göre $9.99 - $49.99 arasında değişmektedir. Detaylı bilgi için ürün sayfalarımızı inceleyebilirsiniz.

Başka sorularınız olursa yardımcı olmaktan memnuniyet duyarız.

Saygılarımla,
Müşteri Hizmetleri

(87 kelime)
`
    };
    return outputs[templateId] || '✅ Otomasyon başarıyla tamamlandı!';
}
/**
 * Çalışan otomasyonları listele
 */
function getRunningAutomations() {
    return Array.from(runningAutomations.values());
}
exports.getRunningAutomations = getRunningAutomations;
/**
 * Otomasyon durumunu al
 */
function getAutomationStatus(runId) {
    return runningAutomations.get(runId);
}
exports.getAutomationStatus = getAutomationStatus;
exports.DeployManager = {
    generateAutomationFiles,
    getRealTemplates,
    hasRealImplementation,
    runAutomation,
    getRunningAutomations,
    getAutomationStatus
};
