// ============================================
// OVI AI VIDEO SERVICE
// Birleşik Video + Ses Üretim Servisi
// ComfyUI Local | fal.ai Cloud | Hugging Face
// ============================================

// ============================================
// TYPES & INTERFACES
// ============================================

export interface OviVideoOptions {
    prompt: string;
    speech?: string;           // <S>...</E> formatında konuşma
    audioDescription?: string; // Arka plan sesi açıklaması
    duration?: 5 | 10;         // Saniye
    aspectRatio?: '16:9' | '9:16' | '1:1';
    negativePrompt?: string;
    seed?: number;
    provider?: 'comfyui' | 'falai' | 'huggingface';
}

export interface OviImageToVideoOptions extends OviVideoOptions {
    imageUrl: string;
}

export interface OviResult {
    success: boolean;
    videoUrl?: string;
    videoBlob?: Blob;
    duration?: number;
    audioUrl?: string;
    error?: string;
    provider?: string;
}

// ============================================
// PROVIDER CONFIGURATIONS
// ============================================

const PROVIDERS = {
    COMFYUI: {
        name: 'ComfyUI Local',
        endpoint: 'http://localhost:8188',
        cost: 'Ücretsiz (Lokal GPU)',
        requirements: '12GB+ VRAM'
    },
    FALAI: {
        name: 'fal.ai Cloud',
        endpoint: 'https://fal.run/fal-ai/ovi-t2v',
        apiKey: (import.meta as any).env?.VITE_FALAI_API_KEY || '',
        cost: '$0.20/video'
    },
    HUGGINGFACE: {
        name: 'Hugging Face',
        endpoint: 'https://huggingface.co/spaces/akhaliq/Ovi',
        cost: 'Ücretsiz (Limitli)'
    }
};

// ============================================
// OVI PROMPT BUILDER
// ============================================

export function buildOviPrompt(options: OviVideoOptions): string {
    let prompt = options.prompt;

    // Konuşma ekle
    if (options.speech) {
        // Eğer <S>...</E> formatında değilse, ekle
        if (!options.speech.includes('<S>')) {
            prompt += `\n<S>${options.speech}<E>`;
        } else {
            prompt += `\n${options.speech}`;
        }
    }

    // Ses açıklaması ekle
    if (options.audioDescription) {
        prompt += `\nAudio: ${options.audioDescription}`;
    }

    return prompt;
}

// ============================================
// COMFYUI LOCAL PROVIDER
// ============================================

export async function generateVideoComfyUI(options: OviVideoOptions): Promise<OviResult> {
    const endpoint = PROVIDERS.COMFYUI.endpoint;

    try {
        // ComfyUI bağlantı kontrolü
        const healthCheck = await fetch(`${endpoint}/system_stats`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        }).catch(() => null);

        if (!healthCheck?.ok) {
            return {
                success: false,
                error: 'ComfyUI çalışmıyor. Lütfen ComfyUI\'yi başlatın veya fal.ai kullanın.',
                provider: 'comfyui'
            };
        }

        const prompt = buildOviPrompt(options);

        // OVI workflow yapısı
        const workflow = {
            "1": {
                "class_type": "OviEngineLoader",
                "inputs": {
                    "precision": "fp8",
                    "cpu_offload": true
                }
            },
            "2": {
                "class_type": "OviVideoGenerator",
                "inputs": {
                    "ovi_engine": ["1", 0],
                    "prompt": prompt,
                    "negative_prompt": options.negativePrompt || "blurry, low quality, distorted face, bad lip sync",
                    "resolution": options.aspectRatio === '9:16' ? '720x1280' :
                        options.aspectRatio === '1:1' ? '720x720' : '1280x720',
                    "seed": options.seed || Math.floor(Math.random() * 1000000),
                    "steps": 30
                }
            },
            "3": {
                "class_type": "SaveVideo",
                "inputs": {
                    "video": ["2", 0],
                    "filename_prefix": "ovi_output"
                }
            }
        };

        // Workflow'u gönder
        const response = await fetch(`${endpoint}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflow })
        });

        if (!response.ok) {
            throw new Error(`ComfyUI error: ${response.status}`);
        }

        const result = await response.json();
        const promptId = result.prompt_id;

        // Sonucu bekle (polling)
        let attempts = 0;
        const maxAttempts = 120; // 2 dakika max

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000));

            const historyRes = await fetch(`${endpoint}/history/${promptId}`);
            const history = await historyRes.json();

            if (history[promptId]?.outputs) {
                const outputs = history[promptId].outputs;
                // Video output'unu bul
                for (const nodeId in outputs) {
                    if (outputs[nodeId].videos) {
                        const videoFile = outputs[nodeId].videos[0];
                        return {
                            success: true,
                            videoUrl: `${endpoint}/view?filename=${videoFile.filename}&subfolder=${videoFile.subfolder}&type=${videoFile.type}`,
                            duration: options.duration || 5,
                            provider: 'comfyui'
                        };
                    }
                }
            }

            attempts++;
        }

        return {
            success: false,
            error: 'Video oluşturma zaman aşımına uğradı',
            provider: 'comfyui'
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'ComfyUI bağlantı hatası',
            provider: 'comfyui'
        };
    }
}

// ============================================
// FAL.AI CLOUD PROVIDER
// ============================================

export async function generateVideoFalAI(options: OviVideoOptions): Promise<OviResult> {
    const apiKey = PROVIDERS.FALAI.apiKey;

    if (!apiKey) {
        return {
            success: false,
            error: 'FAL_AI_API_KEY tanımlı değil. .env dosyasına ekleyin.',
            provider: 'falai'
        };
    }

    try {
        const prompt = buildOviPrompt(options);

        const response = await fetch('https://fal.run/fal-ai/ovi-t2v', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                negative_prompt: options.negativePrompt || "blurry, low quality, distorted",
                seed: options.seed,
                aspect_ratio: options.aspectRatio || '16:9'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `fal.ai error: ${response.status}`);
        }

        const result = await response.json();

        return {
            success: true,
            videoUrl: result.video?.url,
            audioUrl: result.audio?.url,
            duration: options.duration || 5,
            provider: 'falai'
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'fal.ai API hatası',
            provider: 'falai'
        };
    }
}

// ============================================
// HUGGING FACE PROVIDER (Ücretsiz)
// ============================================

export async function generateVideoHuggingFace(options: OviVideoOptions): Promise<OviResult> {
    try {
        const prompt = buildOviPrompt(options);

        // Hugging Face Inference API
        const response = await fetch(
            'https://router.huggingface.co/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${(import.meta as any).env?.VITE_HUGGINGFACE_API_KEY || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        seed: options.seed,
                        num_inference_steps: 30
                    }
                })
            }
        );

        if (!response.ok) {
            // Model henüz hazır değilse veya rate limit
            if (response.status === 503) {
                return {
                    success: false,
                    error: 'Model yükleniyor, lütfen 1-2 dakika bekleyin.',
                    provider: 'huggingface'
                };
            }
            throw new Error(`HuggingFace error: ${response.status}`);
        }

        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);

        return {
            success: true,
            videoUrl: videoUrl,
            videoBlob: blob,
            duration: options.duration || 5,
            provider: 'huggingface'
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'HuggingFace API hatası',
            provider: 'huggingface'
        };
    }
}

// ============================================
// IMAGE TO VIDEO (I2V)
// ============================================

export async function generateImageToVideo(options: OviImageToVideoOptions): Promise<OviResult> {
    const apiKey = PROVIDERS.FALAI.apiKey;

    if (!apiKey) {
        return {
            success: false,
            error: 'FAL_AI_API_KEY tanımlı değil',
            provider: 'falai'
        };
    }

    try {
        const prompt = buildOviPrompt(options);

        const response = await fetch('https://fal.run/fal-ai/ovi-i2v', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_url: options.imageUrl,
                prompt: prompt,
                negative_prompt: options.negativePrompt || "blurry, low quality",
                seed: options.seed
            })
        });

        if (!response.ok) {
            throw new Error(`fal.ai I2V error: ${response.status}`);
        }

        const result = await response.json();

        return {
            success: true,
            videoUrl: result.video?.url,
            audioUrl: result.audio?.url,
            duration: options.duration || 5,
            provider: 'falai'
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Image-to-Video hatası',
            provider: 'falai'
        };
    }
}

// ============================================
// ANA FONKSİYON - Otomatik Provider Seçimi
// ============================================

export async function generateVideo(options: OviVideoOptions): Promise<OviResult> {
    const provider = options.provider || 'comfyui';

    console.log(`[OVI] Video üretiliyor... Provider: ${provider}`);
    console.log(`[OVI] Prompt: ${options.prompt.substring(0, 100)}...`);

    switch (provider) {
        case 'comfyui':
            // Önce ComfyUI dene, başarısız olursa fal.ai'ye geç
            const comfyResult = await generateVideoComfyUI(options);
            if (comfyResult.success) return comfyResult;

            console.log('[OVI] ComfyUI başarısız, fal.ai deneniyor...');
            return await generateVideoFalAI(options);

        case 'falai':
            return await generateVideoFalAI(options);

        case 'huggingface':
            return await generateVideoHuggingFace(options);

        default:
            return await generateVideoComfyUI(options);
    }
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

// Video indir
export function downloadVideo(videoUrl: string, filename: string = 'ovi_video.mp4'): void {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ComfyUI durumunu kontrol et
export async function checkComfyUIStatus(): Promise<{ running: boolean; message: string }> {
    try {
        const res = await fetch(`${PROVIDERS.COMFYUI.endpoint}/system_stats`, {
            signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
            const stats = await res.json();
            return {
                running: true,
                message: `ComfyUI çalışıyor. VRAM: ${stats.devices?.[0]?.vram_total || 'N/A'}`
            };
        }
        return { running: false, message: 'ComfyUI yanıt vermiyor' };
    } catch {
        return { running: false, message: 'ComfyUI bağlantısı yok' };
    }
}

// Provider listesi
export function getAvailableProviders(): typeof PROVIDERS {
    return PROVIDERS;
}

// Örnek prompt şablonları
export const OVI_PROMPT_TEMPLATES = {
    SPOKESPERSON: (name: string, message: string) =>
        `A professional ${name} speaking to camera in a modern office. The person speaks clearly and confidently.\n<S>${message}<E>\nAudio: soft background music, professional atmosphere`,

    PRODUCT_DEMO: (product: string, description: string) =>
        `Close-up product shot of ${product}. The product rotates slowly showing all angles.\n<S>${description}<E>\nAudio: upbeat electronic music, satisfying sound effects`,

    TUTORIAL: (topic: string, narration: string) =>
        `Tutorial video about ${topic}. Clean, modern graphics with smooth animations.\n<S>${narration}<E>\nAudio: calm background music, keyboard typing sounds`,

    REELS_HOOK: (hook: string) =>
        `Energetic young person looking at camera with excitement. Quick cuts, dynamic movement.\n<S>${hook}<E>\nAudio: trending upbeat music, whoosh sound effects`,

    TESTIMONIAL: (customerName: string, review: string) =>
        `${customerName} sitting comfortably at home, sharing their genuine experience.\n<S>${review}<E>\nAudio: warm ambient background, natural room tone`
};

// ============================================
// EXPORT
// ============================================

export default {
    generateVideo,
    generateVideoComfyUI,
    generateVideoFalAI,
    generateVideoHuggingFace,
    generateImageToVideo,
    downloadVideo,
    checkComfyUIStatus,
    getAvailableProviders,
    buildOviPrompt,
    OVI_PROMPT_TEMPLATES,
    PROVIDERS
};
