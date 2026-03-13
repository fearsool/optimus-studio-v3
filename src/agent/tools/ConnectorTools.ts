/**
 * 🔗 CONNECTOR TOOLS - External Service Integration Tools
 * =======================================================
 * Tools for GitHub, Supabase, and Netlify operations.
 */

import { Tool } from '../core/AgentCore';
import { githubConnector } from '../../connectors/GitHubConnector';
import { supabaseConnector } from '../../connectors/SupabaseConnector';
import { netlifyConnector } from '../../connectors/NetlifyConnector';

// =============== GITHUB TOOL ===============
export class GitHubTool implements Tool {
    name = 'github';
    description = 'Git operations: status, add, commit, push, pull, clone';

    async execute(args: { action: string;[key: string]: any }): Promise<any> {
        const { action, ...params } = args;

        switch (action) {
            case 'status':
                return await githubConnector.getStatus();

            case 'add':
                await githubConnector.add(params.files || 'all');
                return { success: true, message: 'Files staged' };

            case 'commit':
                const hash = await githubConnector.commit(params.message || 'Auto-commit from Optimus');
                return { success: true, hash };

            case 'push':
                await githubConnector.push(params.remote, params.branch);
                return { success: true, message: 'Pushed to remote' };

            case 'pull':
                await githubConnector.pull(params.remote, params.branch);
                return { success: true, message: 'Pulled from remote' };

            case 'clone':
                await githubConnector.clone(params.repo, params.path);
                return { success: true, message: `Cloned ${params.repo}` };

            case 'quick-push':
                await githubConnector.add('all');
                const commitHash = await githubConnector.commit(params.message || 'Quick push from Optimus');
                await githubConnector.push();
                return { success: true, hash: commitHash };

            case 'log':
                return await githubConnector.getLog(params.limit || 10);

            case 'branches':
                return await githubConnector.getBranches();

            case 'create-branch':
                await githubConnector.createBranch(params.name, params.checkout !== false);
                return { success: true, branch: params.name };

            default:
                throw new Error(`Unknown GitHub action: ${action}`);
        }
    }
}

// =============== SUPABASE TOOL ===============
export class SupabaseTool implements Tool {
    name = 'supabase';
    description = 'Cloud sync: sync data, fetch records, backup/restore';

    async execute(args: { action: string;[key: string]: any }): Promise<any> {
        const { action, ...params } = args;

        switch (action) {
            case 'sync':
                return await supabaseConnector.sync(params.table, params.data);

            case 'fetch':
                return await supabaseConnector.fetch(params.table, params.query);

            case 'delete':
                const deleted = await supabaseConnector.delete(params.table, params.query);
                return { success: deleted };

            case 'backup':
                return await supabaseConnector.backup(params.tables);

            case 'restore':
                return await supabaseConnector.restore(params.backup);

            case 'test':
                const connected = await supabaseConnector.testConnection();
                return { connected };

            case 'pending-count':
                return { count: supabaseConnector.getPendingSyncCount() };

            case 'flush-pending':
                return await supabaseConnector.flushPendingSync();

            default:
                throw new Error(`Unknown Supabase action: ${action}`);
        }
    }
}

// =============== NETLIFY TOOL ===============
export class NetlifyTool implements Tool {
    name = 'netlify';
    description = 'Deploy: deploy site, check build status, list sites';

    async execute(args: { action: string;[key: string]: any }): Promise<any> {
        const { action, ...params } = args;

        switch (action) {
            case 'deploy':
                return await netlifyConnector.deploy(params.path, {
                    production: params.production || false,
                    useCli: params.useCli !== false
                });

            case 'deploy-prod':
                return await netlifyConnector.deploy(params.path, {
                    production: true,
                    useCli: true
                });

            case 'list-sites':
                return await netlifyConnector.listSites();

            case 'create-site':
                return await netlifyConnector.createSite(params.name);

            case 'get-site':
                return await netlifyConnector.getSite(params.siteId);

            case 'build-status':
                return await netlifyConnector.getBuildStatus(params.deployId);

            default:
                throw new Error(`Unknown Netlify action: ${action}`);
        }
    }
}

// =============== EXPORT ALL ===============
export const connectorTools = {
    github: new GitHubTool(),
    supabase: new SupabaseTool(),
    netlify: new NetlifyTool()
};
