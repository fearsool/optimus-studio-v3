/**
 * 🔌 CONNECTORS INDEX - Unified External Service Access
 * =====================================================
 * All external connections in one place.
 */

export { GitHubConnector, githubConnector } from './GitHubConnector';
export { SupabaseConnector, supabaseConnector } from './SupabaseConnector';
export { NetlifyConnector, netlifyConnector } from './NetlifyConnector';

// =============== CONNECTOR MANAGER ===============
export interface ConnectorStatus {
    name: string;
    isConfigured: boolean;
    isConnected: boolean;
    lastCheck: Date;
}

export class ConnectorManager {
    async getStatus(): Promise<ConnectorStatus[]> {
        const { githubConnector } = await import('./GitHubConnector');
        const { supabaseConnector } = await import('./SupabaseConnector');
        const { netlifyConnector } = await import('./NetlifyConnector');

        const now = new Date();

        return [
            {
                name: 'GitHub',
                isConfigured: true, // Git is always available locally
                isConnected: await githubConnector.isGitRepo(),
                lastCheck: now
            },
            {
                name: 'Supabase',
                isConfigured: supabaseConnector.isConfigured(),
                isConnected: await supabaseConnector.testConnection(),
                lastCheck: now
            },
            {
                name: 'Netlify',
                isConfigured: netlifyConnector.isConfigured(),
                isConnected: netlifyConnector.isConfigured(),
                lastCheck: now
            }
        ];
    }

    async quickPush(message: string): Promise<boolean> {
        const { githubConnector } = await import('./GitHubConnector');
        try {
            await githubConnector.add('all');
            await githubConnector.commit(message);
            await githubConnector.push();
            return true;
        } catch {
            return false;
        }
    }

    async quickDeploy(sitePath: string): Promise<boolean> {
        const { netlifyConnector } = await import('./NetlifyConnector');
        const result = await netlifyConnector.deploy(sitePath, { production: true });
        return result.success;
    }

    async quickSync(table: string, data: any[]): Promise<boolean> {
        const { supabaseConnector } = await import('./SupabaseConnector');
        const result = await supabaseConnector.sync(table, data);
        return result.success;
    }
}

export const connectorManager = new ConnectorManager();
