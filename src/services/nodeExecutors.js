"use strict";
/**
 * OMNIFLOW AGENT RUNTIME
 * ======================
 * Node Executors - Stateless Logic Units
 *
 * Bu dosya "Worker"ın beynidir. Sadece bir step alır, işini yapar, sonucunu döner.
 * Workflow/Graph state'ini bilmez.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeExecutors = void 0;
// ============================================
// AI AGENTS (Groq)
// ============================================
async function executeAI(config, context, apiKeys) {
    var _a, _b, _c;
    const groqKey = apiKeys.GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!groqKey)
        return { success: false, output: null, error: 'GROQ_API_KEY missing' };
    const input = context.$input || context.$lastOutput || config.task;
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: `Rol: ${config.role || 'Assistant'}. Görev: ${config.task}` },
                    { role: 'user', content: typeof input === 'string' ? input : JSON.stringify(input) }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });
        if (!response.ok)
            return { success: false, output: null, error: `Groq Error: ${response.status}` };
        const data = await response.json();
        return { success: true, output: (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content };
    }
    catch (e) {
        return { success: false, output: null, error: e.message };
    }
}
// ============================================
// MEDIA AGENTS (Fal.ai)
// ============================================
async function executeMedia(config, context, apiKeys) {
    var _a, _b;
    const falKey = apiKeys.FAL_API_KEY || process.env.FAL_API_KEY;
    if (!falKey)
        return { success: true, output: { skipped: 'FAL_API_KEY missing' } };
    const prompt = context.$lastOutput || config.task;
    try {
        const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
            method: 'POST',
            headers: { 'Authorization': `Key ${falKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: String(prompt).substring(0, 500),
                image_size: 'landscape_16_9',
                num_inference_steps: 4
            })
        });
        if (!response.ok)
            return { success: false, output: null, error: `Fal Error: ${response.status}` };
        const data = await response.json();
        return { success: true, output: { imageUrl: (_b = (_a = data.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url } };
    }
    catch (e) {
        return { success: false, output: null, error: e.message };
    }
}
// ============================================
// INTEGRATION AGENTS (Telegram, Webhook)
// ============================================
async function executeTelegram(config, context, apiKeys) {
    const token = apiKeys.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = apiKeys.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId)
        return { success: true, output: { skipped: 'Telegram not configured' } };
    const message = typeof context.$lastOutput === 'string'
        ? context.$lastOutput
        : JSON.stringify(context.$lastOutput, null, 2);
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `📢 OmniFlow:\n${message.substring(0, 3000)}`
            })
        });
        return { success: true, output: { sent: true } };
    }
    catch (e) {
        return { success: false, output: null, error: e.message };
    }
}
// ============================================
// LOGIC AGENTS
// ============================================
// ============================================
// LOGIC AGENTS
// ============================================
async function executeLogic(config, context) {
    // Basic Logic Evaluation
    // Config: { condition: "input.value > 10" } or "default"
    // For MVP security, we might want to avoid eval, but for flexibility n8n uses VM.
    // Here we support simple 'contains', 'equals' or basic comparison.
    const input = context.$input || context.$lastOutput;
    const condition = config.condition; // e.g., "value > 5"
    let result = true;
    if (condition) {
        // Very basic string check for MVP
        // In prod, use 'safe-eval' or 'vm2'
        try {
            // Unsafe eval for demonstration of N8n power
            // eslint-disable-next-line no-new-func
            const check = new Function('input', `return ${condition}`);
            result = check(input);
        }
        catch (e) {
            console.error('Logic Eval Error', e);
            result = false;
        }
    }
    return {
        success: true,
        output: {
            _branch: result ? 'true' : 'false',
            original: input
        }
    };
}
// ============================================
// HTTP REQUEST AGENT (Universal Connector)
// ============================================
const interpolate = (text, context) => {
    if (!text || typeof text !== 'string')
        return text;
    // Basic interpolation {{key}} including nested objects
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        const parts = key.trim().split('.');
        let val = context;
        for (const p of parts) {
            val = val === null || val === void 0 ? void 0 : val[p];
        }
        // If not found, try to look in inputs or variables directly
        if (val === undefined && context.variables)
            val = context.variables[parts[0]];
        return val !== undefined ? String(val) : '';
    });
};
async function executeHttpRequest(config, context, apiKeys) {
    const httpConfig = config.httpConfig;
    if (!httpConfig) {
        return { success: false, output: null, error: 'Missing httpConfig' };
    }
    const url = interpolate(httpConfig.url, context);
    const method = httpConfig.method || 'GET';
    const body = httpConfig.body ? interpolate(httpConfig.body, context) : undefined;
    // Headers processing
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'OmniFlow-Runtime/3.0'
    };
    if (httpConfig.headers) {
        Object.entries(httpConfig.headers).forEach(([k, v]) => {
            headers[k] = interpolate(String(v), context);
        });
    }
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: method !== 'GET' && method !== 'HEAD' ? body : undefined
        });
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        }
        catch (_a) {
            data = text;
        }
        if (!response.ok) {
            return {
                success: false,
                output: { status: response.status, body: data },
                error: `HTTP ${response.status}`
            };
        }
        return { success: true, output: data };
    }
    catch (e) {
        return { success: false, output: null, error: e.message };
    }
}
// ============================================
// EXPORT REGISTRY
// ============================================
exports.nodeExecutors = {
    'planner': executeAI,
    'creator': executeAI,
    'analyst': executeAI,
    'media': executeMedia,
    'social': executeTelegram,
    'http_request': executeHttpRequest,
    'logic_gate': executeLogic, // Simple wrapper
    'default': async (cfg, ctx) => ({ success: true, output: ctx.$lastOutput })
};
exports.default = exports.nodeExecutors;
