"use strict";
/**
 * 🔗 CONNECTOR TOOLS - External Service Integration Tools
 * =======================================================
 * Tools for GitHub, Supabase, and Netlify operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorTools = exports.NetlifyTool = exports.SupabaseTool = exports.GitHubTool = void 0;
const GitHubConnector_1 = require("../../connectors/GitHubConnector");
const SupabaseConnector_1 = require("../../connectors/SupabaseConnector");
const NetlifyConnector_1 = require("../../connectors/NetlifyConnector");
// =============== GITHUB TOOL ===============
class GitHubTool {
    constructor() {
        this.name = 'github';
        this.description = 'Git operations: status, add, commit, push, pull, clone';
    }
    async execute(args) {
        const { action, ...params } = args;
        switch (action) {
            case 'status':
                return await GitHubConnector_1.githubConnector.getStatus();
            case 'add':
                await GitHubConnector_1.githubConnector.add(params.files || 'all');
                return { success: true, message: 'Files staged' };
            case 'commit':
                const hash = await GitHubConnector_1.githubConnector.commit(params.message || 'Auto-commit from Optimus');
                return { success: true, hash };
            case 'push':
                await GitHubConnector_1.githubConnector.push(params.remote, params.branch);
                return { success: true, message: 'Pushed to remote' };
            case 'pull':
                await GitHubConnector_1.githubConnector.pull(params.remote, params.branch);
                return { success: true, message: 'Pulled from remote' };
            case 'clone':
                await GitHubConnector_1.githubConnector.clone(params.repo, params.path);
                return { success: true, message: `Cloned ${params.repo}` };
            case 'quick-push':
                await GitHubConnector_1.githubConnector.add('all');
                const commitHash = await GitHubConnector_1.githubConnector.commit(params.message || 'Quick push from Optimus');
                await GitHubConnector_1.githubConnector.push();
                return { success: true, hash: commitHash };
            case 'log':
                return await GitHubConnector_1.githubConnector.getLog(params.limit || 10);
            case 'branches':
                return await GitHubConnector_1.githubConnector.getBranches();
            case 'create-branch':
                await GitHubConnector_1.githubConnector.createBranch(params.name, params.checkout !== false);
                return { success: true, branch: params.name };
            default:
                throw new Error(`Unknown GitHub action: ${action}`);
        }
    }
}
exports.GitHubTool = GitHubTool;
// =============== SUPABASE TOOL ===============
class SupabaseTool {
    constructor() {
        this.name = 'supabase';
        this.description = 'Cloud sync: sync data, fetch records, backup/restore';
    }
    async execute(args) {
        const { action, ...params } = args;
        switch (action) {
            case 'sync':
                return await SupabaseConnector_1.supabaseConnector.sync(params.table, params.data);
            case 'fetch':
                return await SupabaseConnector_1.supabaseConnector.fetch(params.table, params.query);
            case 'delete':
                const deleted = await SupabaseConnector_1.supabaseConnector.delete(params.table, params.query);
                return { success: deleted };
            case 'backup':
                return await SupabaseConnector_1.supabaseConnector.backup(params.tables);
            case 'restore':
                return await SupabaseConnector_1.supabaseConnector.restore(params.backup);
            case 'test':
                const connected = await SupabaseConnector_1.supabaseConnector.testConnection();
                return { connected };
            case 'pending-count':
                return { count: SupabaseConnector_1.supabaseConnector.getPendingSyncCount() };
            case 'flush-pending':
                return await SupabaseConnector_1.supabaseConnector.flushPendingSync();
            default:
                throw new Error(`Unknown Supabase action: ${action}`);
        }
    }
}
exports.SupabaseTool = SupabaseTool;
// =============== NETLIFY TOOL ===============
class NetlifyTool {
    constructor() {
        this.name = 'netlify';
        this.description = 'Deploy: deploy site, check build status, list sites';
    }
    async execute(args) {
        const { action, ...params } = args;
        switch (action) {
            case 'deploy':
                return await NetlifyConnector_1.netlifyConnector.deploy(params.path, {
                    production: params.production || false,
                    useCli: params.useCli !== false
                });
            case 'deploy-prod':
                return await NetlifyConnector_1.netlifyConnector.deploy(params.path, {
                    production: true,
                    useCli: true
                });
            case 'list-sites':
                return await NetlifyConnector_1.netlifyConnector.listSites();
            case 'create-site':
                return await NetlifyConnector_1.netlifyConnector.createSite(params.name);
            case 'get-site':
                return await NetlifyConnector_1.netlifyConnector.getSite(params.siteId);
            case 'build-status':
                return await NetlifyConnector_1.netlifyConnector.getBuildStatus(params.deployId);
            default:
                throw new Error(`Unknown Netlify action: ${action}`);
        }
    }
}
exports.NetlifyTool = NetlifyTool;
// =============== EXPORT ALL ===============
exports.connectorTools = {
    github: new GitHubTool(),
    supabase: new SupabaseTool(),
    netlify: new NetlifyTool()
};
