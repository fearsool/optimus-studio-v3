"use strict";
// ============================================
// VIDEO EDITING SERVICE
// Otomatik video montaj ve düzenleme
// ============================================
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIDEO_PRESETS = exports.downloadVideo = exports.createSimpleVideo = exports.createCreatomateVideo = exports.createShotstackVideo = exports.BrowserVideoEditor = exports.VIDEO_TEMPLATES = void 0;
// ============================================
// VIDEO TEMPLATES (Sosyal Medya Boyutları)
// ============================================
exports.VIDEO_TEMPLATES = {
    INSTAGRAM_POST: { width: 1080, height: 1080, fps: 30, name: 'Instagram Post' },
    INSTAGRAM_STORY: { width: 1080, height: 1920, fps: 30, name: 'Instagram Story' },
    INSTAGRAM_REEL: { width: 1080, height: 1920, fps: 30, name: 'Instagram Reel' },
    TIKTOK: { width: 1080, height: 1920, fps: 30, name: 'TikTok' },
    YOUTUBE: { width: 1920, height: 1080, fps: 30, name: 'YouTube' },
    YOUTUBE_SHORTS: { width: 1080, height: 1920, fps: 30, name: 'YouTube Shorts' },
    FACEBOOK: { width: 1280, height: 720, fps: 30, name: 'Facebook' },
    TWITTER: { width: 1280, height: 720, fps: 30, name: 'Twitter/X' }
};
// ============================================
// CANVAS-BASED VIDEO CREATION (Browser)
// Tarayıcıda basit video oluşturma
// ============================================
class BrowserVideoEditor {
    constructor(project) {
        this.frames = [];
        this.project = project;
        this.canvas = document.createElement('canvas');
        this.canvas.width = project.width;
        this.canvas.height = project.height;
        this.ctx = this.canvas.getContext('2d');
    }
    // Arka plan rengi ayarla
    setBackground(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // Görsel ekle
    async addImage(imageUrl, x = 0, y = 0, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const w = width || this.canvas.width;
                const h = height || this.canvas.height;
                this.ctx.drawImage(img, x, y, w, h);
                resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
        });
    }
    // Metin ekle
    addText(text, style) {
        this.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
        this.ctx.fillStyle = style.color;
        this.ctx.textAlign = 'center';
        let y;
        switch (style.position) {
            case 'top':
                y = style.fontSize + 50;
                break;
            case 'bottom':
                y = this.canvas.height - 50;
                break;
            default:
                y = this.canvas.height / 2;
        }
        // Arka plan kutusu
        if (style.backgroundColor) {
            const textWidth = this.ctx.measureText(text).width;
            this.ctx.fillStyle = style.backgroundColor;
            this.ctx.fillRect(this.canvas.width / 2 - textWidth / 2 - 20, y - style.fontSize, textWidth + 40, style.fontSize + 20);
            this.ctx.fillStyle = style.color;
        }
        // Çok satırlı metin
        const lines = text.split('\n');
        lines.forEach((line, index) => {
            this.ctx.fillText(line, this.canvas.width / 2, y + index * (style.fontSize + 10));
        });
    }
    // Frame yakala
    captureFrame() {
        this.canvas.toBlob((blob) => {
            if (blob)
                this.frames.push(blob);
        }, 'image/png');
    }
    // Frame'leri sıfırla
    clearFrames() {
        this.frames = [];
    }
    // Basit slideshow video oluştur (GIF benzeri)
    async createSlideshow(images, durationPerSlide = 3) {
        try {
            const totalFrames = images.length * durationPerSlide * this.project.fps;
            for (let i = 0; i < images.length; i++) {
                this.setBackground('#000000');
                await this.addImage(images[i]);
                // Her slide için frame'ler
                for (let f = 0; f < durationPerSlide * this.project.fps; f++) {
                    this.captureFrame();
                }
            }
            // Canvas recording ile video oluştur
            return await this.exportAsVideo();
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    // Video olarak dışa aktar
    async exportAsVideo() {
        return new Promise((resolve) => {
            const stream = this.canvas.captureStream(this.project.fps);
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                resolve({ success: true, videoUrl: url, videoBlob: blob });
            };
            recorder.start();
            setTimeout(() => recorder.stop(), 5000); // 5 saniye kayıt
        });
    }
    // Statik görsel olarak dışa aktar
    exportAsImage() {
        return this.canvas.toDataURL('image/png');
    }
}
exports.BrowserVideoEditor = BrowserVideoEditor;
// ============================================
// SHOTSTACK API (Profesyonel Video Üretimi)
// https://shotstack.io - 25 video/ay ücretsiz
// ============================================
const SHOTSTACK_API_KEY = ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_SHOTSTACK_API_KEY) || '';
const SHOTSTACK_API_URL = 'https://api.shotstack.io/stage';
const createShotstackVideo = async (clips, options = {}) => {
    var _a, _b, _c;
    if (!SHOTSTACK_API_KEY) {
        return { success: false, error: 'Shotstack API key bulunamadı' };
    }
    const timeline = {
        tracks: [{ clips }],
        soundtrack: options.soundtrack ? { src: options.soundtrack, effect: 'fadeInFadeOut' } : undefined
    };
    const output = {
        format: options.format || 'mp4',
        resolution: 'hd',
        fps: options.fps || 30
    };
    try {
        // Render isteği gönder
        const renderResponse = await fetch(`${SHOTSTACK_API_URL}/render`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': SHOTSTACK_API_KEY
            },
            body: JSON.stringify({ timeline, output })
        });
        const renderData = await renderResponse.json();
        const renderId = (_a = renderData.response) === null || _a === void 0 ? void 0 : _a.id;
        if (!renderId) {
            return { success: false, error: 'Render başlatılamadı' };
        }
        // Render durumunu kontrol et (polling)
        let status = 'queued';
        let videoUrl = '';
        let attempts = 0;
        const maxAttempts = 60; // 5 dakika max
        while (status !== 'done' && status !== 'failed' && attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000)); // 5 saniye bekle
            const statusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${renderId}`, {
                headers: { 'x-api-key': SHOTSTACK_API_KEY }
            });
            const statusData = await statusResponse.json();
            status = (_b = statusData.response) === null || _b === void 0 ? void 0 : _b.status;
            videoUrl = ((_c = statusData.response) === null || _c === void 0 ? void 0 : _c.url) || '';
            attempts++;
        }
        if (status === 'done' && videoUrl) {
            return { success: true, videoUrl };
        }
        else {
            return { success: false, error: `Render başarısız: ${status}` };
        }
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.createShotstackVideo = createShotstackVideo;
// ============================================
// CREATOMATE API (Alternatif)
// https://creatomate.com - 5 video/ay ücretsiz
// ============================================
const CREATOMATE_API_KEY = ((_b = import.meta.env) === null || _b === void 0 ? void 0 : _b.VITE_CREATOMATE_API_KEY) || '';
const createCreatomateVideo = async (templateId, modifications) => {
    var _a;
    if (!CREATOMATE_API_KEY) {
        return { success: false, error: 'Creatomate API key bulunamadı' };
    }
    try {
        const response = await fetch('https://api.creatomate.com/v1/renders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template_id: templateId,
                modifications
            })
        });
        const data = await response.json();
        if ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.url) {
            return { success: true, videoUrl: data[0].url };
        }
        else {
            return { success: false, error: 'Video oluşturulamadı' };
        }
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.createCreatomateVideo = createCreatomateVideo;
// ============================================
// BASIT VIDEO OLUŞTURMA (Tarayıcıda)
// Görseller + ses birleştirme
// ============================================
const createSimpleVideo = async (images, audioUrl, options = {}) => {
    const template = exports.VIDEO_TEMPLATES[options.template || 'INSTAGRAM_REEL'];
    const durationPerImage = options.durationPerImage || 3;
    const project = {
        id: crypto.randomUUID(),
        name: 'Generated Video',
        width: template.width,
        height: template.height,
        fps: template.fps,
        clips: [],
        createdAt: Date.now()
    };
    const editor = new BrowserVideoEditor(project);
    try {
        // Her görsel için slide oluştur
        for (let i = 0; i < images.length; i++) {
            editor.setBackground('#000000');
            await editor.addImage(images[i]);
            // Metin overlay ekle
            if (options.textOverlays && options.textOverlays[i]) {
                editor.addText(options.textOverlays[i].text, {
                    fontSize: 48,
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: options.textOverlays[i].position
                });
            }
        }
        return await editor.createSlideshow(images, durationPerImage);
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.createSimpleVideo = createSimpleVideo;
// ============================================
// VİDEO İNDİR
// ============================================
const downloadVideo = (videoUrl, filename = 'video.mp4') => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
exports.downloadVideo = downloadVideo;
// ============================================
// HAZIR VİDEO ŞABLONLARI
// ============================================
exports.VIDEO_PRESETS = {
    // Instagram Reels için motivasyon videosu
    MOTIVATION_REEL: {
        name: 'Motivasyon Reels',
        template: 'INSTAGRAM_REEL',
        structure: [
            { type: 'image', duration: 3, text: 'Quote 1' },
            { type: 'image', duration: 3, text: 'Quote 2' },
            { type: 'image', duration: 3, text: 'Quote 3' },
            { type: 'image', duration: 2, text: 'CTA' }
        ]
    },
    // Ürün tanıtım videosu
    PRODUCT_SHOWCASE: {
        name: 'Ürün Tanıtım',
        template: 'INSTAGRAM_POST',
        structure: [
            { type: 'image', duration: 2, text: 'Ürün Adı' },
            { type: 'image', duration: 3, text: 'Özellikler' },
            { type: 'image', duration: 2, text: 'Fiyat + CTA' }
        ]
    },
    // Before/After
    BEFORE_AFTER: {
        name: 'Önce/Sonra',
        template: 'INSTAGRAM_REEL',
        structure: [
            { type: 'image', duration: 3, text: 'ÖNCE' },
            { type: 'image', duration: 3, text: 'SONRA' },
            { type: 'image', duration: 2, text: 'Bilgi' }
        ]
    },
    // Tutorial/How-to
    TUTORIAL: {
        name: 'Tutorial',
        template: 'YOUTUBE_SHORTS',
        structure: [
            { type: 'image', duration: 2, text: 'Başlık' },
            { type: 'image', duration: 4, text: 'Adım 1' },
            { type: 'image', duration: 4, text: 'Adım 2' },
            { type: 'image', duration: 4, text: 'Adım 3' },
            { type: 'image', duration: 2, text: 'Sonuç' }
        ]
    }
};
exports.default = {
    BrowserVideoEditor,
    createShotstackVideo: exports.createShotstackVideo,
    createCreatomateVideo: exports.createCreatomateVideo,
    createSimpleVideo: exports.createSimpleVideo,
    downloadVideo: exports.downloadVideo,
    VIDEO_TEMPLATES: exports.VIDEO_TEMPLATES,
    VIDEO_PRESETS: exports.VIDEO_PRESETS
};
