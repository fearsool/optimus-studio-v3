"use strict";
/**
 * ☁️ SUPABASE CONNECTOR - Cloud Sync with Local-First Fallback
 * ============================================================
 * Optional cloud sync. Works offline, syncs when connected.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseConnector = exports.SupabaseConnector = void 0;
// =============== SUPABASE CONNECTOR CLASS ===============
class SupabaseConnector {
    constructor() {
        this.config = null;
        this.isConnected = false;
        this.pendingSync = [];
        this.loadConfig();
    }
    loadConfig() {
        // Load from environment
        const url = process.env.SUPABASE_URL;
        const anonKey = process.env.SUPABASE_ANON_KEY;
        if (url && anonKey) {
            this.config = { url, anonKey };
            this.isConnected = true;
        }
    }
    // =============== CONNECTION ===============
    configure(config) {
        this.config = config;
        this.isConnected = true;
    }
    isConfigured() {
        return this.config !== null;
    }
    async testConnection() {
        if (!this.config)
            return false;
        try {
            const response = await fetch(`${this.config.url}/rest/v1/`, {
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`
                }
            });
            this.isConnected = response.ok;
            return this.isConnected;
        }
        catch (_a) {
            this.isConnected = false;
            return false;
        }
    }
    // =============== SYNC OPERATIONS ===============
    async sync(table, data) {
        if (!this.config || !this.isConnected) {
            // Queue for later sync
            this.pendingSync.push({ table, data, timestamp: new Date() });
            return {
                success: false,
                recordsSynced: 0,
                errors: ['Not connected - queued for later sync'],
                lastSync: new Date()
            };
        }
        try {
            const response = await fetch(`${this.config.url}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }
            return {
                success: true,
                recordsSynced: data.length,
                errors: [],
                lastSync: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                recordsSynced: 0,
                errors: [error.message],
                lastSync: new Date()
            };
        }
    }
    async fetch(table, query) {
        if (!this.config)
            return [];
        let url = `${this.config.url}/rest/v1/${table}?select=*`;
        if (query) {
            for (const [key, value] of Object.entries(query)) {
                url += `&${key}=eq.${value}`;
            }
        }
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`
                }
            });
            if (!response.ok)
                return [];
            return await response.json();
        }
        catch (_a) {
            return [];
        }
    }
    async delete(table, query) {
        if (!this.config)
            return false;
        let url = `${this.config.url}/rest/v1/${table}?`;
        for (const [key, value] of Object.entries(query)) {
            url += `${key}=eq.${value}&`;
        }
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`
                }
            });
            return response.ok;
        }
        catch (_a) {
            return false;
        }
    }
    // =============== BACKUP & RESTORE ===============
    async backup(tables) {
        const backup = {};
        for (const table of tables) {
            backup[table] = await this.fetch(table);
        }
        return backup;
    }
    async restore(backup) {
        let totalRecords = 0;
        const errors = [];
        for (const [table, data] of Object.entries(backup)) {
            const result = await this.sync(table, data);
            if (result.success) {
                totalRecords += result.recordsSynced;
            }
            else {
                errors.push(...result.errors);
            }
        }
        return {
            success: errors.length === 0,
            recordsSynced: totalRecords,
            errors,
            lastSync: new Date()
        };
    }
    // =============== PENDING SYNC ===============
    async flushPendingSync() {
        const results = [];
        while (this.pendingSync.length > 0) {
            const item = this.pendingSync.shift();
            const result = await this.sync(item.table, item.data);
            results.push(result);
        }
        return results;
    }
    getPendingSyncCount() {
        return this.pendingSync.length;
    }
    // =============== REALTIME (OPTIONAL) ===============
    subscribe(table, callback) {
        if (!this.config) {
            console.warn('[SupabaseConnector] Not configured for realtime');
            return () => { };
        }
        // Note: Full realtime requires @supabase/supabase-js
        // This is a placeholder for the subscription pattern
        console.log(`[SupabaseConnector] Subscribe to ${table} - requires full Supabase client`);
        return () => {
            console.log(`[SupabaseConnector] Unsubscribe from ${table}`);
        };
    }
}
exports.SupabaseConnector = SupabaseConnector;
// =============== SINGLETON ===============
exports.supabaseConnector = new SupabaseConnector();
