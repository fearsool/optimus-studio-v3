import { AutomationTemplate } from './store';

export interface ProductPackage {
    id: string;
    name: string;
    version: string;
    files: Record<string, string>; // filename -> content
    meta: {
        template_id: string;
        created_at: string;
        feedback_enabled: boolean;
        estimated_revenue: string;
        difficulty: string;
    };
}

/**
 * 📦 TEMPLATE PACKAGER - MOD 2
 * 
 * Otomasyonları satışa hazır pakete çevirir.
 * feedbackClient opsiyonel olarak dahil edilir.
 */
export class TemplatePackager {

    /**
     * Template'i Gumroad/Etsy için paketle
     */
    packageForExport(template: AutomationTemplate, includeFeedback: boolean = true): ProductPackage {
        const packageId = `${template.id}-v${template.blueprint?.version || 1}`;

        const files: Record<string, string> = {};

        // 1. Ana otomasyon dosyası
        files['automation.json'] = JSON.stringify({
            id: template.id,
            name: template.name,
            description: template.description,
            version: template.blueprint?.version || 1,
            nodes: template.blueprint?.nodes || [],
            category: template.category,
            requiredApis: template.requiredApis || []
        }, null, 2);

        // 2. Kurulum rehberi
        files['SETUP.md'] = this.generateSetupGuide(template);

        // 3. README
        files['README.md'] = this.generateReadme(template, includeFeedback);

        // 4. Feedback Client (Opsiyonel)
        if (includeFeedback) {
            files['feedbackClient.js'] = this.generateFeedbackClientJS(template.id);
        }

        // 5. Environment template
        files['.env.example'] = this.generateEnvTemplate(template);

        // 6. Kuafor Nemotron (Özelleşmiş Zeka)
        files['kuaforNemotron.js'] = this.generateKuaforNemotronJS();

        // 7. Server (Executable Engine)
        files['server.js'] = this.generateServerJS(template);

        // 8. Package.json
        files['package.json'] = this.generatePackageJson(template);

        return {
            id: packageId,
            name: template.name,
            version: `${template.blueprint?.version || 1}.0.0`,
            files,
            meta: {
                template_id: template.id,
                created_at: new Date().toISOString(),
                feedback_enabled: includeFeedback,
                estimated_revenue: template.estimatedRevenue || 'Unknown',
                difficulty: template.difficulty || 'medium'
            }
        };
    }

    /**
     * Birden fazla template'i bundle olarak paketle
     */
    createBundle(templates: AutomationTemplate[], bundleMeta: {
        name: string;
        description: string;
        price: string;
    }): ProductPackage {
        const files: Record<string, string> = {};

        // Bundle README
        files['README.md'] = `# ${bundleMeta.name}

${bundleMeta.description}

## 📦 İçerik

${templates.map((t, i) => `${i + 1}. **${t.name}** - ${t.description}`).join('\n')}

## 💰 Değer

Bu bundle ile tahmini kazanç: ${templates.reduce((sum, t) => {
            const match = t.estimatedRevenue?.match(/(\d+)/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0)}+ ₺/ay

## 🚀 Kurulum

Her otomasyon kendi klasöründe. Her birinin \`SETUP.md\` dosyasını takip edin.
`;

        // Her template için ayrı klasör
        templates.forEach(template => {
            const pkg = this.packageForExport(template, true);
            Object.entries(pkg.files).forEach(([filename, content]) => {
                files[`${template.id}/${filename}`] = content;
            });
        });

        return {
            id: `bundle-${Date.now()}`,
            name: bundleMeta.name,
            version: '1.0.0',
            files,
            meta: {
                template_id: 'bundle',
                created_at: new Date().toISOString(),
                feedback_enabled: true,
                estimated_revenue: bundleMeta.price,
                difficulty: 'mixed'
            }
        };
    }

    // === PRIVATE HELPERS ===

    private generateSetupGuide(template: AutomationTemplate): string {
        const apis = template.requiredApis || [];

        return `# 🚀 ${template.name} - Kurulum Rehberi

## Gereksinimler

${apis.length > 0
                ? apis.map(api => `- **${api.label}**: ${api.description}${api.link ? ` ([Al](${api.link}))` : ''}`).join('\n')
                : '- Özel API gereksinimi yok'}

## Adım 1: Environment Değişkenleri

\`.env.example\` dosyasını \`.env\` olarak kopyalayın ve değerleri doldurun.

## Adım 2: Bağımlılıkları Yükle

\`\`\`bash
npm install
\`\`\`

## Adım 3: Çalıştır

\`\`\`bash
npm start
\`\`\`

## Destek

Sorun mu var? [support@omniflow.com](mailto:support@omniflow.com)
`;
    }

    private generateReadme(template: AutomationTemplate, feedbackEnabled: boolean): string {
        return `# ${template.icon || '🤖'} ${template.name}

${template.description}

## 📊 Bilgiler

- **Kategori:** ${template.category}
- **Zorluk:** ${template.difficulty}
- **Tahmini Kazanç:** ${template.estimatedRevenue}

## 📁 Dosyalar

- \`automation.json\` - Ana otomasyon tanımı
- \`SETUP.md\` - Kurulum rehberi
- \`.env.example\` - Örnek environment değişkenleri
${feedbackEnabled ? '- `feedbackClient.js` - Opsiyonel performans geri bildirimi' : ''}

${feedbackEnabled ? `
## 📡 Feedback (Opsiyonel)

Bu otomasyon, performans verilerini anonim olarak fabrikaya gönderebilir.
Bu sayede gelecek sürümler daha iyi olur.

### Ne gönderilir:
- ✅ Dönüşüm sayısı
- ✅ Hata sayısı
- ✅ Kullanım metrikleri

### Ne gönderilMEZ:
- ❌ Kişisel bilgiler
- ❌ Mesaj içerikleri
- ❌ Müşteri verileri

### Nasıl açılır/kapanır:

\`\`\`javascript
import { feedbackClient } from './feedbackClient.js';

// Aç
feedbackClient.enable('${template.id}');

// Kapat
feedbackClient.disable();
\`\`\`
` : ''}

## 📜 Lisans

Bu otomasyon OmniFlow Factory tarafından üretilmiştir.
Ticari kullanım lisans şartlarına tabidir.
`;
    }

    private generateFeedbackClientJS(automationId: string): string {
        return `/**
 * 🔄 Feedback Client - OmniFlow Factory
 * 
 * Opsiyonel, anonim performans geri bildirimi.
 * Kişisel veri GÖNDERİLMEZ.
 */

export const feedbackClient = (() => {
  let enabled = false;
  let automationId = '${automationId}';
  const endpoint = 'https://factory.omniflow.com/api/feedback';
  let lastSendTime = 0;
  const MIN_INTERVAL_MS = 60000;

  function enable(id) {
    enabled = true;
    if (id) automationId = id;
    console.log('[Feedback] ✅ Enabled');
  }

  function disable() {
    enabled = false;
  }

  async function send(event, context = {}) {
    if (!enabled) return;
    
    const now = Date.now();
    if (now - lastSendTime < MIN_INTERVAL_MS) return;
    lastSendTime = now;

    try {
      navigator.sendBeacon?.(endpoint, JSON.stringify({
        automation_id: automationId,
        event,
        context,
        ts: now
      })) || fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automation_id: automationId, event, context, ts: now }),
        keepalive: true
      });
    } catch {}
  }

  return { enable, disable, send };
})();

export default feedbackClient;
`;
    }

    private generateEnvTemplate(template: AutomationTemplate): string {
        const apis = template.requiredApis || [];

        let content = `# ${template.name} - Environment Variables\n\n`;

        if (apis.length > 0) {
            apis.forEach(api => {
                content += `# ${api.description}\n`;
                content += `${api.name}=${api.placeholder || 'your-key-here'}\n\n`;
            });
        } else {
            content += '# Bu otomasyon için özel API anahtarı gerekmiyor.\n';
        }

        return content;
    }

    private generatePackageJson(template: AutomationTemplate): string {
        return JSON.stringify({
            name: template.slug || 'automation-bot',
            version: '1.0.0',
            description: template.description,
            main: 'server.js',
            scripts: {
                "start": "node server.js",
                "dev": "nodemon server.js"
            },
            dependencies: {
                "express": "^4.18.2",
                "body-parser": "^1.20.2",
                "node-fetch": "^3.3.2",
                "dotenv": "^16.3.1"
            },
            devDependencies: {
                "nodemon": "^3.0.1"
            }
        }, null, 2);
    }

    private generateKuaforNemotronJS(): string {
        return `/**
 * 💇‍♀️ KUAFÖR NEMETRON - Özel Satış Zekası
 * 
 * Bu modül, kuaför botuna özel zeka katmanıdır for Hair Salon Bot V4.3
 * Fabrika Nemetron'dan bağımsız çalışır.
 */

const fetch = require('node-fetch');

class KuaforNemotron {
    constructor() {
        this.baseUrl = process.env.KUAFOR_AI_URL || 'http://localhost:11434';
        this.model = process.env.KUAFOR_AI_MODEL || 'mistral';
    }

    async analyze(taskType, input, context = '') {
        console.log(\`[Kuaför Nemetron] \${taskType} analiz ediliyor...\`);
        
        try {
            // Kuaför Odaklı Prompt Routing
            let prompt = '';
            if (taskType === 'INTENT_CLASSIFICATION') {
                prompt = \`GÖREV: Bir kuaför asistanı gibi düşün. Müşterinin niyetini anla.
Girdi: "\${input.message}"
Bağlam: \${context}

ÇIKTI (JSON):
{
  "intent": "booking" | "inquiry" | "complaint" | "cancel",
  "readiness": "READY" (Zaman veriyor) | "WARM" (Soru soruyor) | "COLD" (Fiyat sorup kaçıyor),
  "reason": "kısa açıklama"
}\`;
            } else if (taskType === 'NURTURE_STRATEGY') {
                prompt = \`GÖREV: Kararsız müşteriyi ikna etme (Isıtma) stratejisi.
Durum: \${context}

STRATEJİLER:
- Güven (risksiz analiz öner)
- Zamanlama (şimdi mi sonra mı?)
- Değer (fiyat yerine sonuç odaklı)

ÇIKTI (JSON):
{
  "strategy": "value_education" | "soft_nudge",
  "message_angle": "string"
}\`;
            } else {
                prompt = \`GÖREV: \${taskType}. Input: \${JSON.stringify(input)}\`;
            }

            const response = await fetch(\`\${this.baseUrl}/api/generate\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    format: 'json',
                    options: { temperature: 0.2 }
                })
            });

            if (!response.ok) throw new Error('AI Offline');
            const data = await response.json();
            return JSON.parse(data.response);

        } catch (error) {
            console.error('[Kuaför Nemetron] Hata:', error.message);
            // FALLBACKS
            if (taskType === 'INTENT_CLASSIFICATION') return { intent: 'inquiry', readiness: 'WARM' };
            return {}; 
        }
    }
}

module.exports = new KuaforNemotron();
`;
    }

    private generateServerJS(template: AutomationTemplate): string {
        return `/**
 * 🚀 KUAFÖR BOT ENGINE v4.3
 * =========================
 * Kuaför Nemetron ile güçlendirilmiş başlatıcı.
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const kuaforNemotron = require('./kuaforNemotron'); // ÖZEL ZEKA
const feedbackClient = require('./feedbackClient').feedbackClient;

const app = express();
app.use(bodyParser.json());

// Load Automation Blueprint
const automation = JSON.parse(fs.readFileSync('./automation.json', 'utf8'));
console.log(\`[Engine] Loaded: \${automation.name}\`);

const nodeMap = new Map(automation.nodes.map(n => [n.id, n]));

// --- WEBHOOKS ---

app.post('/webhook/instagram', async (req, res) => {
    await processTrigger('instagram_dm', req.body);
    res.status(200).send('OK');
});

app.post('/webhook/whatsapp', async (req, res) => {
    await processTrigger('whatsapp', req.body);
    res.status(200).send('OK');
});

// --- ENGINE LOGIC ---

async function processTrigger(channel, payload) {
    const triggerNode = automation.nodes.find(n => 
        n.type === 'EXTERNAL_CONNECTOR' && 
        n.config.channels && 
        n.config.channels.includes(channel)
    );

    if (!triggerNode) return;
    await executeNode(triggerNode.id, { payload, context: {} });
}

async function executeNode(nodeId, state) {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    console.log(\`👉 Step: \${node.title}\`);

    let result = {};
    let nextNodeId = null;

    try {
        // AI NODE (Kuaför Nemetron)
        if (node.type === 'ANALYST_CRITIC') {
            const taskType = node.config.aiTask || 'General';
            result = await kuaforNemotron.analyze(taskType, state.payload, JSON.stringify(state.context));
            state.context = { ...state.context, ...result };
            
            // Routing Logic
            const connection = node.connections.find(c => {
                if (c.condition === 'default') return false;
                try {
                    const intent = result.intent;
                    const readiness = result.readiness;
                    return eval(c.condition); 
                } catch { return false; }
            });
            nextNodeId = connection ? connection.targetId : (node.connections.find(c => c.condition === 'default')?.targetId);

        } else if (node.type === 'LOGIC_GATE') {
             // Logic Check (Placeholder)
             nextNodeId = node.connections[0]?.targetId;
             
             // Kriz Yönetimi Trigger
             if (node.id === 'crisis-manager') {
                 // Notify Logic
             }

        } else {
            // Standard
            if (node.connections.length > 0) nextNodeId = node.connections[0].targetId;
        }
    } catch (e) {
        console.error('Error:', e);
        if (feedbackClient.send) feedbackClient.send('error', { nodeId, error: e.message });
    }

    if (nextNodeId) {
        await executeNode(nextNodeId, state);
    } else {
        console.log('✅ Flow Complete');
        if (feedbackClient.send) feedbackClient.send('usage', { success: true });
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`✨ Kuaför Asistanı port \${PORT} üzerinde hazır\`);
    console.log('[Info] Kuaför Nemetron Aktif');
});
`;
    }
}

export const templatePackager = new TemplatePackager();

