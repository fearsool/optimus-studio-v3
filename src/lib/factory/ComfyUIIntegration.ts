import fetch from 'node-fetch';

export class ComfyUIIntegration {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8188') {
        this.baseUrl = baseUrl;
    }

    async checkHealth(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/history`);
            return res.ok;
        } catch {
            return false;
        }
    }

    async queuePrompt(workflow: any): Promise<string> {
        console.log('[ComfyUI] Queuing visual generation workflow...');
        const res = await fetch(`${this.baseUrl}/prompt`, {
            method: 'POST',
            body: JSON.stringify({ prompt: workflow })
        });
        const data: any = await res.json();
        return data.prompt_id;
    }

    async getStatus(promptId: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/history/${promptId}`);
        return await res.json();
    }
}
