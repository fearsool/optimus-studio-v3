"use strict";
/**
 * 🔧 TOOL REGISTRY
 * ================
 * Tüm tool'ları merkezi olarak yönetir.
 * Yeni eklentiler (extensions) buraya kayıt olur.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
const FileTool_1 = require("./FileTool");
const TerminalTool_1 = require("./TerminalTool");
const BrowserTool_1 = require("./BrowserTool");
const ConnectorTools_1 = require("./ConnectorTools");
const WebSearchTool_1 = require("./WebSearchTool");
class ToolRegistry {
    constructor(workspaceDir) {
        this.tools = new Map();
        // Core Tools
        this.register(new FileTool_1.FileTool(workspaceDir));
        this.register(new TerminalTool_1.TerminalTool(workspaceDir));
        this.register(new BrowserTool_1.BrowserTool());
        // Connector Tools (GitHub, Supabase, Netlify)
        // 🛡️ OFFLINE-FIRST POLICY: Disabled by default for stability
        const ENABLE_CLOUD_TOOLS = false;
        if (ENABLE_CLOUD_TOOLS) {
            this.register(ConnectorTools_1.connectorTools.github);
            this.register(ConnectorTools_1.connectorTools.supabase);
            this.register(ConnectorTools_1.connectorTools.netlify);
        }
        this.register(new WebSearchTool_1.WebSearchTool());
        console.log(`🔧 [ToolRegistry] Initialized with ${this.tools.size} tools`);
    }
    /**
     * Yeni tool kaydet
     */
    register(tool) {
        this.tools.set(tool.name, tool);
        console.log(`   ✅ Registered: ${tool.name}`);
    }
    /**
     * Tool al
     */
    get(name) {
        return this.tools.get(name);
    }
    /**
     * Tüm tool isimlerini listele (LLM'e vermek için)
     */
    listTools() {
        return Array.from(this.tools.keys());
    }
    /**
     * Tool açıklamalarını al (LLM context için)
     */
    getToolDescriptions() {
        let desc = 'Available Tools:\n';
        for (const [name, tool] of this.tools) {
            desc += `- ${name}: ${tool.description}\n`;
        }
        return desc;
    }
    /**
     * Tool çalıştır
     */
    async execute(toolName, args) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        return tool.execute(args);
    }
}
exports.ToolRegistry = ToolRegistry;
