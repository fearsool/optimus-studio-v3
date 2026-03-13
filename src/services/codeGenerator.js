"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToClipboard = exports.downloadFile = exports.downloadAsZip = exports.exportBlueprint = exports.generateJsonBlueprint = exports.generateDockerfile = exports.generateNodeServer = exports.generateGitHubAction = exports.generatePythonScript = void 0;
const apiIntegrations_1 = require("./apiIntegrations");
// Node tipine göre hangi gerçek API fonksiyonunu çağıracağını belirle
const getNodeImplementation = (node, idx) => {
    const nodeId = node.id.replace(/-/g, '_');
    const role = node.role.toLowerCase();
    const task = node.task.toLowerCase();
    const nodeType = node.type;
    // Google Reviews - Yorum çekme
    if (role.includes('google') && (task.includes('yorum') || task.includes('review') || task.includes('çek'))) {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ✅ GERÇEK API: Google Places
    """
    print(f"⚙️ Running: ${node.title}")
    reviews = fetch_google_reviews()
    if reviews:
        # Son 5 yorumu al
        recent = reviews[:5]
        result = []
        for r in recent:
            result.append({
                "author": r.get("author_name", "Anonim"),
                "rating": r.get("rating", 0),
                "text": r.get("text", ""),
                "time": r.get("relative_time_description", "")
            })
        print(f"✅ ${node.title} - {len(result)} yorum alındı")
        return result
    return []
`;
    }
    // Sentiment Analizi
    if (nodeType === 'analyst' && (task.includes('sentiment') || task.includes('duygu') || task.includes('analiz') || task.includes('ton'))) {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ✅ GERÇEK API: HuggingFace Sentiment
    """
    print(f"⚙️ Running: ${node.title}")
    
    # Gelen yorumları analiz et
    if isinstance(input_data, list):
        analyzed = []
        for item in input_data:
            text = item.get("text", "") if isinstance(item, dict) else str(item)
            if text:
                sentiment = analyze_sentiment(text)
                analyzed.append({
                    **item if isinstance(item, dict) else {"text": text},
                    "sentiment": sentiment
                })
        print(f"✅ ${node.title} - {len(analyzed)} yorum analiz edildi")
        return analyzed
    else:
        result = analyze_sentiment(str(input_data))
        print(f"✅ ${node.title} completed")
        return result
`;
    }
    // Logic Gate - Yönlendirici
    if (nodeType === 'logic_gate') {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ✅ GERÇEK LOGIC: Karar verici
    """
    print(f"⚙️ Running: ${node.title}")
    
    if isinstance(input_data, list):
        negative = [x for x in input_data if x.get("sentiment", {}).get("label") == "olumsuz"]
        positive = [x for x in input_data if x.get("sentiment", {}).get("label") == "olumlu"]
        neutral = [x for x in input_data if x.get("sentiment", {}).get("label") not in ["olumsuz", "olumlu"]]
        
        print(f"📊 Olumlu: {len(positive)}, Olumsuz: {len(negative)}, Nötr: {len(neutral)}")
        
        return {
            "negative": negative,
            "positive": positive,
            "neutral": neutral,
            "has_urgent": len(negative) > 0
        }
    
    print(f"✅ ${node.title} completed")
    return {"processed": input_data}
`;
    }
    // Human Approval / Alert - Telegram bildirimi
    if (nodeType === 'approval' || task.includes('bildirim') || task.includes('alert') || task.includes('acil')) {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ✅ GERÇEK API: Telegram Bildirim
    """
    print(f"⚙️ Running: ${node.title}")
    
    # Olumsuz yorumlar için bildirim
    if isinstance(input_data, dict) and input_data.get("has_urgent"):
        negative = input_data.get("negative", [])
        for item in negative[:3]:  # Max 3 bildirim
            msg = f"🚨 OLUMSUZ YORUM!\\n\\n"
            msg += f"👤 {item.get('author', 'Anonim')}\\n"
            msg += f"⭐ {item.get('rating', '?')}/5\\n"
            msg += f"📝 {item.get('text', '')[:200]}..."
            send_telegram_message(msg)
    
    print(f"✅ ${node.title} - Bildirimler gönderildi")
    return input_data
`;
    }
    // Content Creator - AI Yanıt üretimi
    if (nodeType === 'creator' || task.includes('yanıt') || task.includes('yaz') || task.includes('oluştur')) {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ✅ GERÇEK API: HuggingFace AI
    """
    print(f"⚙️ Running: ${node.title}")
    
    responses = []
    items_to_process = []
    
    if isinstance(input_data, dict):
        # Logic gate çıktısı
        items_to_process = input_data.get("positive", []) + input_data.get("negative", [])
    elif isinstance(input_data, list):
        items_to_process = input_data
    
    for item in items_to_process[:5]:  # Max 5 yanıt
        text = item.get("text", "") if isinstance(item, dict) else str(item)
        sentiment = item.get("sentiment", {}).get("label", "nötr") if isinstance(item, dict) else "nötr"
        
        if sentiment == "olumlu":
            prompt = f"Bir işletme sahibi olarak bu olumlu Google yorumuna kısa ve samimi bir teşekkür mesajı yaz (max 50 kelime): '{text}'"
        else:
            prompt = f"Bir işletme sahibi olarak bu olumsuz Google yorumuna profesyonel ve çözüm odaklı bir yanıt yaz (max 80 kelime): '{text}'"
        
        ai_response = generate_ai_response(prompt, max_tokens=200)
        responses.append({
            **item if isinstance(item, dict) else {"text": text},
            "suggested_reply": ai_response
        })
    
    print(f"✅ ${node.title} - {len(responses)} yanıt üretildi")
    return responses
`;
    }
    // Binance / Trader
    if (nodeType === 'trader' || role.includes('binance') || task.includes('fiyat') || task.includes('kripto')) {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ✅ GERÇEK API: Binance
    """
    print(f"⚙️ Running: ${node.title}")
    
    symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]
    prices = {}
    for symbol in symbols:
        prices[symbol] = get_binance_price(symbol)
    
    print(f"✅ ${node.title} - {len(prices)} fiyat alındı")
    return prices
`;
    }
    // Webhook - Yanıt gönderme (şimdilik simülasyon)
    if (role.includes('google') && task.includes('gönder')) {
        return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    ⚠️ NOT: Google My Business API OAuth2 gerektirir
    Şimdilik yanıtlar konsola yazılıyor
    """
    print(f"⚙️ Running: ${node.title}")
    
    if isinstance(input_data, list):
        for item in input_data:
            reply = item.get("suggested_reply", "")
            author = item.get("author", "Müşteri")
            print(f"\\n📤 YANIT ({author} için):")
            print(f"   {reply}")
            print("-" * 40)
    
    # Telegram'a özet gönder
    summary = f"📊 Yorum Yanıtlama Tamamlandı\\n"
    summary += f"Toplam {len(input_data) if isinstance(input_data, list) else 1} yanıt hazırlandı"
    send_telegram_message(summary)
    
    print(f"✅ ${node.title} - Yanıtlar gösterildi")
    return input_data
`;
    }
    // Default - AI ile genel işlem
    return `
def node_${idx}_${nodeId}(input_data):
    """
    Node: ${node.title}
    Role: ${node.role}
    Type: ${node.type}
    """
    print(f"⚙️ Running: ${node.title}")
    
    prompt = f"""
Role: ${node.role}
Task: ${node.task}
Input: {input_data}

Execute the task and provide output.
"""
    
    result = generate_ai_response(prompt)
    print(f"✅ ${node.title} completed")
    return result
`;
};
// Hangi API fonksiyonlarının ekleneceğini belirle
const detectRequiredApis = (blueprint) => {
    const apis = new Set();
    for (const node of blueprint.nodes) {
        const role = node.role.toLowerCase();
        const task = node.task.toLowerCase();
        if (role.includes('google') && (task.includes('yorum') || task.includes('review'))) {
            apis.add('google_reviews');
        }
        if (node.type === 'approval' || task.includes('bildirim') || task.includes('telegram')) {
            apis.add('telegram');
        }
        if (node.type === 'trader' || role.includes('binance') || task.includes('kripto')) {
            apis.add('binance');
        }
        if (node.type === 'analyst' && (task.includes('sentiment') || task.includes('analiz'))) {
            apis.add('sentiment');
        }
        if (node.type === 'creator' || task.includes('yanıt') || task.includes('yaz')) {
            apis.add('ai_content');
        }
    }
    // AI content her zaman gerekli (fallback için)
    apis.add('ai_content');
    return apis;
};
// ============================================
// PYTHON GENERATOR - GERÇEK API VERSION
// ============================================
const generatePythonScript = (blueprint) => {
    const requiredApis = detectRequiredApis(blueprint);
    // Gerekli API fonksiyonlarını topla
    let apiFunctions = '';
    const envVars = ['HUGGINGFACE_TOKEN'];
    if (requiredApis.has('google_reviews')) {
        apiFunctions += (0, apiIntegrations_1.googlePlacesReviewCode)().functions;
        envVars.push('GOOGLE_API_KEY', 'GOOGLE_PLACE_ID');
    }
    if (requiredApis.has('telegram')) {
        apiFunctions += (0, apiIntegrations_1.telegramNotificationCode)().functions;
        envVars.push('TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID');
    }
    if (requiredApis.has('binance')) {
        apiFunctions += (0, apiIntegrations_1.binancePriceCode)().functions;
        envVars.push('BINANCE_API_KEY', 'BINANCE_SECRET');
    }
    if (requiredApis.has('sentiment')) {
        apiFunctions += (0, apiIntegrations_1.sentimentAnalysisCode)().functions;
    }
    if (requiredApis.has('ai_content')) {
        apiFunctions += (0, apiIntegrations_1.aiContentGenerationCode)().functions;
    }
    // Node implementasyonlarını oluştur
    const nodeImplementations = blueprint.nodes
        .map((node, idx) => getNodeImplementation(node, idx))
        .join('\n');
    const mainScript = `#!/usr/bin/env python3
"""
${blueprint.name}
Auto-generated by OmniFlow Factory
🚀 GERÇEK API ENTEGRASYONLARI ile çalışır!
"""

import os
import json
import time
import hmac
import hashlib
import requests
from datetime import datetime

# python-dotenv kullanarak .env dosyasını yükle
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv yüklü değilse environment variables kullan

# ============================================
# GERÇEK API FONKSİYONLARI
# ============================================
${apiFunctions}

# ============================================
# WORKFLOW NODES - GERÇEK VERİLERLE
# ============================================
${nodeImplementations}

# ============================================
# MAIN EXECUTION
# ============================================
def run_workflow(initial_input = None):
    """Execute the complete workflow with REAL APIs"""
    print("=" * 50)
    print(f"🚀 Starting: ${blueprint.name}")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔌 GERÇEK API bağlantıları kullanılıyor!")
    print("=" * 50)
    
    current_output = initial_input or "Workflow başlatıldı"
    results = {}
    
${blueprint.nodes.map((node, idx) => `    # Step ${idx + 1}: ${node.title}
    try:
        results['${node.id}'] = node_${idx}_${node.id.replace(/-/g, '_')}(current_output)
        current_output = results['${node.id}']
    except Exception as e:
        print(f"❌ ${node.title} hatası: {e}")
        results['${node.id}'] = {"error": str(e)}
    time.sleep(1)  # Rate limiting
`).join('\n')}
    
    print("\\n" + "=" * 50)
    print("✅ Workflow completed!")
    print("=" * 50)
    
    return results

if __name__ == "__main__":
    import sys
    initial = sys.argv[1] if len(sys.argv) > 1 else None
    results = run_workflow(initial)
    
    # Save results
    output_file = f"results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2, default=str)
    print(f"\\n📄 Results saved to {output_file}")
`;
    const requirements = `# Requirements for ${blueprint.name}
# OmniFlow Factory - Gerçek API Entegrasyonları
requests>=2.31.0
python-dotenv>=1.0.0
`;
    // Dinamik .env.example oluştur
    const uniqueEnvVars = [...new Set(envVars)];
    let envExample = `# ${blueprint.name} - Environment Variables
# OmniFlow Factory tarafından otomatik oluşturuldu
# ⚠️ Bu değerleri gerçek API anahtarlarınızla değiştirin!

`;
    for (const v of uniqueEnvVars) {
        const descriptions = {
            'HUGGINGFACE_TOKEN': '# HuggingFace API Token (https://huggingface.co/settings/tokens)',
            'GOOGLE_API_KEY': '# Google Cloud API Key (https://console.cloud.google.com/apis/credentials)',
            'GOOGLE_PLACE_ID': '# İşletmenizin Google Place ID\'si',
            'TELEGRAM_BOT_TOKEN': '# Telegram Bot Token (@BotFather\'dan alın)',
            'TELEGRAM_CHAT_ID': '# Bildirim alacağınız Chat ID',
            'BINANCE_API_KEY': '# Binance API Key',
            'BINANCE_SECRET': '# Binance Secret Key'
        };
        envExample += `${descriptions[v] || `# ${v}`}\n${v}=\n\n`;
    }
    return [
        { filename: 'bot.py', content: mainScript, language: 'python' },
        { filename: 'requirements.txt', content: requirements, language: 'text' },
        { filename: '.env.example', content: envExample, language: 'text' }
    ];
};
exports.generatePythonScript = generatePythonScript;
// ============================================
// GITHUB ACTION GENERATOR - HUGGINGFACE VERSION
// ============================================
const generateGitHubAction = (blueprint) => {
    const safeName = blueprint.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const workflow = `# ${blueprint.name} - GitHub Action
# Auto-generated by OmniFlow Factory
# Uses HuggingFace API (FREE)

name: "🤖 ${blueprint.name}"

on:
  workflow_dispatch:
    inputs:
      trigger_input:
        description: 'Input for the workflow'
        required: false
        default: 'Scheduled run'
  
  # Scheduled runs (Turkey time = UTC+3)
  schedule:
    - cron: '0 6 * * *'   # 09:00 TR
    - cron: '0 15 * * *'  # 18:00 TR

env:
  HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
  TELEGRAM_BOT_TOKEN: \${{ secrets.TELEGRAM_BOT_TOKEN }}
  TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}

jobs:
  run-workflow:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4

      - name: 🐍 Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: 📦 Install dependencies
        run: |
          pip install requests python-dotenv

      - name: 🚀 Run ${blueprint.name}
        run: |
          python main.py "\${{ github.event.inputs.trigger_input || 'Scheduled run' }}"

      - name: 📤 Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: ${safeName}-results-\${{ github.run_number }}
          path: results_*.json
          retention-days: 30
`;
    return [
        { filename: `.github/workflows/${safeName}.yml`, content: workflow, language: 'yaml' }
    ];
};
exports.generateGitHubAction = generateGitHubAction;
// ============================================
// NODE.JS SERVER GENERATOR - HUGGINGFACE VERSION
// ============================================
const generateNodeServer = (blueprint) => {
    const serverCode = `// ${blueprint.name} - Node.js Server
// Auto-generated by OmniFlow Factory
// Uses HuggingFace API (FREE)

const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "google/gemma-2-2b-it";

const SYSTEM_CONTEXT = \`
${blueprint.baseKnowledge || blueprint.description}
\`;

// HuggingFace API call
async function callHuggingFace(prompt) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${HF_TOKEN}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || JSON.stringify(data);
}

// Workflow nodes
const nodes = ${JSON.stringify(blueprint.nodes.map(n => ({
        id: n.id,
        title: n.title,
        role: n.role,
        task: n.task,
        type: n.type
    })), null, 2)};

async function executeNode(node, input) {
  console.log(\`⚙️ Running: \${node.title}\`);
  
  const prompt = \`
Role: \${node.role}
Task: \${node.task}
Context: \${SYSTEM_CONTEXT}
Input: \${input}

Execute and respond.\`;

  try {
    const result = await callHuggingFace(prompt);
    return { success: true, output: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// API Endpoints
app.post('/run', async (req, res) => {
  const { input = 'Start' } = req.body;
  const results = {};
  let currentOutput = input;

  for (const node of nodes) {
    const result = await executeNode(node, currentOutput);
    results[node.id] = result;
    if (result.success) {
      currentOutput = result.output;
    } else {
      break;
    }
  }

  res.json({ success: true, results });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', system: '${blueprint.name}' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 ${blueprint.name} running on port \${PORT}\`);
});
`;
    const packageJson = `{
  "name": "${blueprint.name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "description": "Auto-generated by OmniFlow Factory",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`;
    return [
        { filename: 'server.js', content: serverCode, language: 'javascript' },
        { filename: 'package.json', content: packageJson, language: 'json' }
    ];
};
exports.generateNodeServer = generateNodeServer;
// ============================================
// DOCKERFILE GENERATOR
// ============================================
const generateDockerfile = (blueprint) => {
    const dockerfile = `# ${blueprint.name}
# Auto-generated by OmniFlow Factory

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
`;
    const dockerCompose = `version: '3.8'
services:
  ${blueprint.name.toLowerCase().replace(/\s+/g, '-')}:
    build: .
    ports:
      - "3000:3000"
    environment:
      - HUGGINGFACE_TOKEN=\${HUGGINGFACE_TOKEN}
    restart: unless-stopped
`;
    return [
        { filename: 'Dockerfile', content: dockerfile, language: 'dockerfile' },
        { filename: 'docker-compose.yml', content: dockerCompose, language: 'yaml' }
    ];
};
exports.generateDockerfile = generateDockerfile;
// ============================================
// JSON BLUEPRINT GENERATOR (FOR SALES)
// ============================================
const generateJsonBlueprint = (blueprint) => {
    // Sanitize - Gizli verileri temizle
    const sanitized = {
        ...blueprint,
        id: crypto.randomUUID(), // Müşteri için yeni ID
        apiValues: {}, // Özel anahtarları SIL
        testConfig: undefined, // Test değişkenlerini sil
        // verified: true // Kalite mührü olarak kalsın
    };
    const readme = `# ${blueprint.name}
**OmniFlow Factory Onaylı Şablon**

## 🚀 Kurulum Adımları
1. OmniFlow Panel'e giriş yapın.
2. **"Şablon Yükle"** butonuna tıklayın.
3. İndirdiğiniz \`.json\` dosyasını seçin.
4. Sistem otomatik olarak şablonu kuracaktır.

## 🔑 Gerekli İzinler
Sistemin çalışması için şu anahtarları "KASA" bölümüne eklemelisiniz:
${(blueprint.requiredApis || []).map(api => `- **${api.label}**: ${api.description}`).join('\n')}

---
*Generated by OmniFlow Factory*
`;
    return [
        { filename: `${blueprint.name.replace(/\s+/g, '_')}_Template.json`, content: JSON.stringify(sanitized, null, 2), language: 'json' },
        { filename: 'KURULUM_REHBERI.md', content: readme, language: 'markdown' }
    ];
};
exports.generateJsonBlueprint = generateJsonBlueprint;
// ============================================
// MASTER EXPORT FUNCTION
// ============================================
const exportBlueprint = (blueprint, format) => {
    switch (format) {
        case 'python':
            return (0, exports.generatePythonScript)(blueprint);
        case 'nodejs':
            return [...(0, exports.generateNodeServer)(blueprint), ...(0, exports.generateDockerfile)(blueprint)];
        case 'github-action':
            return [...(0, exports.generatePythonScript)(blueprint), ...(0, exports.generateGitHubAction)(blueprint)];
        case 'dockerfile':
            return [...(0, exports.generateNodeServer)(blueprint), ...(0, exports.generateDockerfile)(blueprint)];
        case 'json-blueprint':
            return (0, exports.generateJsonBlueprint)(blueprint);
        default:
            return (0, exports.generatePythonScript)(blueprint);
    }
};
exports.exportBlueprint = exportBlueprint;
// ============================================
// DOWNLOAD HELPER - Individual File Downloads
// ============================================
const downloadAsZip = async (files, zipName) => {
    files.forEach((file, index) => {
        setTimeout(() => {
            const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.filename.split('/').pop() || file.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, index * 300);
    });
};
exports.downloadAsZip = downloadAsZip;
// Single file download helper
const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
exports.downloadFile = downloadFile;
// ============================================
// COPY TO CLIPBOARD
// ============================================
const copyToClipboard = async (content) => {
    try {
        await navigator.clipboard.writeText(content);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.copyToClipboard = copyToClipboard;
