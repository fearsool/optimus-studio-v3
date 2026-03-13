// ============================================
// TEXT-TO-SPEECH (TTS) SERVICE
// Seslendirme servisi - Türkçe destekli
// ============================================

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
export const TURKISH_VOICES = {
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

export interface TTSOptions {
    text: string;
    voice?: string;
    language?: string;
    speed?: number; // 0.5 - 2.0
    pitch?: number; // -20 to +20
    provider?: string;
}

export interface TTSResult {
    success: boolean;
    audioUrl?: string;
    audioBlob?: Blob;
    duration?: number;
    error?: string;
}

// ============================================
// EDGE TTS (Ücretsiz - Önerilen)
// Microsoft Edge tarayıcısının TTS motorunu kullanır
// ============================================

export const generateSpeechEdge = async (options: TTSOptions): Promise<TTSResult> => {
    const {
        text,
        voice = TURKISH_VOICES.FEMALE.id,
        speed = 1.0
    } = options;

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

    } catch (error: any) {
        console.error('[TTS] Hata:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ============================================
// WEB SPEECH API (Tarayıcı yerleşik - En kolay)
// ============================================

export const generateSpeechBrowser = (options: TTSOptions): Promise<TTSResult> => {
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

// ============================================
// ELEVENLABS API (Premium kalite)
// ============================================

const ELEVENLABS_API_KEY = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY || '';

export const generateSpeechElevenLabs = async (options: TTSOptions): Promise<TTSResult> => {
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

    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// ============================================
// GOOGLE CLOUD TTS
// ============================================

const GOOGLE_TTS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY || '';

export const generateSpeechGoogle = async (options: TTSOptions): Promise<TTSResult> => {
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

    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// ============================================
// ANA FONKSİYON - Otomatik provider seçimi
// ============================================

export const generateSpeech = async (options: TTSOptions): Promise<TTSResult> => {
    const provider = options.provider || 'browser';

    switch (provider) {
        case 'elevenlabs':
            return generateSpeechElevenLabs(options);
        case 'google':
            return generateSpeechGoogle(options);
        case 'edge':
            return generateSpeechEdge(options);
        case 'browser':
        default:
            return generateSpeechBrowser(options);
    }
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

// Ses dosyasını indir
export const downloadAudio = (audioUrl: string, filename: string = 'speech.mp3'): void => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Metni cümlelere böl (uzun metinler için)
export const splitTextToSentences = (text: string): string[] => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
};

// Tahmini süre hesapla (dakika)
export const estimateDuration = (text: string): number => {
    const words = text.split(/\s+/).length;
    const wordsPerMinute = 150; // Ortalama konuşma hızı
    return words / wordsPerMinute;
};

export default {
    generateSpeech,
    generateSpeechBrowser,
    generateSpeechEdge,
    generateSpeechElevenLabs,
    generateSpeechGoogle,
    downloadAudio,
    splitTextToSentences,
    estimateDuration,
    TURKISH_VOICES,
    TTS_PROVIDERS
};
