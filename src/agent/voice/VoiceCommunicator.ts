export class VoiceCommunicator {
    public onSpeakingStateChange: ((isSpeaking: boolean) => void) | null = null;

    async speak(text: string, options?: any): Promise<void> {
        console.log(`[Voice] Speaking: ${text}`);
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
        // Simulate speech delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }

    async listen(): Promise<string> {
        console.log('[Voice] Listening...');
        return "Listening not implemented yet";
    }

    async askConfirmation(question: string): Promise<boolean> {
        console.log(`[Voice] Asking confirmation: ${question}`);
        await this.speak(question);
        // Mock confirmation for now
        return true;
    }
}
