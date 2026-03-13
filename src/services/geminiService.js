"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoFillField = exports.runAgentNode = exports.architectSystem = exports.generateDiscoveryQuestions = exports.getMarketOpportunities = void 0;
const genai_1 = require("@google/genai");
const types_1 = require("../types");
// Vite uses import.meta.env for browser environment variables
const apiKey = ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_API_KEY) || '';
const openaiKey = ((_b = import.meta.env) === null || _b === void 0 ? void 0 : _b.VITE_OPENAI_API_KEY) || '';
const MOCK_MODE = ((_c = import.meta.env) === null || _c === void 0 ? void 0 : _c.VITE_MOCK_MODE) === 'true' || (!apiKey && !openaiKey);
console.log('Gemini API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
console.log('OpenAI API Key loaded:', openaiKey ? 'Yes' : 'No');
console.log('Mock Mode:', MOCK_MODE ? 'ENABLED (API calls will be simulated)' : 'DISABLED');
const ai = apiKey ? new genai_1.GoogleGenAI({ apiKey }) : null;
// Mock delay to simulate API latency
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
// ============================================
// OPENAI FALLBACK FUNCTION
// Gemini kota dolunca OpenAI kullan
// ============================================
const callOpenAI = async (prompt) => {
    var _a, _b, _c;
    if (!openaiKey) {
        throw new Error('OpenAI API key bulunamadı');
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || 'OpenAI API hatası');
    }
    const data = await response.json();
    return ((_c = (_b = data.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
};
// ============================================
// SMART AI CALL - Gemini önce, sonra OpenAI
// ============================================
const smartAICall = async (prompt, useGemini = true) => {
    // Mock mode aktifse simüle et
    if (MOCK_MODE) {
        console.log('[MOCK] Simulating AI response...');
        await mockDelay();
        return `[Mock Response] Bu bir simülasyon yanıtıdır. Prompt: ${prompt.substring(0, 100)}...`;
    }
    // Önce Gemini dene
    if (useGemini && ai) {
        try {
            console.log('[AI] Trying Gemini API...');
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt
            });
            return response.text || '';
        }
        catch (error) {
            console.warn('[AI] Gemini failed, trying OpenAI...', error.message);
            // 429 hatası veya diğer hatalar için OpenAI'a geç
        }
    }
    // OpenAI'a fallback
    if (openaiKey) {
        try {
            console.log('[AI] Using OpenAI fallback...');
            return await callOpenAI(prompt);
        }
        catch (error) {
            console.error('[AI] OpenAI also failed:', error.message);
        }
    }
    // Her ikisi de başarısızsa mock yanıt
    console.log('[AI] All APIs failed, returning mock response');
    await mockDelay();
    return `[Fallback] API'ler geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.`;
};
const getMarketOpportunities = async () => {
    const sectors = ["Kripto Arbitraj", "Viral İçerik Fabrikaları", "Otonom E-ticaret", "Yapay Zeka Emlak Yönetimi", "DeFi Otomasyonu"];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    // MOCK MODE - Return sample opportunities
    if (MOCK_MODE || !ai) {
        console.log('[MOCK] Returning sample market opportunities...');
        await mockDelay();
        return [
            {
                id: crypto.randomUUID(),
                profession: 'E-ticaret Girişimci',
                painPoint: 'Rakip fiyatlarını manuel takip etmek çok zaman alıyor',
                solutionName: 'Otomatik Fiyat Takip Botu',
                solutionLogic: 'Rakip siteleri scrape edip fiyat değişikliklerinde bildirim gönder',
                estimatedRevenue: '₺10,000-30,000/ay',
                startupCost: '₺0',
                difficulty: 'Orta'
            },
            {
                id: crypto.randomUUID(),
                profession: 'İçerik Üreticisi',
                painPoint: 'Günlük trend takibi ve içerik üretimi yorucu',
                solutionName: 'AI İçerik Fabrikası',
                solutionLogic: 'Trendleri analiz edip otomatik içerik taslakları oluştur',
                estimatedRevenue: '₺5,000-15,000/ay',
                startupCost: '₺0',
                difficulty: 'Kolay'
            },
            {
                id: crypto.randomUUID(),
                profession: 'Kripto Yatırımcısı',
                painPoint: 'Arbitraj fırsatlarını kaçırıyorum',
                solutionName: 'Kripto Arbitraj Dedektörü',
                solutionLogic: 'Borsalar arası fiyat farklarını izle ve uyar',
                estimatedRevenue: '₺20,000-50,000/ay',
                startupCost: '₺500',
                difficulty: 'Zor'
            }
        ];
    }
    const prompt = `
    Bir "Girişim Mimarı" olarak, ${sector} sektöründe 3 adet otomasyon fikri bul.
    Format: JSON Array [{profession, painPoint, solutionName, solutionLogic, estimatedRevenue, difficulty}]
    Dil: Türkçe.
  `;
    try {
        console.log('Calling Gemini for market opportunities...');
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        console.log('Response received:', response);
        const data = JSON.parse(response.text || "[]");
        return data.map((d) => ({ ...d, id: d.id || crypto.randomUUID() }));
    }
    catch (e) {
        console.error('Market opportunities error:', (e === null || e === void 0 ? void 0 : e.message) || e);
        return [];
    }
};
exports.getMarketOpportunities = getMarketOpportunities;
const generateDiscoveryQuestions = async (goal) => {
    const prompt = `
    HEDEF: "${goal}"
    Bu sistem için kullanıcıdan hangi bilgileri almalıyız?
    En kritik 4 soruyu belirle.
    Format: JSON Array of strings. Örnek: ["Soru 1?", "Soru 2?"]
    Dil: Türkçe.
  `;
    try {
        console.log('Calling Gemini for discovery questions...');
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        console.log('Discovery response:', response);
        return JSON.parse(response.text || "[]");
    }
    catch (e) {
        console.error('Discovery questions error:', (e === null || e === void 0 ? void 0 : e.message) || e);
        return ["API Anahtarlarınız?", "Hangi platformda çalışacak?", "Hedef kitle?", "Özel kısıtlamalar?"];
    }
};
exports.generateDiscoveryQuestions = generateDiscoveryQuestions;
const architectSystem = async (goal, persona, context) => {
    const prompt = `
    SİSTEM MİMARISI TASARLA (Bağımsız ve Kod Odaklı).
    SİSTEM ADI: "${persona}" | HEDEF: "${goal}"
    BAĞLAM: ${context}
    
    KRİTİK MİMARİ KURALLAR:
    1. BAĞIMSIZLIK: n8n/Make kullanmadan, sistemin en sonuna mutlaka bir 'video' veya 'creator' tipinde "TEKNİK KURULUM VE KOD PAKETİ (Python/GitHub)" düğümü ekle.
    2. VERİ ZİNCİRİ: Her düğümün çıktısı bir sonrakine {{node_id.output}} ile kusursuz bağlanmalı.
    3. HATA YÖNETİMİ: Python 'try-except' mantığını iş akışına logic_gate olarak ekle.
    4. KULLANIM REHBERİ: Son düğüm, kullanıcının bu sistemi 5 dakikada nasıl ayağa kaldıracağını (Step-by-step) anlatmalı.
    
    DİL: TÜRKÇE. JSON formatında çıktı ver.
  `;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: genai_1.Type.OBJECT,
                properties: {
                    nodes: {
                        type: genai_1.Type.ARRAY,
                        items: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                id: { type: genai_1.Type.STRING },
                                type: { type: genai_1.Type.STRING, enum: Object.values(types_1.NodeType) },
                                title: { type: genai_1.Type.STRING },
                                role: { type: genai_1.Type.STRING },
                                task: { type: genai_1.Type.STRING },
                                connections: {
                                    type: genai_1.Type.ARRAY,
                                    items: {
                                        type: genai_1.Type.OBJECT,
                                        properties: {
                                            targetId: { type: genai_1.Type.STRING },
                                            condition: { type: genai_1.Type.STRING }
                                        }
                                    }
                                }
                            },
                            required: ["id", "type", "title", "role", "task", "connections"]
                        }
                    }
                }
            }
        }
    });
    try {
        return JSON.parse(response.text || "{ \"nodes\": [] }");
    }
    catch (e) {
        return { nodes: [] };
    }
};
exports.architectSystem = architectSystem;
const runAgentNode = async (node, system, history) => {
    let processedTask = node.task;
    history.forEach(h => {
        const placeholder = `{{${h.nodeId}.output}}`;
        if (processedTask.includes(placeholder)) {
            processedTask = processedTask.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), h.output);
        }
    });
    // MOCK MODE - Return simulated agent response
    if (MOCK_MODE || !ai) {
        console.log(`[MOCK] Simulating agent: ${node.title}...`);
        await mockDelay();
        const mockResponses = {
            'research': `## 📊 Araştırma Sonuçları (Mock)\n\n**Konu:** ${processedTask.substring(0, 100)}...\n\n### Bulgular:\n1. ✅ Pazar büyüklüğü: $50M+\n2. ✅ Rakip analizi tamamlandı\n3. ✅ Trend verileri toplandı\n\n> Bu bir simülasyon yanıtıdır. Gerçek veriler için API anahtarı gereklidir.`,
            'creator': `## 📝 İçerik Üretildi (Mock)\n\n**Görev:** ${node.task.substring(0, 100)}...\n\n### Üretilen İçerik:\n\`\`\`python\n# Örnek Python Kodu\ndef main():\n    print("Hello from ${system.name}!")\n    # TODO: Implement actual logic\n    pass\n\nif __name__ == "__main__":\n    main()\n\`\`\`\n\n> Mock mod aktif.`,
            'webhook': `## 🔌 Webhook Bağlantısı (Mock)\n\n**Endpoint:** https://api.example.com/webhook\n**Method:** POST\n**Status:** ✅ Simüle edildi\n\nGerçek API entegrasyonu için:\n1. .env.local dosyasına VITE_API_KEY ekleyin\n2. Sayfayı yenileyin`,
            'trader': `## 💹 Trading Sinyali (Mock)\n\n**Analiz:** ${processedTask.substring(0, 50)}...\n\n| Borsa | Fiyat | Arbitraj |\n|-------|-------|----------|\n| Binance | $45,230 | - |\n| Coinbase | $45,310 | +0.18% |\n| Kraken | $45,195 | -0.08% |\n\n> Simülasyon verisi`,
            'default': `## ✅ ${node.title} Tamamlandı (Mock)\n\n**Rol:** ${node.role}\n**Görev:** ${processedTask.substring(0, 150)}...\n\n### Sonuç:\nBu düğüm başarıyla simüle edildi.\n\n---\n⚠️ **Not:** Mock mod aktif.\nGerçek AI yanıtları için:\n1. Gemini API anahtarı alın\n2. .env.local dosyasına VITE_API_KEY=your_key ekleyin\n3. VITE_MOCK_MODE=false yapın\n4. Sayfayı yenileyin`
        };
        const responseType = node.type;
        const mockText = mockResponses[responseType] || mockResponses['default'];
        return { text: mockText };
    }
    const prompt = `
    ROL: ${node.role} (Proje: ${system.name})
    GÖREV: ${processedTask}
    BAĞLAM: ${system.baseKnowledge}

    PROBLEMSİZ ÇIKTI KURALLARI:
    1. KOD BLOKLARI: Eğer görev teknikse, mutlaka doğrudan kopyalanabilir Python kodu veya GitHub .yml konfigürasyonu ver.
    2. KURULUM REHBERİ: Çıktının sonunda mutlaka "BU SİSTEM NASIL ÇALIŞTIRILIR?" başlığı aç ve:
       - GitHub'a nasıl yüklenir?
       - Hangi kütüphaneler (requirements.txt) lazım?
       - Her gün otomatik çalışması için ne yapılmalı? (Cronjob/GitHub Actions)
       sorularını cevapla.
    3. KULLANIMA HAZIR: Eksik parametre bırakma. Kullanıcı sadece API key yazıp "Run"a basmalı.
    
    DİL: TÜRKÇE.
  `;
    // Auto-retry with 3 attempts
    const maxRetries = 3;
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[${node.title}] API çağrısı deneme ${attempt}/${maxRetries}...`);
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
            const text = response.text || "";
            if (text) {
                console.log(`[${node.title}] Başarılı! Yanıt alındı.`);
                return { text };
            }
            throw new Error("Boş yanıt alındı");
        }
        catch (e) {
            lastError = e;
            console.warn(`[${node.title}] Deneme ${attempt} başarısız:`, (e === null || e === void 0 ? void 0 : e.message) || e);
            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                console.log(`[${node.title}] ${delay}ms beklenip tekrar denenecek...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    // All retries failed - return fallback response
    console.error(`[${node.title}] Tüm denemeler başarısız. Fallback yanıt kullanılıyor.`);
    return {
        text: `⚠️ API Hatası: ${(lastError === null || lastError === void 0 ? void 0 : lastError.message) || 'Bilinmeyen hata'}

🔧 ÇÖZÜM ÖNERİLERİ:
1. API Anahtarınızı kontrol edin (.env.local dosyasında VITE_API_KEY)
2. Gemini API kotanızı kontrol edin (https://console.cloud.google.com)
3. İnternet bağlantınızı kontrol edin
4. Birkaç dakika bekleyip tekrar deneyin

📋 GÖREV BİLGİSİ:
- Düğüm: ${node.title}
- Rol: ${node.role}
- Görev: ${processedTask.substring(0, 200)}...

Bu bir fallback yanıttır. Sistem diğer düğümlere devam edebilir.`
    };
};
exports.runAgentNode = runAgentNode;
const autoFillField = async (goal, fieldLabel) => {
    var _a;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `HEDEF: "${goal}". SORU: "${fieldLabel}". Bu otonom sistemin kod düzeyinde kurulumu için gereken teknik cevabı üret. Dil: Türkçe.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "";
};
exports.autoFillField = autoFillField;
