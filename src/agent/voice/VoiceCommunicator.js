"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceCommunicator = void 0;
class VoiceCommunicator {
    constructor() {
        this.onSpeakingStateChange = null;
    }
    async speak(text, options) {
        console.log(`[Voice] Speaking: ${text}`);
        if (this.onSpeakingStateChange)
            this.onSpeakingStateChange(true);
        // Simulate speech delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (this.onSpeakingStateChange)
            this.onSpeakingStateChange(false);
    }
    async listen() {
        console.log('[Voice] Listening...');
        return "Listening not implemented yet";
    }
    async askConfirmation(question) {
        console.log(`[Voice] Asking confirmation: ${question}`);
        await this.speak(question);
        // Mock confirmation for now
        return true;
    }
}
exports.VoiceCommunicator = VoiceCommunicator;
