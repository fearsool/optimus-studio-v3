/**
 * 🎤 PIPER TTS - Local Text-to-Speech
 * ===================================
 * Wrapper for Piper TTS (Python). Generates speech locally.
 * No external API, fully offline.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// =============== TYPES ===============
export interface PiperVoice {
    id: string;
    name: string;
    language: string;
    quality: 'low' | 'medium' | 'high';
    sampleRate: number;
}

export interface TTSResult {
    success: boolean;
    audioPath: string | null;
    duration?: number;
    error?: string;
}

// =============== AVAILABLE VOICES ===============
export const PIPER_VOICES: PiperVoice[] = [
    // Turkish voices
    { id: 'tr_TR-dfki-medium', name: 'Turkish (DFKI)', language: 'tr', quality: 'medium', sampleRate: 22050 },
    { id: 'tr_TR-fahrettin-medium', name: 'Turkish (Fahrettin)', language: 'tr', quality: 'medium', sampleRate: 22050 },

    // English voices
    { id: 'en_US-lessac-medium', name: 'English US (Lessac)', language: 'en', quality: 'medium', sampleRate: 22050 },
    { id: 'en_US-ryan-high', name: 'English US (Ryan)', language: 'en', quality: 'high', sampleRate: 22050 },
    { id: 'en_GB-alan-medium', name: 'English UK (Alan)', language: 'en', quality: 'medium', sampleRate: 22050 },

    // Other languages
    { id: 'de_DE-thorsten-medium', name: 'German (Thorsten)', language: 'de', quality: 'medium', sampleRate: 22050 },
    { id: 'fr_FR-upmc-medium', name: 'French (UPMC)', language: 'fr', quality: 'medium', sampleRate: 22050 },
    { id: 'es_ES-sharvard-medium', name: 'Spanish (Sharvard)', language: 'es', quality: 'medium', sampleRate: 22050 },
];

// =============== PIPER TTS CLASS ===============
export class PiperTTS {
    private outputDir: string;
    private defaultVoice: string;
    private isInstalled: boolean = false;

    constructor(outputDir: string = './audio_output') {
        this.outputDir = outputDir;
        this.defaultVoice = 'tr_TR-dfki-medium'; // Default Turkish
        this.ensureOutputDir();
        this.checkInstallation();
    }

    private ensureOutputDir(): void {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    private async checkInstallation(): Promise<boolean> {
        try {
            await execAsync('piper --help');
            this.isInstalled = true;
            console.log('[PiperTTS] Piper is installed and ready');
            return true;
        } catch {
            console.warn('[PiperTTS] Piper not installed. Run: pip install piper-tts');
            this.isInstalled = false;
            return false;
        }
    }

    /**
     * Generate speech from text
     */
    async speak(text: string, options: {
        voice?: string;
        outputFile?: string;
        speed?: number;
    } = {}): Promise<TTSResult> {
        if (!this.isInstalled) {
            return {
                success: false,
                audioPath: null,
                error: 'Piper TTS not installed. Run: pip install piper-tts'
            };
        }

        const voice = options.voice || this.defaultVoice;
        const outputFile = options.outputFile || path.join(
            this.outputDir,
            `speech_${Date.now()}.wav`
        );

        try {
            // Escape text for shell
            const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');

            // Build command
            let cmd = `echo "${escapedText}" | piper --model ${voice} --output_file "${outputFile}"`;

            if (options.speed && options.speed !== 1.0) {
                cmd += ` --length-scale ${1 / options.speed}`;
            }

            const startTime = Date.now();
            await execAsync(cmd);
            const duration = (Date.now() - startTime) / 1000;

            return {
                success: true,
                audioPath: outputFile,
                duration
            };
        } catch (error: any) {
            return {
                success: false,
                audioPath: null,
                error: error.message
            };
        }
    }

    /**
     * Stream speech (for real-time playback)
     */
    async stream(text: string, voice?: string): Promise<NodeJS.ReadableStream | null> {
        if (!this.isInstalled) return null;

        const v = voice || this.defaultVoice;
        const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');

        try {
            const { spawn } = require('child_process');
            const process = spawn('sh', ['-c', `echo "${escapedText}" | piper --model ${v} --output-raw`]);
            return process.stdout;
        } catch {
            return null;
        }
    }

    /**
     * Set default voice
     */
    setDefaultVoice(voiceId: string): void {
        const voice = PIPER_VOICES.find(v => v.id === voiceId);
        if (voice) {
            this.defaultVoice = voiceId;
            console.log(`[PiperTTS] Default voice set to: ${voice.name}`);
        }
    }

    /**
     * Get available voices for a language
     */
    getVoicesForLanguage(language: string): PiperVoice[] {
        return PIPER_VOICES.filter(v => v.language === language);
    }

    /**
     * Download a voice model
     */
    async downloadVoice(voiceId: string): Promise<boolean> {
        try {
            // Piper downloads models automatically when first used
            // This is a helper to pre-download
            await execAsync(`piper --model ${voiceId} --download-dir ~/.local/share/piper`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if ready
     */
    isReady(): boolean {
        return this.isInstalled;
    }

    /**
     * Get status
     */
    getStatus(): { installed: boolean; defaultVoice: string; availableVoices: number } {
        return {
            installed: this.isInstalled,
            defaultVoice: this.defaultVoice,
            availableVoices: PIPER_VOICES.length
        };
    }
}

// =============== Browser-compatible Web Speech API fallback ===============
export class BrowserTTS {
    private synth: SpeechSynthesis | null = null;
    private defaultVoice: SpeechSynthesisVoice | null = null;

    constructor() {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
            this.loadVoices();
        }
    }

    private loadVoices(): void {
        if (!this.synth) return;

        const setVoice = () => {
            const voices = this.synth!.getVoices();
            // Try to find Turkish voice, fallback to English
            this.defaultVoice = voices.find(v => v.lang.startsWith('tr'))
                || voices.find(v => v.lang.startsWith('en'))
                || voices[0];
        };

        if (this.synth.getVoices().length) {
            setVoice();
        } else {
            this.synth.onvoiceschanged = setVoice;
        }
    }

    speak(text: string, options: { rate?: number; pitch?: number } = {}): void {
        if (!this.synth) return;

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.defaultVoice) {
            utterance.voice = this.defaultVoice;
        }
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;

        this.synth.speak(utterance);
    }

    stop(): void {
        this.synth?.cancel();
    }

    isReady(): boolean {
        return this.synth !== null;
    }
}

// =============== SINGLETON INSTANCES ===============
export const piperTTS = new PiperTTS();
// Browser TTS will be instantiated on client side only
