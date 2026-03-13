"use strict";
/**
 * 🎤 PIPER TTS - Local Text-to-Speech
 * ===================================
 * Wrapper for Piper TTS (Python). Generates speech locally.
 * No external API, fully offline.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.piperTTS = exports.BrowserTTS = exports.PiperTTS = exports.PIPER_VOICES = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// =============== AVAILABLE VOICES ===============
exports.PIPER_VOICES = [
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
class PiperTTS {
    constructor(outputDir = './audio_output') {
        this.isInstalled = false;
        this.outputDir = outputDir;
        this.defaultVoice = 'tr_TR-dfki-medium'; // Default Turkish
        this.ensureOutputDir();
        this.checkInstallation();
    }
    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async checkInstallation() {
        try {
            await execAsync('piper --help');
            this.isInstalled = true;
            console.log('[PiperTTS] Piper is installed and ready');
            return true;
        }
        catch (_a) {
            console.warn('[PiperTTS] Piper not installed. Run: pip install piper-tts');
            this.isInstalled = false;
            return false;
        }
    }
    /**
     * Generate speech from text
     */
    async speak(text, options = {}) {
        if (!this.isInstalled) {
            return {
                success: false,
                audioPath: null,
                error: 'Piper TTS not installed. Run: pip install piper-tts'
            };
        }
        const voice = options.voice || this.defaultVoice;
        const outputFile = options.outputFile || path.join(this.outputDir, `speech_${Date.now()}.wav`);
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
        }
        catch (error) {
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
    async stream(text, voice) {
        if (!this.isInstalled)
            return null;
        const v = voice || this.defaultVoice;
        const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
        try {
            const { spawn } = require('child_process');
            const process = spawn('sh', ['-c', `echo "${escapedText}" | piper --model ${v} --output-raw`]);
            return process.stdout;
        }
        catch (_a) {
            return null;
        }
    }
    /**
     * Set default voice
     */
    setDefaultVoice(voiceId) {
        const voice = exports.PIPER_VOICES.find(v => v.id === voiceId);
        if (voice) {
            this.defaultVoice = voiceId;
            console.log(`[PiperTTS] Default voice set to: ${voice.name}`);
        }
    }
    /**
     * Get available voices for a language
     */
    getVoicesForLanguage(language) {
        return exports.PIPER_VOICES.filter(v => v.language === language);
    }
    /**
     * Download a voice model
     */
    async downloadVoice(voiceId) {
        try {
            // Piper downloads models automatically when first used
            // This is a helper to pre-download
            await execAsync(`piper --model ${voiceId} --download-dir ~/.local/share/piper`);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Check if ready
     */
    isReady() {
        return this.isInstalled;
    }
    /**
     * Get status
     */
    getStatus() {
        return {
            installed: this.isInstalled,
            defaultVoice: this.defaultVoice,
            availableVoices: exports.PIPER_VOICES.length
        };
    }
}
exports.PiperTTS = PiperTTS;
// =============== Browser-compatible Web Speech API fallback ===============
class BrowserTTS {
    constructor() {
        this.synth = null;
        this.defaultVoice = null;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
            this.loadVoices();
        }
    }
    loadVoices() {
        if (!this.synth)
            return;
        const setVoice = () => {
            const voices = this.synth.getVoices();
            // Try to find Turkish voice, fallback to English
            this.defaultVoice = voices.find(v => v.lang.startsWith('tr'))
                || voices.find(v => v.lang.startsWith('en'))
                || voices[0];
        };
        if (this.synth.getVoices().length) {
            setVoice();
        }
        else {
            this.synth.onvoiceschanged = setVoice;
        }
    }
    speak(text, options = {}) {
        if (!this.synth)
            return;
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.defaultVoice) {
            utterance.voice = this.defaultVoice;
        }
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        this.synth.speak(utterance);
    }
    stop() {
        var _a;
        (_a = this.synth) === null || _a === void 0 ? void 0 : _a.cancel();
    }
    isReady() {
        return this.synth !== null;
    }
}
exports.BrowserTTS = BrowserTTS;
// =============== SINGLETON INSTANCES ===============
exports.piperTTS = new PiperTTS();
// Browser TTS will be instantiated on client side only
