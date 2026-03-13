"use strict";
// ============================================
// TEXT-TO-SPEECH (TTS) SERVICE
// Seslendirme servisi - Türkçe destekli
// ============================================
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateDuration = exports.splitTextToSentences = exports.downloadAudio = exports.generateSpeech = exports.generateSpeechGoogle = exports.generateSpeechElevenLabs = exports.generateSpeechBrowser = exports.generateSpeechEdge = exports.TURKISH_VOICES = void 0;
// Ücretsiz TTS Servisleri
const TTS_PROVIDERS = {
    // Google Cloud TTS (1M karakter/ay ücretsiz)
    GOOGLE: 'google',
    // ElevenLabs (10.000 karakter/ay ücretsiz)
    ELEVENLABS: 'elevenlabs',
    // Edge TTS (Tamamen ücretsiz - Microsoft)
    EDGE: 'edge'
};
// Türkçe sesler
exports.TURKISH_VOICES = {
    FEMALE: {
        name: 'Emel',
        id: 'tr-TR-EmelNeural',
        gender: 'female',
        style: 'friendly'
    },
    MALE: {
        name: 'Ahmet',
        id: 'tr-TR-AhmetNeural',
        gender: 'male',
        style: 'professional'
    }
};
// ============================================
// EDGE TTS (Ücretsiz - Önerilen)
// Microsoft Edge tarayıcısının TTS motorunu kullanır
// ============================================
const generateSpeechEdge = async (options) => {
    const { text, voice = exports.TURKISH_VOICES.FEMALE.id, speed = 1.0 } = options;
    console.log(`[TTS] Seslendirme başlatılıyor: "${text.substring(0, 50)}..."`);
    // Edge TTS API (ücretsiz)
    const endpoint = 'https://api.allorigins.win/raw?url=' +
        encodeURIComponent(`https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`);
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`TTS API hatası: ${response.status}`);
        }
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('[TTS] Seslendirme başarılı! ✓');
        return {
            success: true,
            audioUrl,
            audioBlob
        };
    }
    catch (error) {
        console.error('[TTS] Hata:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
exports.generateSpeechEdge = generateSpeechEdge;
// ============================================
// WEB SPEECH API (Tarayıcı yerleşik - En kolay)
// ============================================
const generateSpeechBrowser = (options) => {
    return new Promise((resolve) => {
        const { text, speed = 1.0, pitch = 1.0 } = options;
        if (!('speechSynthesis' in window)) {
            resolve({ success: false, error: 'Tarayıcı TTS desteklemiyor' });
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = speed;
        utterance.pitch = pitch;
        // Türkçe ses bul
        const voices = speechSynthesis.getVoices();
        const turkishVoice = voices.find(v => v.lang.startsWith('tr'));
        if (turkishVoice) {
            utterance.voice = turkishVoice;
        }
        utterance.onend = () => {
            resolve({ success: true });
        };
        utterance.onerror = (event) => {
            resolve({ success: false, error: event.error });
        };
        speechSynthesis.speak(utterance);
    });
};
exports.generateSpeechBrowser = generateSpeechBrowser;
// ============================================
// ELEVENLABS API (Premium kalite)
// ============================================
const ELEVENLABS_API_KEY = ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_ELEVENLABS_API_KEY) || '';
const generateSpeechElevenLabs = async (options) => {
    const { text, voice = 'EXAVITQu4vr4xnSDxMaL' } = options; // Default: Sarah
    if (!ELEVENLABS_API_KEY) {
        return { success: false, error: 'ElevenLabs API key bulunamadı' };
    }
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs API hatası: ${response.status}`);
        }
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        return { success: true, audioUrl, audioBlob };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.generateSpeechElevenLabs = generateSpeechElevenLabs;
// ============================================
// GOOGLE CLOUD TTS
// ============================================
const GOOGLE_TTS_API_KEY = ((_b = import.meta.env) === null || _b === void 0 ? void 0 : _b.VITE_GOOGLE_TTS_API_KEY) || '';
const generateSpeechGoogle = async (options) => {
    const { text, voice = 'tr-TR-Standard-A', speed = 1.0, pitch = 0 } = options;
    if (!GOOGLE_TTS_API_KEY) {
        return { success: false, error: 'Google TTS API key bulunamadı' };
    }
    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text },
                voice: {
                    languageCode: 'tr-TR',
                    name: voice
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: speed,
                    pitch
                }
            })
        });
        if (!response.ok) {
            throw new Error(`Google TTS API hatası: ${response.status}`);
        }
        const data = await response.json();
        const audioContent = data.audioContent;
        // Base64 to Blob
        const binaryString = atob(audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        return { success: true, audioUrl, audioBlob };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.generateSpeechGoogle = generateSpeechGoogle;
// ============================================
// ANA FONKSİYON - Otomatik provider seçimi
// ============================================
const generateSpeech = async (options) => {
    const provider = options.provider || 'browser';
    switch (provider) {
        case 'elevenlabs':
            return (0, exports.generateSpeechElevenLabs)(options);
        case 'google':
            return (0, exports.generateSpeechGoogle)(options);
        case 'edge':
            return (0, exports.generateSpeechEdge)(options);
        case 'browser':
        default:
            return (0, exports.generateSpeechBrowser)(options);
    }
};
exports.generateSpeech = generateSpeech;
// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================
// Ses dosyasını indir
const downloadAudio = (audioUrl, filename = 'speech.mp3') => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
exports.downloadAudio = downloadAudio;
// Metni cümlelere böl (uzun metinler için)
const splitTextToSentences = (text) => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
};
exports.splitTextToSentences = splitTextToSentences;
// Tahmini süre hesapla (dakika)
const estimateDuration = (text) => {
    const words = text.split(/\s+/).length;
    const wordsPerMinute = 150; // Ortalama konuşma hızı
    return words / wordsPerMinute;
};
exports.estimateDuration = estimateDuration;
exports.default = {
    generateSpeech: exports.generateSpeech,
    generateSpeechBrowser: exports.generateSpeechBrowser,
    generateSpeechEdge: exports.generateSpeechEdge,
    generateSpeechElevenLabs: exports.generateSpeechElevenLabs,
    generateSpeechGoogle: exports.generateSpeechGoogle,
    downloadAudio: exports.downloadAudio,
    splitTextToSentences: exports.splitTextToSentences,
    estimateDuration: exports.estimateDuration,
    TURKISH_VOICES: exports.TURKISH_VOICES,
    TTS_PROVIDERS
};
