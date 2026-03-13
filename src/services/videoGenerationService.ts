/**
 * AI Video Generation Service
 * Senaryo → Görseller → Video pipeline'ı
 */

export interface VideoScene {
    sceneNumber: number;
    description: string;
    duration: number; // saniye
    voiceoverText?: string;
    imageUrl?: string;
}

export interface VideoGenerationParams {
    topic: string;
    style: 'talking-head' | 'slideshow' | 'animated' | 'product-demo';
    duration?: number; // toplam süre (saniye)
    language?: 'tr' | 'en';
    numScenes?: number;
}

export interface VideoGenerationResult {
    success: boolean;
    script?: string;
    scenes?: VideoScene[];
    videoUrl?: string;
    error?: string;
}

// Senaryo üretimi (Groq API kullanır)
export async function generateVideoScript(
    topic: string,
    style: string,
    numScenes: number = 5,
    language: string = 'tr'
): Promise<{ scenes: VideoScene[]; fullScript: string }> {
    const prompt = language === 'tr'
        ? `${topic} hakkında ${numScenes} sahneli bir video senaryosu yaz.
        
Her sahne için şu formatı kullan:
SAHNE 1:
Görsel: [görsel açıklaması]
Seslendirme: [seslendirme metni]
Süre: [X saniye]

Sahne açıklamaları kısa ve görselleştirilebilir olmalı.
Seslendirme metni doğal ve akıcı olmalı.
Stil: ${style}`
        : `Write a ${numScenes} scene video script about ${topic}.
        
For each scene use this format:
SCENE 1:
Visual: [visual description]
Voiceover: [voiceover text]
Duration: [X seconds]

Scene descriptions should be short and visualizable.
Voiceover should be natural and flowing.
Style: ${style}`;

    // Bu fonksiyon run-automation endpoint'ini kullanacak
    return {
        scenes: [],
        fullScript: prompt // Placeholder - gerçek implementasyon endpoint'te
    };
}

// Sahneler için görsel üretimi
export async function generateSceneImages(
    scenes: VideoScene[],
    imageApiKey: string,
    provider: 'fal' | 'stability' = 'fal'
): Promise<VideoScene[]> {
    const updatedScenes: VideoScene[] = [];

    for (const scene of scenes) {
        try {
            let imageUrl: string | undefined;

            if (provider === 'fal') {
                const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Key ${imageApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: scene.description + ', cinematic, high quality, professional video still',
                        image_size: 'landscape_16_9',
                        num_inference_steps: 4
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    imageUrl = data.images?.[0]?.url;
                }
            }

            updatedScenes.push({
                ...scene,
                imageUrl
            });

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Scene ${scene.sceneNumber} image generation failed:`, error);
            updatedScenes.push(scene);
        }
    }

    return updatedScenes;
}

// Görselleri videoya birleştir (FFmpeg veya Remotion benzeri servis)
export async function combineToVideo(
    scenes: VideoScene[],
    outputOptions: {
        format?: 'mp4' | 'webm';
        resolution?: '720p' | '1080p';
        withAudio?: boolean;
    } = {}
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
    // Bu fonksiyon için harici bir video rendering servisi gerekli
    // Örneğin: Remotion, Creatomate, Shotstack, veya benzeri

    // Şimdilik placeholder - gerçek implementasyon için API key gerekli
    return {
        success: false,
        error: 'Video rendering service not configured. Add SHOTSTACK_API_KEY or similar.'
    };
}

// Tam video üretim pipeline'ı
export async function generateFullVideo(
    params: VideoGenerationParams,
    apiKeys: {
        groq?: string;
        fal?: string;
        shotstack?: string;
    }
): Promise<VideoGenerationResult> {
    try {
        // Step 1: Senaryo üret
        console.log('📝 Senaryo üretiliyor...');
        const { scenes: scriptScenes, fullScript } = await generateVideoScript(
            params.topic,
            params.style,
            params.numScenes || 5,
            params.language || 'tr'
        );

        // Step 2: Her sahne için görsel üret
        if (apiKeys.fal && scriptScenes.length > 0) {
            console.log('🎨 Görseller üretiliyor...');
            const scenesWithImages = await generateSceneImages(scriptScenes, apiKeys.fal);

            // Step 3: Videoyu birleştir
            if (apiKeys.shotstack) {
                console.log('🎬 Video birleştiriliyor...');
                const videoResult = await combineToVideo(scenesWithImages);

                if (videoResult.success) {
                    return {
                        success: true,
                        script: fullScript,
                        scenes: scenesWithImages,
                        videoUrl: videoResult.videoUrl
                    };
                }
            }

            // Video birleştirme yoksa en azından senaryo + görselleri döndür
            return {
                success: true,
                script: fullScript,
                scenes: scenesWithImages
            };
        }

        // Sadece senaryo döndür (görsel API yoksa)
        return {
            success: true,
            script: fullScript,
            scenes: scriptScenes
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Video generation failed'
        };
    }
}

// Shotstack API ile video birleştirme
export async function renderVideoWithShotstack(
    scenes: VideoScene[],
    apiKey: string
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
    try {
        const clips = scenes.map((scene, index) => ({
            asset: {
                type: 'image',
                src: scene.imageUrl
            },
            start: scenes.slice(0, index).reduce((sum, s) => sum + s.duration, 0),
            length: scene.duration,
            effect: 'zoomIn'
        }));

        const response = await fetch('https://api.shotstack.io/v1/render', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                timeline: {
                    tracks: [{ clips }]
                },
                output: {
                    format: 'mp4',
                    resolution: 'hd'
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, error: `Shotstack error: ${error}` };
        }

        const data = await response.json();
        return { success: true, videoUrl: data.response?.url };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Shotstack rendering failed'
        };
    }
}

export default {
    generateVideoScript,
    generateSceneImages,
    combineToVideo,
    generateFullVideo,
    renderVideoWithShotstack
};
