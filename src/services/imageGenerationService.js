"use strict";
// ============================================
// HUGGING FACE IMAGE GENERATION SERVICE
// Stable Diffusion ile görsel üretimi
// ============================================
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.blobToBase64 = exports.downloadImage = exports.generateProductMockup = exports.generateYouTubeThumbnail = exports.generateMotivationalPoster = exports.generateInstagramStory = exports.generateInstagramPost = exports.generateLogo = exports.generateImage = exports.HF_MODELS = void 0;
const HF_TOKEN = ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_HUGGINGFACE_TOKEN) || '';
const HF_API_URL = 'https://router.huggingface.co/models';
// Available models for different purposes
exports.HF_MODELS = {
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
// Generate image using Hugging Face
const generateImage = async (options) => {
    const { prompt, negativePrompt = 'blurry, bad quality, distorted, ugly, deformed', model = exports.HF_MODELS.STABLE_DIFFUSION_XL, width = 1024, height = 1024, numInferenceSteps = 30, guidanceScale = 7.5 } = options;
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
    }
    catch (error) {
        console.error('[HuggingFace] Bağlantı hatası:', error);
        return { success: false, error: error.message };
    }
};
exports.generateImage = generateImage;
// Generate logo variations
const generateLogo = async (brandName, style = 'modern minimalist') => {
    const prompts = [
        `Professional logo design for "${brandName}", ${style}, clean lines, vector art style, white background, high quality`,
        `Icon logo for "${brandName}", ${style}, simple geometric shapes, brand identity, isolated on white`,
        `Wordmark logo "${brandName}", ${style}, elegant typography, professional business logo`
    ];
    const results = [];
    for (const prompt of prompts) {
        const result = await (0, exports.generateImage)({
            prompt,
            model: exports.HF_MODELS.LOGO_DIFFUSION,
            width: 512,
            height: 512
        });
        results.push(result);
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return results;
};
exports.generateLogo = generateLogo;
// Generate Instagram post image
const generateInstagramPost = async (topic, style = 'professional photography') => {
    const prompt = `Instagram post, ${topic}, ${style}, high quality, social media ready, 
    vibrant colors, eye-catching, professional, trending on instagram, 4k quality`;
    return (0, exports.generateImage)({
        prompt,
        model: exports.HF_MODELS.REALISTIC_VISION,
        width: 1080,
        height: 1080
    });
};
exports.generateInstagramPost = generateInstagramPost;
// Generate Instagram story image
const generateInstagramStory = async (topic, style = 'modern aesthetic') => {
    const prompt = `Instagram story, ${topic}, ${style}, vertical format, 
    engaging visual, trendy design, high quality, social media content`;
    return (0, exports.generateImage)({
        prompt,
        model: exports.HF_MODELS.DREAMSHAPER,
        width: 1080,
        height: 1920
    });
};
exports.generateInstagramStory = generateInstagramStory;
// Generate motivational poster
const generateMotivationalPoster = async (quote) => {
    const prompt = `Motivational poster design with space for text, inspirational background, 
    aesthetic gradient colors, modern minimalist style, high quality print ready, 
    abstract artistic background for quote "${quote.substring(0, 30)}"`;
    return (0, exports.generateImage)({
        prompt,
        model: exports.HF_MODELS.DREAMSHAPER,
        width: 1080,
        height: 1350
    });
};
exports.generateMotivationalPoster = generateMotivationalPoster;
// Generate YouTube thumbnail
const generateYouTubeThumbnail = async (topic) => {
    const prompt = `YouTube thumbnail, ${topic}, eye-catching, vibrant colors, 
    dramatic lighting, clickbait style, attention grabbing, high contrast, 
    professional quality, trending youtube style`;
    return (0, exports.generateImage)({
        prompt,
        model: exports.HF_MODELS.REALISTIC_VISION,
        width: 1280,
        height: 720
    });
};
exports.generateYouTubeThumbnail = generateYouTubeThumbnail;
// Generate product mockup
const generateProductMockup = async (productType, style) => {
    const prompt = `Product mockup, ${productType}, ${style}, professional product photography, 
    clean background, studio lighting, e-commerce ready, high quality render`;
    return (0, exports.generateImage)({
        prompt,
        model: exports.HF_MODELS.REALISTIC_VISION,
        width: 1024,
        height: 1024
    });
};
exports.generateProductMockup = generateProductMockup;
// Download image as file
const downloadImage = (imageUrl, filename = 'generated-image.png') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
exports.downloadImage = downloadImage;
// Convert blob to base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
exports.blobToBase64 = blobToBase64;
exports.default = {
    generateImage: exports.generateImage,
    generateLogo: exports.generateLogo,
    generateInstagramPost: exports.generateInstagramPost,
    generateInstagramStory: exports.generateInstagramStory,
    generateMotivationalPoster: exports.generateMotivationalPoster,
    generateYouTubeThumbnail: exports.generateYouTubeThumbnail,
    generateProductMockup: exports.generateProductMockup,
    downloadImage: exports.downloadImage,
    blobToBase64: exports.blobToBase64,
    HF_MODELS: exports.HF_MODELS
};
