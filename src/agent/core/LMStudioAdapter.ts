/**
 * 🤖 LM STUDIO ADAPTER
 * ====================
 * Optimus'un yerel LLM ile konuşmasını sağlar.
 * LM Studio veya Ollama API'sine bağlanır.
 */

const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    model: string;
}

export class LMStudioAdapter {
    private baseUrl: string;
    private model: string;

    constructor(baseUrl: string = LM_STUDIO_URL, model: string = 'local-model') {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    /**
     * LLM'e mesaj gönder ve yanıt al
     */
    async chat(messages: LLMMessage[], systemPrompt?: string): Promise<string> {
        const fullMessages: LLMMessage[] = [];

        if (systemPrompt) {
            fullMessages.push({ role: 'system', content: systemPrompt });
        }

        fullMessages.push(...messages);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: fullMessages,
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`LM Studio error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'No response';

        } catch (error: any) {
            console.error('LM Studio connection failed:', error.message);
            // Fallback: Rule-based response
            return this.fallbackResponse(messages[messages.length - 1]?.content || '');
        }
    }

    /**
     * Planlama için özel prompt
     */
    async createPlan(userIntent: string, availableTools: string[]): Promise<string> {
        const systemPrompt = `Sen Optimus, bir AI mühendislik asistanısın.
Kullanıcının isteğini analiz et ve bir plan oluştur.

Kullanılabilir araçlar: ${availableTools.join(', ')}

SADECE JSON formatında yanıt ver:
{
  "goal": "Amaç açıklaması",
  "steps": [
    {"action": "Yapılacak iş", "tool": "kullanılacak_tool", "args": {}}
  ]
}`;

        return this.chat(
            [{ role: 'user', content: userIntent }],
            systemPrompt
        );
    }

    /**
     * LLM bağlanamazsa basit yanıtlar
     */
    private fallbackResponse(input: string): string {
        const lower = input.toLowerCase();

        if (lower.includes('merhaba') || lower.includes('selam')) {
            return 'Merhaba! Ben Optimus, fabrikayı yönetmek için buradayım. Size nasıl yardımcı olabilirim?';
        }

        if (lower.includes('render') || lower.includes('video')) {
            return 'Video render işlemi için factory_tool kullanacağım. Hangi konu hakkında video istersiniz?';
        }

        if (lower.includes('dosya') || lower.includes('file')) {
            return 'Dosya işlemleri için file_tool kullanacağım. Hangi dosyayı okumak/yazmak istiyorsunuz?';
        }

        return 'Anladım. Bu görevi yerine getirmek için çalışıyorum...';
    }

    /**
     * Bağlantı kontrolü
     */
    async ping(): Promise<boolean> {
        try {
            const response = await fetch(this.baseUrl.replace('/chat/completions', '/models'), {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Singleton export
export const llm = new LMStudioAdapter();
