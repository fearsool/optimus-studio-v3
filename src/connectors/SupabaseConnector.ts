/**
 * ☁️ SUPABASE CONNECTOR - Cloud Sync with Local-First Fallback
 * ============================================================
 * Optional cloud sync. Works offline, syncs when connected.
 */

// =============== TYPES ===============
export interface SyncResult {
    success: boolean;
    recordsSynced: number;
    errors: string[];
    lastSync: Date;
}

export interface SupabaseConfig {
    url: string;
    anonKey: string;
    serviceKey?: string;
}

// =============== SUPABASE CONNECTOR CLASS ===============
export class SupabaseConnector {
    private config: SupabaseConfig | null = null;
    private isConnected: boolean = false;
    private pendingSync: any[] = [];

    constructor() {
        this.loadConfig();
    }

    private loadConfig(): void {
        // Load from environment
        const url = process.env.SUPABASE_URL;
        const anonKey = process.env.SUPABASE_ANON_KEY;

        if (url && anonKey) {
            this.config = { url, anonKey };
            this.isConnected = true;
        }
    }

    // =============== CONNECTION ===============

    configure(config: SupabaseConfig): void {
        this.config = config;
        this.isConnected = true;
    }

    isConfigured(): boolean {
        return this.config !== null;
    }

    async testConnection(): Promise<boolean> {
        if (!this.config) return false;

        try {
            const response = await fetch(`${this.config.url}/rest/v1/`, {
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`
                }
            });
            this.isConnected = response.ok;
            return this.isConnected;
        } catch {
            this.isConnected = false;
            return false;
        }
    }

    // =============== SYNC OPERATIONS ===============

    async sync(table: string, data: any[]): Promise<SyncResult> {
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
        } catch (error: any) {
            return {
                success: false,
                recordsSynced: 0,
                errors: [error.message],
                lastSync: new Date()
            };
        }
    }

    async fetch(table: string, query?: Record<string, any>): Promise<any[]> {
        if (!this.config) return [];

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

            if (!response.ok) return [];
            return await response.json();
        } catch {
            return [];
        }
    }

    async delete(table: string, query: Record<string, any>): Promise<boolean> {
        if (!this.config) return false;

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
        } catch {
            return false;
        }
    }

    // =============== BACKUP & RESTORE ===============

    async backup(tables: string[]): Promise<Record<string, any[]>> {
        const backup: Record<string, any[]> = {};

        for (const table of tables) {
            backup[table] = await this.fetch(table);
        }

        return backup;
    }

    async restore(backup: Record<string, any[]>): Promise<SyncResult> {
        let totalRecords = 0;
        const errors: string[] = [];

        for (const [table, data] of Object.entries(backup)) {
            const result = await this.sync(table, data);
            if (result.success) {
                totalRecords += result.recordsSynced;
            } else {
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

    async flushPendingSync(): Promise<SyncResult[]> {
        const results: SyncResult[] = [];

        while (this.pendingSync.length > 0) {
            const item = this.pendingSync.shift();
            const result = await this.sync(item.table, item.data);
            results.push(result);
        }

        return results;
    }

    getPendingSyncCount(): number {
        return this.pendingSync.length;
    }

    // =============== REALTIME (OPTIONAL) ===============

    subscribe(table: string, callback: (payload: any) => void): () => void {
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

// =============== SINGLETON ===============
export const supabaseConnector = new SupabaseConnector();
