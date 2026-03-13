"use strict";
/**
 * 🔌 CONNECTORS INDEX - Unified External Service Access
 * =====================================================
 * All external connections in one place.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorManager = exports.ConnectorManager = exports.netlifyConnector = exports.NetlifyConnector = exports.supabaseConnector = exports.SupabaseConnector = exports.githubConnector = exports.GitHubConnector = void 0;
var GitHubConnector_1 = require("./GitHubConnector");
Object.defineProperty(exports, "GitHubConnector", { enumerable: true, get: function () { return GitHubConnector_1.GitHubConnector; } });
Object.defineProperty(exports, "githubConnector", { enumerable: true, get: function () { return GitHubConnector_1.githubConnector; } });
var SupabaseConnector_1 = require("./SupabaseConnector");
Object.defineProperty(exports, "SupabaseConnector", { enumerable: true, get: function () { return SupabaseConnector_1.SupabaseConnector; } });
Object.defineProperty(exports, "supabaseConnector", { enumerable: true, get: function () { return SupabaseConnector_1.supabaseConnector; } });
var NetlifyConnector_1 = require("./NetlifyConnector");
Object.defineProperty(exports, "NetlifyConnector", { enumerable: true, get: function () { return NetlifyConnector_1.NetlifyConnector; } });
Object.defineProperty(exports, "netlifyConnector", { enumerable: true, get: function () { return NetlifyConnector_1.netlifyConnector; } });
class ConnectorManager {
    async getStatus() {
        const { githubConnector } = await Promise.resolve().then(() => __importStar(require('./GitHubConnector')));
        const { supabaseConnector } = await Promise.resolve().then(() => __importStar(require('./SupabaseConnector')));
        const { netlifyConnector } = await Promise.resolve().then(() => __importStar(require('./NetlifyConnector')));
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
    async quickPush(message) {
        const { githubConnector } = await Promise.resolve().then(() => __importStar(require('./GitHubConnector')));
        try {
            await githubConnector.add('all');
            await githubConnector.commit(message);
            await githubConnector.push();
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async quickDeploy(sitePath) {
        const { netlifyConnector } = await Promise.resolve().then(() => __importStar(require('./NetlifyConnector')));
        const result = await netlifyConnector.deploy(sitePath, { production: true });
        return result.success;
    }
    async quickSync(table, data) {
        const { supabaseConnector } = await Promise.resolve().then(() => __importStar(require('./SupabaseConnector')));
        const result = await supabaseConnector.sync(table, data);
        return result.success;
    }
}
exports.ConnectorManager = ConnectorManager;
exports.connectorManager = new ConnectorManager();
