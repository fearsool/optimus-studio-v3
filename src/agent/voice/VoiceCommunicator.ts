import { jarvisVoiceBridge } from './JarvisVoiceBridge';

export class VoiceCommunicator {
    public onSpeakingStateChange: ((isSpeaking: boolean) => void) | null = null;

    async speak(text: string, options?: any): Promise<void> {
        console.log(`[Voice] Speaking: ${text}`);
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);

        // Masaüstü Jarvis Asistanı üzerinden seslendir (Edge-TTS + Hoparlör)
        const sentToJarvis = await jarvisVoiceBridge.speak(text);
        
        if (!sentToJarvis) {
            // İkincil Simülasyon / Fallback
            await new Promise(resolve => setTimeout(resolve, Math.min(text.length * 50, 3000)));
        }

        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }

    async listen(): Promise<string> {
        console.log('[Voice] Fetching state from Jarvis Voice Assistant...');
        const state = await jarvisVoiceBridge.getStatus();
        if (state && state.last_transcript) {
            return state.last_transcript;
        }
        return "Dinleme Jarvis ses modülü üzerinden aktif olarak yürütülüyor.";
    }

    async stopSpeech(): Promise<void> {
        console.log('[Voice] Stopping speech via Jarvis Bridge...');
        await jarvisVoiceBridge.interrupt();
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }

    async askConfirmation(question: string): Promise<boolean> {
        console.log(`[Voice] Asking confirmation: ${question}`);
        await this.speak(question);
        return true;
    }
}

