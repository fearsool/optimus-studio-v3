"use strict";
/**
 * Workflow Executor Engine
 * n8n benzeri - Her node tipini gerçek aksiyonlara bağlar
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTemplateAsWorkflow = exports.executeWorkflow = void 0;
const types_1 = require("../types");
const webhookService_1 = require("./webhookService");
// Her node tipi için executor
const NODE_EXECUTORS = {
    // AI Planner - Görev planlaması
    [types_1.NodeType.AGENT_PLANNER]: async (node, context) => {
        var _a, _b, _c;
        const input = context.variables.input || node.task;
        const groqKey = context.apiKeys.GROQ_API_KEY;
        if (!groqKey) {
            return { success: false, error: 'GROQ_API_KEY required' };
        }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: `Sen bir ${node.role}. Görev: ${node.task}` },
                    { role: 'user', content: input }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });
        if (!response.ok) {
            return { success: false, error: `AI error: ${response.status}` };
        }
        const data = await response.json();
        return { success: true, output: (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content };
    },
    // Web Araştırma
    [types_1.NodeType.RESEARCH_WEB]: async (node, context) => {
        // Web scraping veya API arama
        const query = context.variables.query || node.task;
        return { success: true, output: { query, note: 'Web research placeholder' } };
    },
    // İçerik Oluşturucu (AI)
    [types_1.NodeType.CONTENT_CREATOR]: async (node, context) => {
        var _a, _b, _c;
        const groqKey = context.apiKeys.GROQ_API_KEY;
        const previousOutput = Object.values(context.nodeOutputs).pop() || context.variables.input;
        if (!groqKey) {
            return { success: false, error: 'GROQ_API_KEY required' };
        }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: `Sen profesyonel bir içerik üreticisisin. Rol: ${node.role}` },
                    { role: 'user', content: `${node.task}\n\nGirdi: ${JSON.stringify(previousOutput)}` }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });
        if (!response.ok) {
            return { success: false, error: `AI error: ${response.status}` };
        }
        const data = await response.json();
        return { success: true, output: (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content };
    },
    // Medya Mühendisi (Görsel üretim)
    [types_1.NodeType.MEDIA_ENGINEER]: async (node, context) => {
        var _a, _b, _c;
        const falKey = context.apiKeys.FAL_API_KEY;
        const prompt = context.nodeOutputs[(_a = node.connections[0]) === null || _a === void 0 ? void 0 : _a.targetId] || node.task;
        if (!falKey) {
            return { success: true, output: { note: 'FAL_API_KEY not set, skipping image generation' } };
        }
        try {
            const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${falKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: String(prompt).substring(0, 500) + ', professional, high quality',
                    image_size: 'landscape_16_9',
                    num_inference_steps: 4
                })
            });
            if (!response.ok) {
                return { success: false, error: `FAL error: ${response.status}` };
            }
            const data = await response.json();
            return { success: true, output: { imageUrl: (_c = (_b = data.images) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.url } };
        }
        catch (error) {
            return { success: false, error: String(error) };
        }
    },
    // Video Mimarı
    [types_1.NodeType.VIDEO_ARCHITECT]: async (node, context) => {
        // Video üretim pipeline - şimdilik placeholder
        return {
            success: true,
            output: {
                note: 'Video generation requires Shotstack API',
                scenes: context.nodeOutputs
            }
        };
    },
    // Trading Masası
    [types_1.NodeType.TRADING_DESK]: async (node, context) => {
        return { success: true, output: { note: 'Trading actions placeholder' } };
    },
    // Sosyal Medya Yöneticisi (Bildirim gönderme)
    [types_1.NodeType.SOCIAL_MANAGER]: async (node, context) => {
        const telegramToken = context.apiKeys.TELEGRAM_BOT_TOKEN;
        const telegramChatId = context.apiKeys.TELEGRAM_CHAT_ID;
        const content = Object.values(context.nodeOutputs).pop();
        // Telegram bildirimi
        if (telegramToken && telegramChatId) {
            const result = await webhookService_1.API_INTEGRATIONS.TELEGRAM.sendMessage(telegramToken, telegramChatId, `📢 Otomasyon sonucu:\n\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2).substring(0, 3000)}`);
            return { success: result.success, output: { telegram: result } };
        }
        return {
            success: true,
            output: {
                note: 'TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set',
                content
            }
        };
    },
    // Analist/Eleştirmen
    [types_1.NodeType.ANALYST_CRITIC]: async (node, context) => {
        var _a, _b, _c;
        const groqKey = context.apiKeys.GROQ_API_KEY;
        const toAnalyze = Object.values(context.nodeOutputs).pop();
        if (!groqKey) {
            return { success: true, output: { approved: true, note: 'No API key, auto-approved' } };
        }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Sen bir kalite analistisin. İçeriği analiz et ve puan ver (1-10).' },
                    { role: 'user', content: JSON.stringify(toAnalyze) }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });
        if (!response.ok) {
            return { success: true, output: { approved: true } };
        }
        const data = await response.json();
        return { success: true, output: { analysis: (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content, approved: true } };
    },
    // Mantık Kapısı (Koşul kontrolü)
    [types_1.NodeType.LOGIC_GATE]: async (node, context) => {
        const condition = node.task;
        const previousOutput = Object.values(context.nodeOutputs).pop();
        // Basit koşul değerlendirme
        const passed = previousOutput && String(previousOutput).length > 0;
        return {
            success: true,
            output: {
                condition,
                passed,
                nextPath: passed ? 'continue' : 'stop'
            }
        };
    },
    // Harici Bağlayıcı (Webhook/API)
    [types_1.NodeType.EXTERNAL_CONNECTOR]: async (node, context) => {
        const webhookUrl = context.apiKeys[`${node.id}_WEBHOOK_URL`] || context.variables.webhookUrl;
        const payload = Object.values(context.nodeOutputs).pop();
        if (webhookUrl) {
            const result = await (0, webhookService_1.triggerWebhook)(webhookUrl, payload);
            return { success: result.success, output: result.data, error: result.error };
        }
        // HTTP request yapmadan çıktıyı aktar
        return { success: true, output: payload };
    },
    // State Yöneticisi (Veri kaydetme)
    [types_1.NodeType.STATE_MANAGER]: async (node, context) => {
        // LocalStorage veya Supabase'e kaydet
        const dataToSave = {
            blueprintId: context.blueprintId,
            outputs: context.nodeOutputs,
            savedAt: new Date().toISOString()
        };
        try {
            localStorage.setItem(`automation_${context.blueprintId}`, JSON.stringify(dataToSave));
            return { success: true, output: { saved: true, key: `automation_${context.blueprintId}` } };
        }
        catch (_a) {
            return { success: true, output: dataToSave };
        }
    },
    // İnsan Onayı
    [types_1.NodeType.HUMAN_APPROVAL]: async (node, context) => {
        // Onay gerektiren node - şimdilik otomatik onay
        return {
            success: true,
            output: {
                approved: true,
                note: 'Auto-approved (manual approval not implemented yet)',
                pendingContent: Object.values(context.nodeOutputs).pop()
            }
        };
    },
    // HTTP Request Executor
    [types_1.NodeType.HTTP_REQUEST]: async (node, context) => {
        if (!node.httpConfig) {
            return { success: false, error: 'HTTP config required' };
        }
        try {
            const result = await (0, webhookService_1.httpRequest)(node.httpConfig);
            return { success: true, output: result };
        }
        catch (e) {
            return { success: false, error: String(e) };
        }
    }
};
/**
 * Workflow'u çalıştır
 */
async function executeWorkflow(blueprint, input, apiKeys) {
    var _a;
    const context = {
        blueprintId: blueprint.id,
        variables: { input },
        nodeOutputs: {},
        apiKeys,
        logs: [],
        currentNodeIndex: 0,
        status: 'running',
        startedAt: Date.now()
    };
    try {
        // Node'ları sırayla çalıştır
        for (let i = 0; i < blueprint.nodes.length; i++) {
            const node = blueprint.nodes[i];
            context.currentNodeIndex = i;
            const startTime = Date.now();
            const executor = NODE_EXECUTORS[node.type];
            if (!executor) {
                context.logs.push({
                    nodeId: node.id,
                    nodeName: node.title,
                    action: 'execute',
                    status: 'skipped',
                    error: `Unknown node type: ${node.type}`,
                    timestamp: startTime
                });
                continue;
            }
            try {
                const result = await executor(node, context);
                context.nodeOutputs[node.id] = result.output;
                context.logs.push({
                    nodeId: node.id,
                    nodeName: node.title,
                    action: node.task,
                    status: result.success ? 'success' : 'error',
                    output: result.output,
                    error: result.error,
                    timestamp: startTime,
                    duration: Date.now() - startTime
                });
                // Logic gate kontrolü
                if (node.type === types_1.NodeType.LOGIC_GATE && !((_a = result.output) === null || _a === void 0 ? void 0 : _a.passed)) {
                    context.status = 'completed';
                    break;
                }
            }
            catch (error) {
                context.logs.push({
                    nodeId: node.id,
                    nodeName: node.title,
                    action: node.task,
                    status: 'error',
                    error: String(error),
                    timestamp: startTime,
                    duration: Date.now() - startTime
                });
            }
        }
        context.status = 'completed';
        context.completedAt = Date.now();
        return {
            success: true,
            context,
            finalOutput: Object.values(context.nodeOutputs).pop()
        };
    }
    catch (error) {
        context.status = 'failed';
        context.completedAt = Date.now();
        return {
            success: false,
            context,
            error: String(error)
        };
    }
}
exports.executeWorkflow = executeWorkflow;
/**
 * Template'i gerçek workflow olarak çalıştır
 */
async function runTemplateAsWorkflow(blueprint, userInput, apiKeys) {
    // Netlify env'den API key'leri al (client-side değilse)
    const keys = apiKeys || {};
    return executeWorkflow(blueprint, userInput, keys);
}
exports.runTemplateAsWorkflow = runTemplateAsWorkflow;
exports.default = {
    executeWorkflow,
    runTemplateAsWorkflow,
    NODE_EXECUTORS
};
