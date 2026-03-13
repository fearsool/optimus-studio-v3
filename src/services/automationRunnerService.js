"use strict";
/**
 * Automation Runner Service
 * Fabrikadan gerçek otomasyon çalıştırma
 *
 * Özellikler:
 * 1. Multi-AI Self Healing (Gemini -> OpenAI -> Mock)
 * 2. Automated Reliability Engineer (ARE) Verification
 * 3. Client-Side Execution (No 404)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationRunnerService = exports.templateToAutomationType = exports.getAvailableAutomations = exports.runAutomation = exports.AUTOMATION_INFO = void 0;
const generative_ai_1 = require("@google/generative-ai");
const testEngineer_1 = require("./reliability/testEngineer");
// API Keys
const KEYS = {
    GEMINI: import.meta.env.VITE_GEMINI_API_KEY || '',
    OPENAI: import.meta.env.VITE_OPENAI_API_KEY || ''
};
// ==========================================
// TYPES
// ==========================================
// API endpoint (Serverless Function - Optional)
const API_URL = "/.netlify/functions/run-automation";
// Otomasyon tipi bilgileri
exports.AUTOMATION_INFO = {
    "blog-post": {
        name: "📝 AI Blog Yazısı Üretici",
        icon: "📝",
        description: "1000+ kelimelik SEO uyumlu blog yazısı üretir. Gumroad'da $19'a satışa hazır.",
        requiredParams: ["topic"],
        optionalParams: ["keywords"],
        price: "$19"
    },
    "instagram-caption": {
        name: "📸 Instagram Caption Motoru",
        icon: "📸",
        description: "Viral caption + 30 hashtag + CTA üretir. Etsy'de $9'a satışa hazır.",
        requiredParams: ["theme"],
        optionalParams: ["tone"],
        price: "$9"
    },
    "etsy-listing": {
        name: "🛍️ Etsy SEO Listing Engine",
        icon: "🛍️",
        description: "Etsy ürün başlığı + 13 tag + açıklama üretir. Gumroad'da $29'a satışa hazır.",
        requiredParams: ["product"],
        optionalParams: ["category"],
        price: "$29"
    },
    "tweet": {
        name: "🐦 Viral Tweet Üretici",
        icon: "🐦",
        description: "280 karakterlik viral tweet üretir. Bundle olarak $5'a satışa hazır.",
        requiredParams: ["topic"],
        optionalParams: ["style"],
        price: "$5"
    },
    "tweet-thread": {
        name: "🧵 Tweet Thread Makinesi",
        icon: "🧵",
        description: "5 tweet'lik viral thread üretir. Gumroad'da $15'a satışa hazır.",
        requiredParams: ["topic"],
        optionalParams: [],
        price: "$15"
    },
    "email-response": {
        name: "📧 AI Email Yanıtlayıcı",
        icon: "📧",
        description: "Profesyonel email yanıtı üretir. SaaS olarak $29/ay'a satışa hazır.",
        requiredParams: ["email"],
        optionalParams: [],
        price: "$29/mo"
    },
    "product-description": {
        name: "🏷️ E-Ticaret Ürün Açıklaması",
        icon: "🏷️",
        description: "Dönüşüm odaklı ürün açıklaması üretir. Etsy'de $12'a satışa hazır.",
        requiredParams: ["product"],
        optionalParams: ["features"],
        price: "$12"
    },
    "linkedin-post": {
        name: "💼 LinkedIn Post Üretici",
        icon: "💼",
        description: "Profesyonel LinkedIn postu üretir. B2B pazara $19'a satışa hazır.",
        requiredParams: ["topic"],
        optionalParams: ["target"],
        price: "$19"
    },
    "seo-meta": {
        name: "🔍 SEO Meta Tag Üretici",
        icon: "🔍",
        description: "Title + Description + Keyword üretir. Gumroad'da $15'a satışa hazır.",
        requiredParams: ["page", "topic"],
        optionalParams: [],
        price: "$15"
    },
    "video-script": {
        name: "🎬 Viral Video Script Üretici",
        icon: "🎬",
        description: "Hook + Body + CTA ile video script üretir. Gumroad'da $25'a satışa hazır.",
        requiredParams: ["topic"],
        optionalParams: ["platform", "duration"],
        price: "$25"
    },
    "trend-analysis": {
        name: "📊 Trend Analiz Raporu",
        icon: "📊",
        description: "Nişe göre detaylı trend analizi yapar. Gumroad'da $39'a satışa hazır.",
        requiredParams: ["niche"],
        optionalParams: ["platform"],
        price: "$39"
    }
};
/**
 * 1. Google Gemini Provider
 */
const runGemini = async (prompt) => {
    var _a;
    if (!KEYS.GEMINI)
        throw new Error('Gemini Key Missing');
    const genAI = new generative_ai_1.GoogleGenerativeAI(KEYS.GEMINI);
    const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.0-pro"
    ];
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
        catch (e) {
            const msg = ((_a = e.message) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (msg.includes('404') || msg.includes('400') || msg.includes('not found') ||
                msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('exceeded')) {
                console.warn(`Gemini ${modelName} 404/429, trying next...`);
                continue;
            }
            throw e;
        }
    }
    throw new Error("All Gemini models failed");
};
/**
 * 2. OpenAI Provider (Fallback)
 */
const runOpenAI = async (prompt) => {
    if (!KEYS.OPENAI)
        throw new Error('skip-openai');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${KEYS.OPENAI}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
        })
    });
    if (!response.ok)
        throw new Error(`OpenAI Error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
};
/**
 * 3. Mock/Rule-Based Provider (Last Resort)
 */
const runMock = async (prompt) => {
    console.warn('⚠️ All AI APIs failed. Using Mock Fallback.');
    if (prompt.includes('blog'))
        return JSON.stringify({ title: "System Offline", content: "AI Service Unavailable", tags: ["error"] });
    return JSON.stringify({ error: "AI Service Unavailable - Check API Keys" });
};
/**
 * EXECUTION CHAIN
 * Try providers in order: Gemini -> OpenAI -> Mock
 */
async function executeWithSelfHealing(prompt) {
    const chain = [
        { name: 'Gemini', run: runGemini },
        { name: 'OpenAI', run: runOpenAI }
    ];
    for (const provider of chain) {
        try {
            console.log(`🧬 [Self-Healing] Trying provider: ${provider.name}...`);
            return await provider.run(prompt);
        }
        catch (error) {
            if (error.message !== 'skip-openai') {
                console.warn(`⚠️ [Self-Healing] ${provider.name} failed: ${error.message}. Switching...`);
            }
        }
    }
    console.error('🔥 ALL AI PROVIDERS FAILED.');
    return runMock(prompt);
}
// ==========================================
// MAIN RUNNER
// ==========================================
/**
 * Otomasyon çalıştır
 */
/**
 * Otomasyon çalıştır
 */
async function runAutomation(type, params) {
    // 1. Try Serverless Function (Primary)
    try {
        // API çağrısı yap
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, params })
        });
        // 404 veya 500 dönerse hata fırlat -> catch'e düşecek
        if (!response.ok) {
            throw new Error(`Cloud API Error: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        // 2. Local Fallback (Fail-Safe)
        console.warn("☁️ Cloud API unreachable (404/Offline). Switching to 🏠 Local AI Engine...");
        // Bu fonksiyon Gemini Key (veya OpenAI Key) ile yerel üretim yapar.
        return await runLocalWithReliability(type, params);
    }
}
exports.runAutomation = runAutomation;
/**
 * Local Execution with Full Reliability Suite
 */
async function runLocalWithReliability(type, params) {
    try {
        let prompt = "";
        const jsonInstruction = "Return ONLY valid JSON. No markdown.";
        // Prompt Builder
        switch (type) {
            case "blog-post":
                prompt = `Write a blog post about "${params.topic}". Tone: ${params.tone}. Return JSON: { "title": string, "content": string, "metaDescription": string, "tags": string[], "readTime": "X min read" }. ${jsonInstruction}`;
                break;
            case "instagram-caption":
                prompt = `Write Instagram caption for "${params.theme}". Return JSON: { "caption": string, "hashtags": string[], "cta": string, "visualPrompt": string }. ${jsonInstruction}`;
                break;
            case "etsy-listing":
                prompt = `Etsy listing for "${params.product}". Return JSON: { "title": string, "description": string, "tags": string[13], "price": "$XX.XX", "category": string }. Tags must be exactly 13 items. ${jsonInstruction}`;
                break;
            case "tweet":
                prompt = `Viral tweet about "${params.topic}". Return JSON: { "content": string }. Max 280 chars. ${jsonInstruction}`;
                break;
            case "tweet-thread":
                prompt = `5-tweet thread about "${params.topic}". Return JSON: { "tweets": string[], "hook": string }. ${jsonInstruction}`;
                break;
            case "email-response":
                prompt = `Email response to "${params.email}". Return JSON: { "subject": string, "body": string, "tone": "${params.tone || 'professional'}", "actionItems": string[] }. ${jsonInstruction}`;
                break;
            case "product-description":
                prompt = `Product description for "${params.product}". Return JSON: { "content": string, "features": string[] }. ${jsonInstruction}`;
                break;
            case "linkedin-post":
                prompt = `LinkedIn post about "${params.topic}". Return JSON: { "content": string, "hashtags": string[] }. ${jsonInstruction}`;
                break;
            case "video-script":
                prompt = `Video script for "${params.topic}". Return JSON: { "hook": string, "body": string, "cta": string, "duration": string }. ${jsonInstruction}`;
                break;
            case "trend-analysis":
                prompt = `Trend analysis for "${params.niche}". Return JSON: { "trend": string, "opportunity": string, "score": number }. ${jsonInstruction}`;
                break;
            default:
                prompt = `Generate content for ${type} with params: ${JSON.stringify(params)}. Return JSON object.`;
        }
        // 🧬 SELF-HEALING GENERATION
        const text = await executeWithSelfHealing(prompt);
        // 🛡️ ARE: VERIFICATION STEP
        const verification = await testEngineer_1.testEngineer.verifyAutomation(type, text);
        if (!verification.passed) {
            throw new Error(`Quality Control Failed after repairs: ${verification.issues.join(', ')}`);
        }
        return {
            success: true,
            type,
            params,
            result: JSON.stringify(verification.correctedOutput, null, 2), // Return pretty JSON
            timestamp: new Date().toISOString()
        };
    }
    catch (e) {
        return {
            success: false,
            type,
            params,
            result: "",
            timestamp: new Date().toISOString(),
            error: `Factory Error: ${e.message}`
        };
    }
}
/**
 * Tüm otomasyon tiplerini listele
 */
function getAvailableAutomations() {
    return Object.entries(exports.AUTOMATION_INFO).map(([type, info]) => ({
        type: type,
        info
    }));
}
exports.getAvailableAutomations = getAvailableAutomations;
/**
 * Template ID'den otomasyon tipine çevir
 */
function templateToAutomationType(templateId) {
    const mapping = {
        "blog-post-generator": "blog-post",
        "seo-blog-writer": "blog-post",
        "ai-blog-generator": "blog-post",
        "instagram-caption-generator": "instagram-caption",
        "instagram-content-factory": "instagram-caption",
        "instagram-hashtag-optimizer": "instagram-caption",
        "etsy-seo-generator": "etsy-listing",
        "etsy-listing-optimizer": "etsy-listing",
        "etsy-auto-lister": "etsy-listing",
        "tweet-generator": "tweet",
        "twitter-thread-generator": "tweet-thread",
        "viral-tweet-generator": "tweet",
        "email-responder": "email-response",
        "smart-email-responder": "email-response",
        "customer-reply-bot": "email-response",
        "product-description-generator": "product-description",
        "ecommerce-description-writer": "product-description",
        "linkedin-content-generator": "linkedin-post",
        "linkedin-post-generator": "linkedin-post",
        "seo-meta-generator": "seo-meta",
        "meta-tag-optimizer": "seo-meta",
        "video-script-generator": "video-script",
        "tiktok-script-generator": "video-script",
        "reels-content-generator": "video-script",
        "trend-analyzer": "trend-analysis",
        "trend-tarayici": "trend-analysis",
        "niche-finder": "trend-analysis"
    };
    return mapping[templateId] || null;
}
exports.templateToAutomationType = templateToAutomationType;
exports.AutomationRunnerService = {
    runAutomation,
    getAvailableAutomations,
    templateToAutomationType,
    AUTOMATION_INFO: exports.AUTOMATION_INFO
};
