"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchTool = void 0;
class WebSearchTool {
    // private googleApi = 'https://www.googleapis.com/customsearch/v1'; // To be implemented with API Key
    constructor() {
        this.name = 'web_search';
        this.description = 'Search the web for information using DuckDuckGo (native) or Google. Usage: { query: string, engine?: "ddg" | "google" }';
        this.duckDuckGoApi = 'https://duckduckgo.com/html/';
    }
    async execute(args) {
        if (!args.query) {
            throw new Error('Query argument is required');
        }
        const results = await this.search(args.query, args.engine);
        return JSON.stringify(results, null, 2);
    }
    // FIX: Actual search implementation interface
    async search(query, engine = 'ddg') {
        if (engine === 'ddg') {
            return await this.searchDuckDuckGo(query);
        }
        else {
            // Fallback to DDG for now until Google API key is set
            return await this.searchDuckDuckGo(query);
        }
    }
    async searchDuckDuckGo(query) {
        const searchUrl = `${this.duckDuckGoApi}?q=${encodeURIComponent(query)}`;
        console.log(`[WebSearchTool] Fetching: ${searchUrl}`);
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        const html = await response.text();
        // Simple regex-based parsing (as fallback to real HTML parser)
        const results = [];
        const resultPattern = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>/g;
        let match;
        while ((match = resultPattern.exec(html)) !== null && results.length < 5) {
            results.push({
                title: match[2].replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
                url: match[1],
                source: 'DuckDuckGo',
                snippet: 'Click to view content' // Snippet extraction is complex with regex, kept simple
            });
        }
        return results;
    }
    // FIX: Integration with Planner
    async researchAndSynthesize(topic) {
        const results = await this.search(topic);
        // In a real scenario, we would pass 'results' to an LLM here.
        // For this tool, we return the raw results for the AgentCore to synthesize.
        return `Found ${results.length} results for "${topic}":\n` +
            results.map(r => `- [${r.title}](${r.url})`).join('\n');
    }
}
exports.WebSearchTool = WebSearchTool;
