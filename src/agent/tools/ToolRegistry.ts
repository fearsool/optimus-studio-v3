/**
 * 🔧 TOOL REGISTRY
 * ================
 * Tüm tool'ları merkezi olarak yönetir.
 * Yeni eklentiler (extensions) buraya kayıt olur.
 */

import { Tool as AgentTool } from '../core/AgentCore';
export type Tool = AgentTool;
import { FileTool } from './FileTool';
import { TerminalTool } from './TerminalTool';
import { BrowserTool } from './BrowserTool';
import { connectorTools } from './ConnectorTools';
import { WebSearchTool } from './WebSearchTool';

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    constructor(workspaceDir: string) {
        // Core Tools
        this.register(new FileTool(workspaceDir));
        this.register(new TerminalTool(workspaceDir));
        this.register(new BrowserTool());

        // Connector Tools (GitHub, Supabase, Netlify)
        // 🛡️ OFFLINE-FIRST POLICY: Disabled by default for stability
        const ENABLE_CLOUD_TOOLS = false;
        if (ENABLE_CLOUD_TOOLS) {
            this.register(connectorTools.github);
            this.register(connectorTools.supabase);
            this.register(connectorTools.netlify);
        }
        this.register(new WebSearchTool());

        console.log(`🔧 [ToolRegistry] Initialized with ${this.tools.size} tools`);
    }

    /**
     * Yeni tool kaydet
     */
    register(tool: Tool): void {
        this.tools.set(tool.name, tool);
        console.log(`   ✅ Registered: ${tool.name}`);
    }

    /**
     * Tool al
     */
    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * Tüm tool isimlerini listele (LLM'e vermek için)
     */
    listTools(): string[] {
        return Array.from(this.tools.keys());
    }

    /**
     * Tool açıklamalarını al (LLM context için)
     */
    getToolDescriptions(): string {
        let desc = 'Available Tools:\n';
        for (const [name, tool] of this.tools) {
            desc += `- ${name}: ${tool.description}\n`;
        }
        return desc;
    }

    /**
     * Tool çalıştır
     */
    async execute(toolName: string, args: any): Promise<any> {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        return tool.execute(args);
    }
}
