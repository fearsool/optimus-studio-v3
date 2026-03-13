"use strict";
// ============================================
// WEBHOOK & HTTP REQUEST SERVICE
// n8n benzeri HTTP işlemleri
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.loopOperations = exports.conditionalLogic = exports.transformData = exports.API_INTEGRATIONS = exports.createWebhook = exports.deleteWebhook = exports.getWebhooks = exports.saveWebhook = exports.triggerWebhook = exports.httpRequest = void 0;
// ============================================
// HTTP REQUEST (n8n HTTP Request Node benzeri)
// ============================================
const httpRequest = async (options) => {
    const { url, method = 'GET', headers = {}, body, timeout = 30000, responseType = 'json' } = options;
    const startTime = Date.now();
    console.log(`[HTTP] ${method} ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const fetchOptions = {
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
    }
    catch (error) {
        clearTimeout(timeoutId);
        console.error('[HTTP] Hata:', error);
        if (error.name === 'AbortError') {
            return { success: false, error: 'İstek zaman aşımına uğradı' };
        }
        return { success: false, error: error.message };
    }
};
exports.httpRequest = httpRequest;
// ============================================
// WEBHOOK TRIGGER (n8n Webhook Node benzeri)
// ============================================
const triggerWebhook = async (webhookUrl, payload, options = {}) => {
    return (0, exports.httpRequest)({
        url: webhookUrl,
        method: options.method || 'POST',
        headers: options.headers,
        body: payload
    });
};
exports.triggerWebhook = triggerWebhook;
// ============================================
// WEBHOOK KAYIT SİSTEMİ
// ============================================
const WEBHOOKS_STORAGE_KEY = 'omniflow_webhooks';
const saveWebhook = (webhook) => {
    const webhooks = (0, exports.getWebhooks)();
    const existingIndex = webhooks.findIndex(w => w.id === webhook.id);
    if (existingIndex >= 0) {
        webhooks[existingIndex] = webhook;
    }
    else {
        webhooks.push(webhook);
    }
    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks));
};
exports.saveWebhook = saveWebhook;
const getWebhooks = () => {
    const stored = localStorage.getItem(WEBHOOKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};
exports.getWebhooks = getWebhooks;
const deleteWebhook = (webhookId) => {
    const webhooks = (0, exports.getWebhooks)().filter(w => w.id !== webhookId);
    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks));
};
exports.deleteWebhook = deleteWebhook;
const createWebhook = (name) => {
    const webhook = {
        id: crypto.randomUUID(),
        name,
        url: `${window.location.origin}/webhook/${crypto.randomUUID()}`,
        method: 'POST',
        active: true,
        createdAt: Date.now(),
        triggerCount: 0
    };
    (0, exports.saveWebhook)(webhook);
    return webhook;
};
exports.createWebhook = createWebhook;
// ============================================
// POPÜLER API ENTEGRASYONLARI
// ============================================
exports.API_INTEGRATIONS = {
    // Sosyal Medya
    TELEGRAM: {
        sendMessage: (botToken, chatId, text) => (0, exports.httpRequest)({
            url: `https://api.telegram.org/bot${botToken}/sendMessage`,
            method: 'POST',
            body: { chat_id: chatId, text, parse_mode: 'HTML' }
        }),
        getUpdates: (botToken) => (0, exports.httpRequest)({
            url: `https://api.telegram.org/bot${botToken}/getUpdates`,
            method: 'GET'
        })
    },
    DISCORD: {
        sendMessage: (webhookUrl, content, embeds) => (0, exports.httpRequest)({
            url: webhookUrl,
            method: 'POST',
            body: { content, embeds }
        })
    },
    SLACK: {
        sendMessage: (webhookUrl, text, blocks) => (0, exports.httpRequest)({
            url: webhookUrl,
            method: 'POST',
            body: { text, blocks }
        })
    },
    // E-posta
    SENDGRID: {
        sendEmail: (apiKey, to, subject, html, from) => (0, exports.httpRequest)({
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
        appendRow: (apiKey, spreadsheetId, range, values) => (0, exports.httpRequest)({
            url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
            method: 'POST',
            body: { values: [values] }
        }),
        getValues: (apiKey, spreadsheetId, range) => (0, exports.httpRequest)({
            url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`,
            method: 'GET'
        })
    },
    AIRTABLE: {
        createRecord: (apiKey, baseId, tableName, fields) => (0, exports.httpRequest)({
            url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: { fields }
        }),
        getRecords: (apiKey, baseId, tableName) => (0, exports.httpRequest)({
            url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        })
    },
    // Ödeme
    STRIPE: {
        createPaymentIntent: (apiKey, amount, currency = 'try') => (0, exports.httpRequest)({
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
        chat: (apiKey, messages, model = 'gpt-4o-mini') => (0, exports.httpRequest)({
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
exports.transformData = {
    // JSON parse
    parseJSON: (text) => {
        try {
            return JSON.parse(text);
        }
        catch (_a) {
            return null;
        }
    },
    // JSON stringify
    stringify: (data) => JSON.stringify(data, null, 2),
    // Array map
    mapArray: (arr, fn) => arr.map(fn),
    // Array filter
    filterArray: (arr, fn) => arr.filter(fn),
    // Object pick
    pick: (obj, keys) => {
        const result = {};
        keys.forEach(key => { result[key] = obj[key]; });
        return result;
    },
    // Object omit
    omit: (obj, keys) => {
        const result = { ...obj };
        keys.forEach(key => { delete result[key]; });
        return result;
    },
    // Template string
    template: (str, data) => {
        return str.replace(/\{\{(\w+)\}\}/g, (_, key) => { var _a; return (_a = data[key]) !== null && _a !== void 0 ? _a : ''; });
    },
    // Flatten object
    flatten: (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const pre = prefix.length ? `${prefix}.` : '';
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(acc, exports.transformData.flatten(obj[key], pre + key));
            }
            else {
                acc[pre + key] = obj[key];
            }
            return acc;
        }, {});
    }
};
// ============================================
// CONDITIONAL LOGIC (n8n IF Node benzeri)
// ============================================
exports.conditionalLogic = {
    // If-else
    ifElse: (condition, ifTrue, ifFalse) => condition ? ifTrue : ifFalse,
    // Switch-case
    switchCase: (value, cases, defaultCase) => { var _a; return (_a = cases[value]) !== null && _a !== void 0 ? _a : defaultCase; },
    // All conditions match
    allMatch: (conditions) => conditions.every(c => c),
    // Any condition matches
    anyMatch: (conditions) => conditions.some(c => c),
    // Compare values
    compare: (a, operator, b) => {
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
exports.loopOperations = {
    // For each item
    forEach: async (items, fn) => {
        for (let i = 0; i < items.length; i++) {
            await fn(items[i], i);
        }
    },
    // Parallel execution
    parallel: async (items, fn, concurrency = 5) => {
        const results = [];
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
    retry: async (fn, maxAttempts = 3, delay = 1000) => {
        let lastError = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, delay * attempt));
                }
            }
        }
        throw lastError;
    },
    // Delay
    delay: (ms) => new Promise(r => setTimeout(r, ms))
};
exports.default = {
    httpRequest: exports.httpRequest,
    triggerWebhook: exports.triggerWebhook,
    saveWebhook: exports.saveWebhook,
    getWebhooks: exports.getWebhooks,
    deleteWebhook: exports.deleteWebhook,
    createWebhook: exports.createWebhook,
    API_INTEGRATIONS: exports.API_INTEGRATIONS,
    transformData: exports.transformData,
    conditionalLogic: exports.conditionalLogic,
    loopOperations: exports.loopOperations
};
