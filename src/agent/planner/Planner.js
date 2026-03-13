"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planner = void 0;
const LLMService_1 = require("../core/LLMService");
const SystemProtocol_1 = require("../core/SystemProtocol");
class Planner {
    constructor() {
        this.llm = new LLMService_1.LLMService();
    }
    /**
     * Kullanıcı isteğini plana çevir (LLM TABANLI)
     */
    async createPlan(userIntent, availableTools, model = 'qwen2.5-coder:7b') {
        console.log(`📋 [Planner] Reasoning about goal: "${userIntent}" using ${model}`);
        const systemPrompt = `
${SystemProtocol_1.HIERARCHY_PROTOCOL}

GÖREV: Kullanıcı isteğini gerçekleştirmek için teknik bir PLAN oluştur.
ELİNDEKİ ARAÇLAR: ${availableTools.join(', ')}

KURALLAR:
1. Kesinlikle sadece RAW JSON formatında cevap ver.
2. Açıklama, selamlaşma veya metin ekleme. Sadece JSON.
3. Eğer hiçbir araç (tool) gerekmiyorsa "tool": "none" kullan.
4. "web_search" tool'unu kullanırken "query" kısmına kullanıcı cümlesini değil, sadece arama yapılacak anahtar kelimeleri yaz.

JSON ŞABLONU:
{
  "goal": "Kullanıcının asıl amacı",
  "steps": [
    {
      "id": 1,
      "action": "Yapılacak işlemin kısa özeti",
      "tool": "tool_ismi",
      "args": { "query": "arama_terimleri", "other": "..." },
      "status": "pending"
    }
  ]
}
`;
        try {
            const response = await this.llm.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userIntent }
            ], model);
            console.log('📋 [Planner] Raw LLM Response:', response);
            // Extract JSON from response (handle potential markdown blocks)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response;
            const rawPlan = JSON.parse(jsonStr);
            const plan = {
                goal: rawPlan.goal || userIntent,
                steps: rawPlan.steps.map((s, i) => ({
                    ...s,
                    id: s.id || (i + 1),
                    status: 'pending'
                })),
                currentStep: 0,
                status: 'planning'
            };
            console.log(`   ✅ LLM Plan created with ${plan.steps.length} steps`);
            return plan;
        }
        catch (error) {
            console.error('❌ [Planner] LLM Reasoning failed, falling back to basic plan:', error);
            // Minimal fallback plan
            return {
                goal: userIntent,
                steps: [{ id: 1, action: 'Fallback response', tool: 'none', args: {}, status: 'pending' }],
                currentStep: 0,
                status: 'planning'
            };
        }
    }
}
exports.Planner = Planner;
