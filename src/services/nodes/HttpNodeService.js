"use strict";
// import { UniversalHttpNodeConfig } from '../../types/UniversalHttpNode';
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpNodeService = exports.HttpNodeService = void 0;
/**
 * Universal HTTP Node Executor
 * Handles strict HTTP requests with advanced auth and resilience.
 * NOTE: In production (Phase 4), this runs on Supabase Edge Functions.
 */
class HttpNodeService {
    /**
     * Executes the HTTP request based on configuration.
     */
    async execute(config, context = {}) {
        console.log(`[HttpNode] Executing ${config.method} ${config.url}`);
        // 1. Interpolate Variables (e.g. {{userId}})
        const url = this.interpolate(config.url, context);
        const headers = this.interpolateHeaders(config.headers, context);
        const body = config.body ? this.interpolateBody(config.body, context) : undefined;
        // 2. Prepare Auth Headers
        if (config.auth.type !== 'none') {
            await this.injectAuth(headers, config.auth);
        }
        // 3. Execute Fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);
        try {
            const response = await fetch(url, {
                method: config.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: config.method !== 'GET' && body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            // 4. Handle Response
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            // 5. Apply Response Mapping
            return this.mapResponse(data, config.responseMapping);
        }
        catch (error) {
            console.error('[HttpNode] Execution Failed:', error);
            throw error;
        }
    }
    interpolate(text, context) {
        return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
            return context[key.trim()] || `{{${key}}}`;
        });
    }
    interpolateHeaders(headers, context) {
        const result = {};
        for (const [key, value] of Object.entries(headers)) {
            result[key] = this.interpolate(value, context);
        }
        return result;
    }
    interpolateBody(body, context) {
        if (typeof body === 'string')
            return this.interpolate(body, context);
        if (typeof body === 'object') {
            // Deep clone and interpolate
            const str = JSON.stringify(body);
            return JSON.parse(this.interpolate(str, context));
        }
        return body;
    }
    async injectAuth(headers, auth) {
        // In Phase 1 we implemented Credential Vault. 
        // Here we would fetch the decrypted secret.
        // For now, handling basics:
        if (auth.type === 'bearer' && auth.token) {
            headers['Authorization'] = `Bearer ${auth.token}`;
        }
        if (auth.type === 'basic' && auth.username && auth.password) {
            const encoded = btoa(`${auth.username}:${auth.password}`);
            headers['Authorization'] = `Basic ${encoded}`;
        }
        if (auth.type === 'apiKey' && auth.apiKeyHeader && auth.apiKeyValue) {
            headers[auth.apiKeyHeader] = auth.apiKeyValue;
        }
    }
    mapResponse(data, mapping) {
        if (!mapping || !mapping.pick)
            return data;
        // Simple pick logic (e.g. "data.users")
        const picked = mapping.pick.split('.').reduce((acc, curr) => acc && acc[curr], data);
        if (mapping.as) {
            return { [mapping.as]: picked };
        }
        return picked;
    }
}
exports.HttpNodeService = HttpNodeService;
exports.httpNodeService = new HttpNodeService();
