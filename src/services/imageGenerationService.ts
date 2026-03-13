// ============================================
// HUGGING FACE IMAGE GENERATION SERVICE
// Stable Diffusion ile görsel üretimi
// ============================================

const HF_TOKEN = (import.meta as any).env?.VITE_HUGGINGFACE_TOKEN || '';
const HF_API_URL = 'https://router.huggingface.co/models';

// Available models for different purposes
export const HF_MODELS = {
    // General purpose
    STABLE_DIFFUSION_XL: 'stabilityai/stable-diffusion-xl-base-1.0',
    STABLE_DIFFUSION_2: 'stabilityai/stable-diffusion-2-1',

    // Fast generation
    SDXL_TURBO: 'stabilityai/sdxl-turbo',

    // Realistic photos
    REALISTIC_VISION: 'SG161222/Realistic_Vision_V5.1_noVAE',

    // Artistic
    DREAMSHAPER: 'Lykon/dreamshaper-8',

    // Logo & Icons (openjourney-v4 is deprecated, using dreamshaper)
    LOGO_DIFFUSION: 'Lykon/dreamshaper-8',

    // Anime style
    ANIME: 'Linaqruf/animagine-xl-3.0'
};

export interface ImageGenerationOptions {
    prompt: string;
    negativePrompt?: string;
    model?: string;
    width?: number;
    height?: number;
    numInferenceSteps?: number;
    guidanceScale?: number;
}

export interface ImageResult {
    success: boolean;
    imageUrl?: string;
    imageBlob?: Blob;
    error?: string;
}

// Generate image using Hugging Face
export const generateImage = async (options: ImageGenerationOptions): Promise<ImageResult> => {
    const {
        prompt,
        negativePrompt = 'blurry, bad quality, distorted, ugly, deformed',
        model = HF_MODELS.STABLE_DIFFUSION_XL,
        width = 1024,
        height = 1024,
        numInferenceSteps = 30,
        guidanceScale = 7.5
    } = options;

    if (!HF_TOKEN) {
        console.error('[HuggingFace] Token bulunamadı');
        return { success: false, error: 'Hugging Face token bulunamadı. .env.local dosyasına VITE_HUGGINGFACE_TOKEN ekleyin.' };
    }

    console.log(`[HuggingFace] Görsel üretiliyor: "${prompt.substring(0, 50)}..."`);
    console.log(`[HuggingFace] Model: ${model}`);

    try {
        const response = await fetch(`${HF_API_URL}/${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    negative_prompt: negativePrompt,
                    width,
                    height,
                    num_inference_steps: numInferenceSteps,
                    guidance_scale: guidanceScale
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[HuggingFace] API Hatası:', errorText);

            // Model yükleniyor olabilir
            if (errorText.includes('loading')) {
                return {
                    success: false,
                    error: 'Model yükleniyor, lütfen 20-30 saniye bekleyip tekrar deneyin.'
                };
            }

            return { success: false, error: `API Hatası: ${response.status} - ${errorText}` };
        }

        // Response is image blob
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        console.log('[HuggingFace] Görsel başarıyla üretildi! ✓');

        return {
            success: true,
            imageUrl,
            imageBlob
        };

    } catch (error: any) {
        console.error('[HuggingFace] Bağlantı hatası:', error);
        return { success: false, error: error.message };
    }
};

// Generate logo variations
export const generateLogo = async (brandName: string, style: string = 'modern minimalist'): Promise<ImageResult[]> => {
    const prompts = [
        `Professional logo design for "${brandName}", ${style}, clean lines, vector art style, white background, high quality`,
        `Icon logo for "${brandName}", ${style}, simple geometric shapes, brand identity, isolated on white`,
        `Wordmark logo "${brandName}", ${style}, elegant typography, professional business logo`
    ];

    const results: ImageResult[] = [];

    for (const prompt of prompts) {
        const result = await generateImage({
            prompt,
            model: HF_MODELS.LOGO_DIFFUSION,
            width: 512,
            height: 512
        });
        results.push(result);

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
};

// Generate Instagram post image
export const generateInstagramPost = async (
    topic: string,
    style: string = 'professional photography'
): Promise<ImageResult> => {
    const prompt = `Instagram post, ${topic}, ${style}, high quality, social media ready, 
    vibrant colors, eye-catching, professional, trending on instagram, 4k quality`;

    return generateImage({
        prompt,
        model: HF_MODELS.REALISTIC_VISION,
        width: 1080,
        height: 1080
    });
};

// Generate Instagram story image
export const generateInstagramStory = async (
    topic: string,
    style: string = 'modern aesthetic'
): Promise<ImageResult> => {
    const prompt = `Instagram story, ${topic}, ${style}, vertical format, 
    engaging visual, trendy design, high quality, social media content`;

    return generateImage({
        prompt,
        model: HF_MODELS.DREAMSHAPER,
        width: 1080,
        height: 1920
    });
};

// Generate motivational poster
export const generateMotivationalPoster = async (quote: string): Promise<ImageResult> => {
    const prompt = `Motivational poster design with space for text, inspirational background, 
    aesthetic gradient colors, modern minimalist style, high quality print ready, 
    abstract artistic background for quote "${quote.substring(0, 30)}"`;

    return generateImage({
        prompt,
        model: HF_MODELS.DREAMSHAPER,
        width: 1080,
        height: 1350
    });
};

// Generate YouTube thumbnail
export const generateYouTubeThumbnail = async (topic: string): Promise<ImageResult> => {
    const prompt = `YouTube thumbnail, ${topic}, eye-catching, vibrant colors, 
    dramatic lighting, clickbait style, attention grabbing, high contrast, 
    professional quality, trending youtube style`;

    return generateImage({
        prompt,
        model: HF_MODELS.REALISTIC_VISION,
        width: 1280,
        height: 720
    });
};

// Generate product mockup
export const generateProductMockup = async (productType: string, style: string): Promise<ImageResult> => {
    const prompt = `Product mockup, ${productType}, ${style}, professional product photography, 
    clean background, studio lighting, e-commerce ready, high quality render`;

    return generateImage({
        prompt,
        model: HF_MODELS.REALISTIC_VISION,
        width: 1024,
        height: 1024
    });
};

// Download image as file
export const downloadImage = (imageUrl: string, filename: string = 'generated-image.png'): void => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export default {
    generateImage,
    generateLogo,
    generateInstagramPost,
    generateInstagramStory,
    generateMotivationalPoster,
    generateYouTubeThumbnail,
    generateProductMockup,
    downloadImage,
    blobToBase64,
    HF_MODELS
};
