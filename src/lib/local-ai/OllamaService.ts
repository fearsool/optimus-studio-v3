export class OllamaService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }

    async ping(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`);
            return res.ok;
        } catch (e) {
            console.error("Ollama connection failed:", e);
            return false;
        }
    }

    async generate(model: string, prompt: string, stream: boolean = false): Promise<any> {
        try {
            const res = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, stream })
            });
            return stream ? res.body : await res.json();
        } catch (e) {
            console.error("Generation failed:", e);
            throw e;
        }
    }

    async listModels(): Promise<string[]> {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`);
            const data = await res.json();
            return data.models.map((m: any) => m.name);
        } catch (e) {
            return [];
        }
    }
}
