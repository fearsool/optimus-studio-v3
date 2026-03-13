"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEngineer = exports.TestEngineer = void 0;
const schemas_1 = require("./schemas");
const generative_ai_1 = require("@google/generative-ai");
const GENAI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
class TestEngineer {
    /**
     * Otomasyon çıktısını doğrular ve gerekirse düzeltir.
     * @param type Otomasyon tipi (örn: 'instagram-caption')
     * @param rawOutput AI'dan gelen ham metin/JSON
     * @param attempt Kaçıncı deneme (max 3)
     */
    async verifyAutomation(type, rawOutput, attempt = 1) {
        const start = Date.now();
        console.log(`🛡️ [ARE] Verifying ${type} (Attempt ${attempt}/3)...`);
        try {
            // 1. JSON Parse Testi
            let parsed;
            try {
                // Markdown clean up (```json ... ```)
                const cleanJson = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(cleanJson);
            }
            catch (e) {
                if (attempt < 3)
                    return this.autoCorrect(type, rawOutput, "JSON Parse Error", attempt);
                return { passed: false, score: 0, issues: ['Invalid JSON format'], validationTime: Date.now() - start };
            }
            // 2. Schema Validation Testi
            const schema = schemas_1.AUTOMATION_SCHEMAS[type];
            if (!schema) {
                // Şema tanımlı değilse "Generic Pass"
                return { passed: true, score: 50, issues: ['No schema defined for verification'], validationTime: Date.now() - start };
            }
            const result = schema.safeParse(parsed);
            if (!result.success) {
                const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
                console.warn(`⚠️ [ARE] Validation Failed:`, issues);
                // OTO-DÜZELTME DEVREYE GİRER
                if (attempt < 3) {
                    return this.autoCorrect(type, rawOutput, issues.join(', '), attempt);
                }
                return {
                    passed: false,
                    score: 0,
                    issues: issues,
                    validationTime: Date.now() - start
                };
            }
            // 3. Geçti!
            console.log(`✅ [ARE] Verification Passed!`);
            return {
                passed: true,
                score: 100,
                issues: [],
                correctedOutput: parsed,
                validationTime: Date.now() - start
            };
        }
        catch (error) {
            return { passed: false, score: 0, issues: [error.message], validationTime: Date.now() - start };
        }
    }
    /**
     * OTO-TAMİR AŞAMASI (Self-Healing)
     * Hatalı çıktıyı alıp AI'ya "Bunu düzelt" der.
     */
    async autoCorrect(type, badOutput, errorMsg, attempt) {
        console.log(`🔧 [ARE] Auto-Correcting... Error: ${errorMsg}`);
        if (!GENAI_API_KEY) {
            return { passed: false, score: 0, issues: ['API Key missing for auto-correct'], validationTime: 0 };
        }
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(GENAI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
            SYSTEM: You are a JSON Repair Engineer.
            TASK: Fix the following JSON output to strictly match the schema requirements.
            
            CONTEXT: The output failed validation for type "${type}".
            ERRORS: ${errorMsg}
            
            BAD OUTPUT:
            ${badOutput.substring(0, 1000)}...
            
            INSTRUCTION: Return ONLY the fixed, valid JSON. No markdown, no comments.
            `;
            const result = await model.generateContent(prompt);
            const fixedOutput = result.response.text();
            // Recursive call (tekrar doğrula)
            return this.verifyAutomation(type, fixedOutput, attempt + 1);
        }
        catch (e) {
            console.error('[ARE] Auto-correct failed:', e);
            return { passed: false, score: 0, issues: ['Auto-correct failed'], validationTime: 0 };
        }
    }
}
exports.TestEngineer = TestEngineer;
exports.testEngineer = new TestEngineer();
