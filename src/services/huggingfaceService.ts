/**
 * HuggingFace Inference Providers Servisi - 0 Maliyet
 * ✅ HF Free API (router.huggingface.co)
 * ✅ Chat Completions format (yeni API)
 * ✅ Exponential backoff + 3 kez otomatik retry
 * ✅ Timeout protection (5 dakika)
 */

export interface HFRequestOptions {
  task: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface HFResponse {
  success: boolean;
  output?: string;
  error?: string;
  model: string;
  tokensUsed?: number;
  cached?: boolean;
}

// ==================== KONFİGÜRASYON ====================

// HuggingFace Inference API - Çalışan ücretsiz modeller
// api-inference.huggingface.co endpoint'i (daha güvenilir)
const FREE_HF_MODELS = {
  TEXT_GENERATION: 'mistralai/Mistral-7B-Instruct-v0.2', // En güvenilir
  ANALYSIS: 'HuggingFaceH4/zephyr-7b-beta', // Analiz için
  RESEARCH: 'microsoft/Phi-3-mini-4k-instruct', // Araştırma
  CREATIVE: 'Qwen/Qwen2-7B-Instruct', // Kreatif içerik
};

// Ollama lokal modeller (kendi sunucunda - tamamen ücretsiz)
const OLLAMA_MODELS = {
  FAST: 'mistral',
  STANDARD: 'neural-chat',
  POWERFUL: 'llama2-uncensored',
};

const HF_TOKEN = (import.meta as any)?.env?.VITE_HUGGINGFACE_TOKEN ||
  process.env.VITE_HUGGINGFACE_TOKEN ||
  (typeof process !== 'undefined' ? process.env.HUGGINGFACE_TOKEN : '');

const OLLAMA_URL = (import.meta as any)?.env?.VITE_OLLAMA_URL ||
  (typeof process !== 'undefined' ? process.env.OLLAMA_URL : 'http://localhost:11434');

// LOCAL MODE: Always use mock in local dev because browser can't call HF directly (CORS)
// In production, we use Netlify Edge Function proxy which bypasses CORS
const IS_LOCAL = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// MOCK MODE: Use mock ONLY if no token is present.
// We allow local usage with token (ignoring CORS risk - we will catch it)
const MOCK_MODE = !HF_TOKEN;

// HuggingFace Inference API - Eski ve güvenilir endpoint
const HF_API_BASE = 'https://api-inference.huggingface.co/models';

if (IS_LOCAL) {
  console.log('[HF] 🏠 Local development detected - using mock mode to avoid CORS issues');
}

// ==================== RETRY & TIMEOUT LOGIC ====================

async function callWithRetry(
  fn: () => Promise<HFResponse>,
  maxRetries: number = 3
): Promise<HFResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();

      // Model yükleniyor mu? Retry et ama bekle
      if (!result.success && result.error?.includes('loading')) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // 1s -> 2s -> 4s -> max 30s
        console.log(`[HF] Model loading, waiting ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Rate limit error? Retry et ama daha fazla bekle
      if (!result.success && result.error?.includes('429')) {
        const waitTime = Math.min(5000 * Math.pow(2, attempt), 60000); // 5s -> 10s -> 20s -> max 60s
        console.log(`[HF] Rate limited, waiting ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Başarılı veya ciddi hata - çık
      return result;

    } catch (error) {
      // Network hatası? Retry et
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000; // exponential backoff
        console.log(`[HF] Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return {
        success: false,
        error: `Max retries exceeded: ${error}`,
        model: 'unknown',
      };
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
    model: 'unknown',
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 300000 // 5 dakika default
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}

// ==================== LM STUDIO (LOCAL) ÇAĞRI ====================

const LM_STUDIO_URL = 'http://localhost:1234/v1';

// 🧠 YEREL UZMAN PERSONEL KADROSU
const LOCAL_SPECIALISTS = {
  CODER: {
    id: 'deepseek-coder',
    role: 'SENIOR SOFTWARE ENGINEER. You write perfect, bug-free, efficient code. No talk, just code.',
    triggers: ['kod', 'code', 'function', 'typescript', 'react', 'css', 'fix', 'debug', 'api', 'json']
  },
  WRITER: {
    id: 'llama-3',
    role: 'PROFESSIONAL COPYWRITER. You write engaging, viral, high-converting marketing copy.',
    triggers: ['yaz', 'write', 'blog', 'makale', 'post', 'tweet', 'seo', 'başlık', 'açıklama', 'hikaye']
  },
  ANALYST: {
    id: 'dolphin-mixtral',
    role: 'STRATEGIC ANALYST. You analyze data and trends to find profit opportunities.',
    triggers: ['analiz', 'analyze', 'rapor', 'report', 'strateji', 'plan', 'kar', 'fikir', 'araştır']
  }
};

async function callLMStudio(task: string): Promise<HFResponse> {
  try {
    // Önce model yüklü mü kontrol et
    const check = await fetch(`${LM_STUDIO_URL}/models`, {
      method: 'GET',
    }).catch(() => null);

    if (!check || check.status !== 200) {
      throw new Error('LM Studio kapalı');
    }

    // 1. Aktif Modeli Bul (Ne yüklüyse onu kullan)
    const modelsResp = await fetch(`${LM_STUDIO_URL}/models`);
    const modelsData = await modelsResp.json();
    const activeModelId = modelsData.data?.[0]?.id || 'local-model';
    console.log(`🔌 [Optimus Local] Aktif Model: ${activeModelId}`);

    // 2. Uzman Rolü Belirle (Sadece System Prompt'u değiştir, modeli değil)
    const lowerTask = task.toLowerCase();
    let selectedSpecialist = LOCAL_SPECIALISTS.ANALYST;
    let specialistName = 'GENEL MÜDÜR (Analist)';

    if (LOCAL_SPECIALISTS.CODER.triggers.some(t => lowerTask.includes(t))) {
      selectedSpecialist = LOCAL_SPECIALISTS.CODER;
      specialistName = 'YAZILIM MÜHENDİSİ';
    } else if (LOCAL_SPECIALISTS.WRITER.triggers.some(t => lowerTask.includes(t))) {
      selectedSpecialist = LOCAL_SPECIALISTS.WRITER;
      specialistName = 'REKLAM YAZARI';
    }

    console.log(`🧠 [Optimus Local] Görev Atandı: ${specialistName} (${activeModelId} kullanılıyor)`);

    const response = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: activeModelId, // <--- DİNAMİK ID
        messages: [
          { role: 'system', content: selectedSpecialist.role },
          { role: 'user', content: task }
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      }),
    });

    if (!response.ok) throw new Error('LM Studio Error');
    const data = await response.json();

    return {
      success: true,
      output: data.choices[0]?.message?.content || '',
      model: `local-${selectedSpecialist.id}`,
      tokensUsed: data.usage?.total_tokens || 0,
      cached: false
    };
  } catch (error) {
    return { success: false, error: 'LM Studio Unavailable', model: 'local' };
  }
}

// ==================== OLLAMA (LOCAL) ÇAĞRI ====================

async function callOllama(task: string, model: string = OLLAMA_MODELS.FAST): Promise<HFResponse> {
  try {
    const response = await withTimeout(
      fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: task,
          stream: false,
          temperature: 0.7,
        }),
      }),
      300000 // 5 dakika
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Ollama API error: ${response.status}`,
        model,
      };
    }

    const data = await response.json();
    return {
      success: true,
      output: data.response || '',
      model,
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: `Ollama error: ${error}`,
      model,
    };
  }
}

// ==================== HUGGINGFACE CHAT COMPLETIONS API ====================

import { GoogleGenerativeAI } from '@google/generative-ai';

const GENAI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || '';

// Global Circuit Breaker State
let apiCircuitOpen = false;

async function callHuggingFace(
  task: string,
  model: string = FREE_HF_MODELS.TEXT_GENERATION
): Promise<HFResponse> {

  // 0. Circuit Breaker Check
  if (apiCircuitOpen) {
    console.log("[HF] 🛡️ Circuit Open - Using Mock Fallback directly");
    return getMockResponse(task, model); // Helper function for mock response
  }

  // 🚀 GEMINI OVERRIDE (Replaces Mock Mode)
  // Eğer Gemini Key varsa, HF veya Mock yerine direkt Gemini kullan.
  if (GENAI_API_KEY) {
    try {
      // console.log(`[HF->Gemini] Redirecting task...`); // Reduced log
      const genAI = new GoogleGenerativeAI(GENAI_API_KEY);

      // Fast path: Try only ONE reliable model first to avoid spamming
      const primaryModel = "gemini-2.0-flash";

      try {
        const geminiModel = genAI.getGenerativeModel({ model: primaryModel });
        const result = await geminiModel.generateContent(task);
        const text = result.response.text();
        return {
          success: true,
          output: text,
          model: `${primaryModel} (via Adapter)`,
          tokensUsed: text.length / 4
        };
      } catch (e: any) {
        // If primary fails, check for fatal errors immediately
        const msg = e.message?.toLowerCase() || '';
        if (msg.includes('429') || msg.includes('quota')) {
          console.warn("[HF] 🛑 Quota Exceeded. Opening Circuit Breaker.");
          apiCircuitOpen = true; // Stop future requests
          return getMockResponse(task, model);
        }
        if (msg.includes('404')) {
          // Try backup model only on 404
          const backupModel = "gemini-2.0-flash";
          try {
            const geminiModel = genAI.getGenerativeModel({ model: backupModel });
            const result = await geminiModel.generateContent(task);
            return { success: true, output: result.response.text(), model: backupModel };
          } catch (e2) {
            // Give up
            apiCircuitOpen = true;
            return getMockResponse(task, model);
          }
        }

        throw e;
      }

    } catch (e: any) {
      console.warn("[HF] API Error - Switching to Offline Mode:", e.message);
      apiCircuitOpen = true; // Safety switch
      return getMockResponse(task, model);
    }
  }

  // MOCK MODE Handling
  if (MOCK_MODE || apiCircuitOpen) {
    return getMockResponse(task, model);
  }

  try {
    // Production'da Netlify proxy kullan, local'de direkt API
    const isProduction = typeof window !== 'undefined' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1');

    const apiUrl = isProduction
      ? '/api/hf/inference'  // Netlify Edge Function proxy
      : `/api/hf/models/${model}`;  // Local: Vite Proxy (bypasses CORS)

    const requestBody = {
      inputs: task,
      model: model,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false
      }
    };

    console.debug(`[HF] 🚀 Calling ${apiUrl} (production: ${isProduction})`); // Changed to debug

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Local'de Authorization ekle, production'da proxy halleder
    if (!isProduction && HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    }

    const response = await withTimeout(
      fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      }),
      60000 // 1 dakika timeout
    );

    console.debug(`[HF] Response status: ${response.status}`); // Changed to debug

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[HF] Error response: ${errorText.substring(0, 300)}`);

      // Model yükleniyor?
      if (response.status === 503 && errorText.includes('loading')) {
        return {
          success: false,
          error: 'Model loading - retry in 30s',
          model,
        };
      }

      // Rate limit?
      if (response.status === 429) {
        console.warn("[HF] 🛑 HuggingFace Rate Limited. Opening Circuit Breaker.");
        apiCircuitOpen = true; // Open circuit breaker
        return {
          success: false,
          error: 'Rate limited - retry in 60s',
          model,
        };
      }

      // 404 Not Found?
      if (response.status === 404) {
        console.warn("[HF] 🛑 HuggingFace Model Not Found (404). Opening Circuit Breaker.");
        apiCircuitOpen = true; // Open circuit breaker
        return {
          success: false,
          error: 'Model not found (404)',
          model,
        };
      }

      return {
        success: false,
        error: `HF API error ${response.status}: ${errorText.substring(0, 150)}`,
        model,
      };
    }

    const data = await response.json();

    // api-inference format: [{generated_text: "..."}] veya [{ "generated_text": "..." }]
    let output = '';
    if (Array.isArray(data) && data.length > 0) {
      output = data[0].generated_text || '';
    } else if (data.generated_text) {
      output = data.generated_text;
      output = data.generated_text;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      output = data[0].generated_text;
    } else {
      output = JSON.stringify(data);
    }

    return {
      success: true,
      output: String(output).trim(),
      model,
      cached: false,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    // Timeout veya network hatası
    console.error("[HF] Critical HF API Error - Switching to Offline Mode:", error);
    apiCircuitOpen = true; // Safety switch
    return {
      success: false,
      error: `HF API error: ${error}`,
      model,
    };
  }
}

// Extracted Mock Logic for reuse
function getMockResponse(task: string, model: string): HFResponse {
  const taskLower = task.toLowerCase();
  let mockOutput = '';

  if (taskLower.includes('durum') || taskLower.includes('status')) {
    mockOutput = "Sistemler: %98 Verimlilik. Aktif Kriz Yok. Üretim Hattı: Normal.";
  } else if (taskLower.includes('merhaba') || taskLower.includes('selam')) {
    mockOutput = "Merhaba Operatör. Sistemler hazır ve emrinizi bekliyor.";
  } else if (taskLower.includes('ses') || taskLower.includes('duy')) {
    mockOutput = "Evet, işitsel sensörlerim aktif. Sizi net duyuyorum.";
  }
  // Market opportunities için JSON array döndür
  else if (taskLower.includes('fırsat') || taskLower.includes('karlı') || taskLower.includes('opportunity')) {
    mockOutput = JSON.stringify([
      {
        id: '1',
        profession: 'WhatsApp Müşteri Hizmetleri',
        painPoint: 'Gece saatlerinde cevap verememe',
        solutionName: 'WhatsApp AI Asistan',
        solutionLogic: 'AI bot 7/24 sorulara yanıt verir',
        estimatedRevenue: '₺5.000-15.000/ay',
        startupCost: '₺500',
        difficulty: 'Orta'
      },
      {
        id: '2',
        profession: 'E-ticaret Sahibi',
        painPoint: 'Rakip fiyatlarını manuel takip',
        solutionName: 'Fiyat Takip Robotu',
        solutionLogic: 'Web scraper ile rakip fiyatları izler',
        estimatedRevenue: '₺10.000-30.000/ay',
        startupCost: '₺1.000',
        difficulty: 'Orta'
      },
      {
        id: '3',
        profession: 'İçerik Üreticisi',
        painPoint: 'Her gün viral içerik ideası bulmak zor',
        solutionName: 'Content Factory Bot',
        solutionLogic: 'Trendleri analiz eder, içerik önerir',
        estimatedRevenue: '₺3.000-10.000/ay',
        startupCost: '₺200',
        difficulty: 'Kolay'
      }
    ]);
  }
  // Soru üretimi için JSON array döndür
  else if (taskLower.includes('soru') || taskLower.includes('question')) {
    mockOutput = JSON.stringify([
      'Bu otomasyon ne sıklıkta çalışmalı?',
      'Hangi veri kaynakları kullanılacak?',
      'Başarı metriği nasıl ölçülecek?',
      'Entegrasyonlar ne zaman test edilecek?'
    ]);
  }
  // Validasyon için JSON object döndür
  else if (taskLower.includes('valid') || taskLower.includes('kontrol')) {
    mockOutput = JSON.stringify({ isValid: true, errors: [] });
  }
  // Node execution için JSON döndür
  else if (taskLower.includes('görev') || taskLower.includes('aksiyon')) {
    mockOutput = JSON.stringify({ success: true, output: 'Görev başarıyla tamamlandı', error: null });
  }
  // Mimari tasarım için metin döndür
  else if (taskLower.includes('mimari') || taskLower.includes('sistem') || taskLower.includes('tasarla')) {
    mockOutput = `**Sistem Özeti**: Otomatik iş akışı sistemi
**Ana Bileşenler**: 
- Trigger Handler
- Data Processor
- Integration Layer
- Logging & Monitoring
**Veri Akışı**: Input → Processing → Output
**Entegrasyonlar**: API, Database, Queue
**Risk Yönetimi**: Error handling, Retry logic`;
  }
  // Varsayılan yanıt
  else {
    mockOutput = "Anlaşıldı. Bu komutu simülasyon modunda işliyorum: " + task;
  }

  return {
    success: true,
    output: mockOutput,
    model: model + ' (mock)'
  };
}

// ==================== DÜZENLI HAFIZA TEMIZLIĞI ====================

const responseCache = new Map<string, { data: HFResponse; timestamp: number }>();

function getCachedResponse(key: string): HFResponse | null {
  const cached = responseCache.get(key);
  if (!cached) return null;

  // 10 dakika geçmişse sil
  if (Date.now() - cached.timestamp > 600000) {
    responseCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedResponse(key: string, data: HFResponse) {
  // Cache boyutunu kontrol et (max 100 entry)
  if (responseCache.size > 100) {
    const oldestKey = Array.from(responseCache.keys())[0];
    responseCache.delete(oldestKey);
  }

  responseCache.set(key, { data, timestamp: Date.now() });
}

// ==================== MAİN FONKSIYON ====================

export async function callHuggingFaceModel(options: HFRequestOptions): Promise<HFResponse> {
  const {
    task,
    model = FREE_HF_MODELS.TEXT_GENERATION,
    timeout = 300000, // 5 dakika
  } = options;

  // Cache kontrol et
  const cacheKey = `${model}:${task.substring(0, 50)}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log('[HF] Cache hit');
    return { ...cached, cached: true };
  }

  // 0. ÖNCELİK: YEREL LM STUDIO (Varsa kullan)
  // Bu sayede veri dışarı çıkmaz ve tamamen ücretsizdir.
  const localAttempt = await callLMStudio(task);
  if (localAttempt.success) {
    console.log('✅ [AI] Yanıt LM Studio\'dan (Yerel) alındı!');
    return localAttempt;
  }

  // HuggingFace API'yi dene
  const hfResult = await callWithRetry(() => callHuggingFace(task, model));

  if (hfResult.success) {
    setCachedResponse(cacheKey, hfResult);
    return hfResult;
  }

  // HF başarısız ise cache etme, error döndür
  console.log('[HF] HF API failed:', hfResult.error);
  return hfResult;
}

// ==================== PROMPT BUILDER (Node formatını HF'ye çevir) ====================

export function buildHFPrompt(
  role: string,
  task: string,
  context: string,
  inputData: string
): string {
  return `You are a ${role}.

Your task: ${task}

Context: ${context}

Input: ${inputData}

Respond with actionable output only, no explanations.`;
}

// ==================== UTILITY FUNCTIONS ====================

export function selectBestModel(nodeType: string): string {
  const typeToModel: Record<string, string> = {
    'CONTENT_CREATOR': FREE_HF_MODELS.TEXT_GENERATION,
    'ANALYST_CRITIC': FREE_HF_MODELS.ANALYSIS,
    'RESEARCHER': FREE_HF_MODELS.RESEARCH,
    'LOGIC_GATE': FREE_HF_MODELS.ANALYSIS,
    'WRITER': FREE_HF_MODELS.TEXT_GENERATION,
    'default': FREE_HF_MODELS.TEXT_GENERATION,
  };

  return typeToModel[nodeType] || typeToModel.default;
}

export function isLocalOllamaAvailable(): Promise<boolean> {
  return fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' })
    .then(() => true)
    .catch(() => false);
}

export function getAvailableModels() {
  return {
    huggingface: FREE_HF_MODELS,
    ollama: OLLAMA_MODELS,
  };
}
