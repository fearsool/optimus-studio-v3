"use strict";
/**
 * 🤖 LM STUDIO ADAPTER
 * ====================
 * Optimus'un yerel LLM ile konuşmasını sağlar.
 * LM Studio veya Ollama API'sine bağlanır.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.llm = exports.LMStudioAdapter = void 0;
const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
class LMStudioAdapter {
    constructor(baseUrl = LM_STUDIO_URL, model = 'local-model') {
        this.baseUrl = baseUrl;
        this.model = model;
    }
    /**
     * LLM'e mesaj gönder ve yanıt al
     */
    async chat(messages, systemPrompt) {
        var _a, _b, _c, _d;
        const fullMessages = [];
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
            return ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || 'No response';
        }
        catch (error) {
            console.error('LM Studio connection failed:', error.message);
            // Fallback: Rule-based response
            return this.fallbackResponse(((_d = messages[messages.length - 1]) === null || _d === void 0 ? void 0 : _d.content) || '');
        }
    }
    /**
     * Planlama için özel prompt
     */
    async createPlan(userIntent, availableTools) {
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
        return this.chat([{ role: 'user', content: userIntent }], systemPrompt);
    }
    /**
     * LLM bağlanamazsa basit yanıtlar
     */
    fallbackResponse(input) {
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
    async ping() {
        try {
            const response = await fetch(this.baseUrl.replace('/chat/completions', '/models'), {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        }
        catch (_a) {
            return false;
        }
    }
}
exports.LMStudioAdapter = LMStudioAdapter;
// Singleton export
exports.llm = new LMStudioAdapter();
