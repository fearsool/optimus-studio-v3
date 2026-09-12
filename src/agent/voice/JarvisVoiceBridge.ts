/**
 * 🎙️ JARVIS VOICE BRIDGE (TypeScript / Node.js)
 * ============================================
 * Optimus Studio ile Masaüstü Jarvis Sesli Asistanı (v5.6) arasında
 * iki yönlü ses, komut ve durum senkronizasyonunu sağlar.
 */

export interface JarvisState {
    status: string;
    last_transcript: string;
    last_reply: string;
    persona: string;
    version: string;
    cpu?: number;
    ram?: number;
    running_tools?: string[];
}

export class JarvisVoiceBridge {
    private jarvisBaseUrl: string;

    constructor(baseUrl: string = "http://127.0.0.1:8765") {
        this.jarvisBaseUrl = baseUrl;
    }

    /**
     * Jarvis seslendirme motoruna metin gönderir (Edge-TTS ile hoparlörden okutur).
     */
    async speak(text: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.jarvisBaseUrl}/api/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            return !!data.ok;
        } catch (error) {
            console.warn(`[JarvisVoiceBridge] Seslendirme isteği gönderilemedi (${this.jarvisBaseUrl}):`, error);
            return false;
        }
    }

    /**
     * O an çalan Jarvis konuşmasını anında keser (Mute/Interrupt).
     */
    async interrupt(): Promise<boolean> {
        try {
            const response = await fetch(`${this.jarvisBaseUrl}/api/mute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return !!data.ok;
        } catch (error) {
            console.warn('[JarvisVoiceBridge] Susturma isteği başarısız:', error);
            return false;
        }
    }

    /**
     * Jarvis'in canlı durumunu, Arc-Reactor HUD verilerini ve aktif araçlarını okur.
     */
    async getStatus(): Promise<JarvisState | null> {
        try {
            const response = await fetch(`${this.jarvisBaseUrl}/api/state`);
            if (response.ok) {
                return (await response.json()) as JarvisState;
            }
        } catch (error) {
            // Jarvis henüz açık değilse sessizce null döner
        }
        return null;
    }

    /**
     * Jarvis'e uzaktan komut gönderir.
     */
    async sendCommand(commandText: string, token: string = ""): Promise<string | null> {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['X-Jarvis-Token'] = token;

            const response = await fetch(`${this.jarvisBaseUrl}/api/command`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text: commandText })
            });
            const data = await response.json();
            return data.reply || data.error || null;
        } catch (error) {
            console.error('[JarvisVoiceBridge] Komut gönderme hatası:', error);
            return null;
        }
    }
}

export const jarvisVoiceBridge = new JarvisVoiceBridge();
