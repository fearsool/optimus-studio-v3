// ============================================
// WEBHOOK & HTTP REQUEST SERVICE
// n8n benzeri HTTP işlemleri
// ============================================

export interface HttpRequestOptions {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

export interface HttpResponse {
    success: boolean;
    status?: number;
    statusText?: string;
    data?: any;
    headers?: Record<string, string>;
    error?: string;
    duration?: number;
}

export interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    method: 'POST' | 'GET';
    headers?: Record<string, string>;
    active: boolean;
    createdAt: number;
    lastTriggered?: number;
    triggerCount: number;
}

// ============================================
// HTTP REQUEST (n8n HTTP Request Node benzeri)
// ============================================

export const httpRequest = async (options: HttpRequestOptions): Promise<HttpResponse> => {
    const {
        url,
        method = 'GET',
        headers = {},
        body,
        timeout = 30000,
        responseType = 'json'
    } = options;

    const startTime = Date.now();
    console.log(`[HTTP] ${method} ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            signal: controller.signal
        };

        if (body && method !== 'GET') {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        let data;
        switch (responseType) {
            case 'json':
                data = await response.json().catch(() => response.text());
                break;
            case 'text':
                data = await response.text();
                break;
            case 'blob':
                data = await response.blob();
                break;
            case 'arrayBuffer':
                data = await response.arrayBuffer();
                break;
        }

        const duration = Date.now() - startTime;
        console.log(`[HTTP] ${response.status} - ${duration}ms`);

        return {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            data,
            duration
        };

    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('[HTTP] Hata:', error);

        if (error.name === 'AbortError') {
            return { success: false, error: 'İstek zaman aşımına uğradı' };
        }

        return { success: false, error: error.message };
    }
};

// ============================================
// WEBHOOK TRIGGER (n8n Webhook Node benzeri)
// ============================================

export const triggerWebhook = async (
    webhookUrl: string,
    payload: any,
    options: { headers?: Record<string, string>; method?: 'POST' | 'PUT' } = {}
): Promise<HttpResponse> => {
    return httpRequest({
        url: webhookUrl,
        method: options.method || 'POST',
        headers: options.headers,
        body: payload
    });
};

// ============================================
// WEBHOOK KAYIT SİSTEMİ
// ============================================

const WEBHOOKS_STORAGE_KEY = 'omniflow_webhooks';

export const saveWebhook = (webhook: WebhookConfig): void => {
    const webhooks = getWebhooks();
    const existingIndex = webhooks.findIndex(w => w.id === webhook.id);

    if (existingIndex >= 0) {
        webhooks[existingIndex] = webhook;
    } else {
        webhooks.push(webhook);
    }

    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks));
};

export const getWebhooks = (): WebhookConfig[] => {
    const stored = localStorage.getItem(WEBHOOKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const deleteWebhook = (webhookId: string): void => {
    const webhooks = getWebhooks().filter(w => w.id !== webhookId);
    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks));
};

export const createWebhook = (name: string): WebhookConfig => {
    const webhook: WebhookConfig = {
        id: crypto.randomUUID(),
        name,
        url: `${window.location.origin}/webhook/${crypto.randomUUID()}`,
        method: 'POST',
        active: true,
        createdAt: Date.now(),
        triggerCount: 0
    };

    saveWebhook(webhook);
    return webhook;
};

// ============================================
// POPÜLER API ENTEGRASYONLARI
// ============================================

export const API_INTEGRATIONS = {
    // Sosyal Medya
    TELEGRAM: {
        sendMessage: (botToken: string, chatId: string, text: string) =>
            httpRequest({
                url: `https://api.telegram.org/bot${botToken}/sendMessage`,
                method: 'POST',
                body: { chat_id: chatId, text, parse_mode: 'HTML' }
            }),

        getUpdates: (botToken: string) =>
            httpRequest({
                url: `https://api.telegram.org/bot${botToken}/getUpdates`,
                method: 'GET'
            })
    },

    DISCORD: {
        sendMessage: (webhookUrl: string, content: string, embeds?: any[]) =>
            httpRequest({
                url: webhookUrl,
                method: 'POST',
                body: { content, embeds }
            })
    },

    SLACK: {
        sendMessage: (webhookUrl: string, text: string, blocks?: any[]) =>
            httpRequest({
                url: webhookUrl,
                method: 'POST',
                body: { text, blocks }
            })
    },

    // E-posta
    SENDGRID: {
        sendEmail: (apiKey: string, to: string, subject: string, html: string, from: string) =>
            httpRequest({
                url: 'https://api.sendgrid.com/v3/mail/send',
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}` },
                body: {
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: from },
                    subject,
                    content: [{ type: 'text/html', value: html }]
                }
            })
    },

    // Veri
    GOOGLE_SHEETS: {
        appendRow: (apiKey: string, spreadsheetId: string, range: string, values: any[]) =>
            httpRequest({
                url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
                method: 'POST',
                body: { values: [values] }
            }),

        getValues: (apiKey: string, spreadsheetId: string, range: string) =>
            httpRequest({
                url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`,
                method: 'GET'
            })
    },

    AIRTABLE: {
        createRecord: (apiKey: string, baseId: string, tableName: string, fields: Record<string, any>) =>
            httpRequest({
                url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}` },
                body: { fields }
            }),

        getRecords: (apiKey: string, baseId: string, tableName: string) =>
            httpRequest({
                url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            })
    },

    // Ödeme
    STRIPE: {
        createPaymentIntent: (apiKey: string, amount: number, currency: string = 'try') =>
            httpRequest({
                url: 'https://api.stripe.com/v1/payment_intents',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `amount=${amount}&currency=${currency}`
            })
    },

    // Genel
    OPENAI: {
        chat: (apiKey: string, messages: any[], model: string = 'gpt-4o-mini') =>
            httpRequest({
                url: 'https://api.openai.com/v1/chat/completions',
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}` },
                body: { model, messages }
            })
    }
};

// ============================================
// VERİ DÖNÜŞTÜRME (n8n Function Node benzeri)
// ============================================

export const transformData = {
    // JSON parse
    parseJSON: (text: string): any => {
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    },

    // JSON stringify
    stringify: (data: any): string => JSON.stringify(data, null, 2),

    // Array map
    mapArray: <T, U>(arr: T[], fn: (item: T, index: number) => U): U[] => arr.map(fn),

    // Array filter
    filterArray: <T>(arr: T[], fn: (item: T) => boolean): T[] => arr.filter(fn),

    // Object pick
    pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
        const result = {} as Pick<T, K>;
        keys.forEach(key => { result[key] = obj[key]; });
        return result;
    },

    // Object omit
    omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
        const result = { ...obj };
        keys.forEach(key => { delete (result as any)[key]; });
        return result as Omit<T, K>;
    },

    // Template string
    template: (str: string, data: Record<string, any>): string => {
        return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
    },

    // Flatten object
    flatten: (obj: any, prefix = ''): Record<string, any> => {
        return Object.keys(obj).reduce((acc, key) => {
            const pre = prefix.length ? `${prefix}.` : '';
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(acc, transformData.flatten(obj[key], pre + key));
            } else {
                acc[pre + key] = obj[key];
            }
            return acc;
        }, {} as Record<string, any>);
    }
};

// ============================================
// CONDITIONAL LOGIC (n8n IF Node benzeri)
// ============================================

export const conditionalLogic = {
    // If-else
    ifElse: <T>(condition: boolean, ifTrue: T, ifFalse: T): T =>
        condition ? ifTrue : ifFalse,

    // Switch-case
    switchCase: <T>(value: any, cases: Record<string, T>, defaultCase: T): T =>
        cases[value] ?? defaultCase,

    // All conditions match
    allMatch: (conditions: boolean[]): boolean =>
        conditions.every(c => c),

    // Any condition matches
    anyMatch: (conditions: boolean[]): boolean =>
        conditions.some(c => c),

    // Compare values
    compare: (a: any, operator: string, b: any): boolean => {
        switch (operator) {
            case '==': return a == b;
            case '===': return a === b;
            case '!=': return a != b;
            case '!==': return a !== b;
            case '>': return a > b;
            case '>=': return a >= b;
            case '<': return a < b;
            case '<=': return a <= b;
            case 'contains': return String(a).includes(String(b));
            case 'startsWith': return String(a).startsWith(String(b));
            case 'endsWith': return String(a).endsWith(String(b));
            case 'matches': return new RegExp(b).test(String(a));
            default: return false;
        }
    }
};

// ============================================
// LOOP / FOREACH (n8n Loop Node benzeri)
// ============================================

export const loopOperations = {
    // For each item
    forEach: async <T>(items: T[], fn: (item: T, index: number) => Promise<void>): Promise<void> => {
        for (let i = 0; i < items.length; i++) {
            await fn(items[i], i);
        }
    },

    // Parallel execution
    parallel: async <T, U>(items: T[], fn: (item: T) => Promise<U>, concurrency: number = 5): Promise<U[]> => {
        const results: U[] = [];
        const chunks = [];

        for (let i = 0; i < items.length; i += concurrency) {
            chunks.push(items.slice(i, i + concurrency));
        }

        for (const chunk of chunks) {
            const chunkResults = await Promise.all(chunk.map(fn));
            results.push(...chunkResults);
        }

        return results;
    },

    // Retry with backoff
    retry: async <T>(fn: () => Promise<T>, maxAttempts: number = 3, delay: number = 1000): Promise<T> => {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, delay * attempt));
                }
            }
        }

        throw lastError;
    },

    // Delay
    delay: (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms))
};

export default {
    httpRequest,
    triggerWebhook,
    saveWebhook,
    getWebhooks,
    deleteWebhook,
    createWebhook,
    API_INTEGRATIONS,
    transformData,
    conditionalLogic,
    loopOperations
};
