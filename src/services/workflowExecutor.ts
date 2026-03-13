/**
 * Workflow Executor Engine
 * n8n benzeri - Her node tipini gerçek aksiyonlara bağlar
 */

import { WorkflowNode, NodeType, StepStatus, SystemBlueprint } from '../types';
import { httpRequest, triggerWebhook, API_INTEGRATIONS } from './webhookService';

// Execution context - node'lar arası veri aktarımı
export interface ExecutionContext {
    blueprintId: string;
    variables: Record<string, any>;
    nodeOutputs: Record<string, any>;
    apiKeys: Record<string, string>;
    logs: ExecutionLog[];
    currentNodeIndex: number;
    status: 'running' | 'completed' | 'failed' | 'paused';
    startedAt: number;
    completedAt?: number;
}

export interface ExecutionLog {
    nodeId: string;
    nodeName: string;
    action: string;
    status: 'success' | 'error' | 'skipped';
    output?: any;
    error?: string;
    timestamp: number;
    duration?: number;
}

export interface ExecutionResult {
    success: boolean;
    context: ExecutionContext;
    finalOutput?: any;
    error?: string;
}

// Node tipine göre executor fonksiyonu
type NodeExecutor = (
    node: WorkflowNode,
    context: ExecutionContext
) => Promise<{ success: boolean; output?: any; error?: string }>;

// Her node tipi için executor
const NODE_EXECUTORS: Record<NodeType, NodeExecutor> = {
    // AI Planner - Görev planlaması
    [NodeType.AGENT_PLANNER]: async (node, context) => {
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
        return { success: true, output: data.choices?.[0]?.message?.content };
    },

    // Web Araştırma
    [NodeType.RESEARCH_WEB]: async (node, context) => {
        // Web scraping veya API arama
        const query = context.variables.query || node.task;
        return { success: true, output: { query, note: 'Web research placeholder' } };
    },

    // İçerik Oluşturucu (AI)
    [NodeType.CONTENT_CREATOR]: async (node, context) => {
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
        return { success: true, output: data.choices?.[0]?.message?.content };
    },

    // Medya Mühendisi (Görsel üretim)
    [NodeType.MEDIA_ENGINEER]: async (node, context) => {
        const falKey = context.apiKeys.FAL_API_KEY;
        const prompt = context.nodeOutputs[node.connections[0]?.targetId] || node.task;

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
            return { success: true, output: { imageUrl: data.images?.[0]?.url } };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },

    // Video Mimarı
    [NodeType.VIDEO_ARCHITECT]: async (node, context) => {
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
    [NodeType.TRADING_DESK]: async (node, context) => {
        return { success: true, output: { note: 'Trading actions placeholder' } };
    },

    // Sosyal Medya Yöneticisi (Bildirim gönderme)
    [NodeType.SOCIAL_MANAGER]: async (node, context) => {
        const telegramToken = context.apiKeys.TELEGRAM_BOT_TOKEN;
        const telegramChatId = context.apiKeys.TELEGRAM_CHAT_ID;
        const content = Object.values(context.nodeOutputs).pop();

        // Telegram bildirimi
        if (telegramToken && telegramChatId) {
            const result = await API_INTEGRATIONS.TELEGRAM.sendMessage(
                telegramToken,
                telegramChatId,
                `📢 Otomasyon sonucu:\n\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2).substring(0, 3000)}`
            );
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
    [NodeType.ANALYST_CRITIC]: async (node, context) => {
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
        return { success: true, output: { analysis: data.choices?.[0]?.message?.content, approved: true } };
    },

    // Mantık Kapısı (Koşul kontrolü)
    [NodeType.LOGIC_GATE]: async (node, context) => {
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
    [NodeType.EXTERNAL_CONNECTOR]: async (node, context) => {
        const webhookUrl = context.apiKeys[`${node.id}_WEBHOOK_URL`] || context.variables.webhookUrl;
        const payload = Object.values(context.nodeOutputs).pop();

        if (webhookUrl) {
            const result = await triggerWebhook(webhookUrl, payload);
            return { success: result.success, output: result.data, error: result.error };
        }

        // HTTP request yapmadan çıktıyı aktar
        return { success: true, output: payload };
    },

    // State Yöneticisi (Veri kaydetme)
    [NodeType.STATE_MANAGER]: async (node, context) => {
        // LocalStorage veya Supabase'e kaydet
        const dataToSave = {
            blueprintId: context.blueprintId,
            outputs: context.nodeOutputs,
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(`automation_${context.blueprintId}`, JSON.stringify(dataToSave));
            return { success: true, output: { saved: true, key: `automation_${context.blueprintId}` } };
        } catch {
            return { success: true, output: dataToSave };
        }
    },

    // İnsan Onayı
    [NodeType.HUMAN_APPROVAL]: async (node, context) => {
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
    [NodeType.HTTP_REQUEST]: async (node, context) => {
        if (!node.httpConfig) {
            return { success: false, error: 'HTTP config required' };
        }
        try {
            const result = await httpRequest(node.httpConfig);
            return { success: true, output: result };
        } catch (e) {
            return { success: false, error: String(e) };
        }
    }
};

/**
 * Workflow'u çalıştır
 */
export async function executeWorkflow(
    blueprint: SystemBlueprint,
    input: any,
    apiKeys: Record<string, string>
): Promise<ExecutionResult> {
    const context: ExecutionContext = {
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
                if (node.type === NodeType.LOGIC_GATE && !result.output?.passed) {
                    context.status = 'completed';
                    break;
                }

            } catch (error) {
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

    } catch (error) {
        context.status = 'failed';
        context.completedAt = Date.now();

        return {
            success: false,
            context,
            error: String(error)
        };
    }
}

/**
 * Template'i gerçek workflow olarak çalıştır
 */
export async function runTemplateAsWorkflow(
    blueprint: SystemBlueprint,
    userInput: string,
    apiKeys?: Record<string, string>
): Promise<ExecutionResult> {
    // Netlify env'den API key'leri al (client-side değilse)
    const keys = apiKeys || {};

    return executeWorkflow(blueprint, userInput, keys);
}

export default {
    executeWorkflow,
    runTemplateAsWorkflow,
    NODE_EXECUTORS
};
