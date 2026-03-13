"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserTool = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class BrowserTool {
    constructor() {
        this.name = 'browser_action';
        this.description = 'Control a web browser to search, scrape, or take screenshots. Args: { action: "search" | "scrape" | "screenshot" | "click" | "type", url?: string, selector?: string, query?: string }';
        this.browser = null;
        this.page = null;
    }
    async execute(args) {
        if (!this.browser) {
            await this.initBrowser();
        }
        const { action, url, selector, query, text } = args;
        const page = this.page;
        try {
            switch (action) {
                case 'search':
                    if (!query)
                        throw new Error('Query is required for search');
                    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                    // Scrape top results
                    return await page.evaluate(() => {
                        const results = [];
                        document.querySelectorAll('.g').forEach((el, i) => {
                            var _a, _b;
                            if (i > 5)
                                return;
                            const title = (_a = el.querySelector('h3')) === null || _a === void 0 ? void 0 : _a.innerText;
                            const link = (_b = el.querySelector('a')) === null || _b === void 0 ? void 0 : _b.href;
                            if (title && link)
                                results.push({ title, link });
                        });
                        return results;
                    });
                case 'scrape':
                    if (!url)
                        throw new Error('URL is required for scrape');
                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    // Remove clutter
                    await page.evaluate(() => {
                        document.querySelectorAll('script, style, nav, footer, iframe').forEach(e => e.remove());
                    });
                    const content = await page.evaluate(() => document.body.innerText.substring(0, 5000));
                    const title = await page.title();
                    return { title, content };
                case 'screenshot':
                    if (url)
                        await page.goto(url, { waitUntil: 'networkidle0' });
                    const image = await page.screenshot({ encoding: 'base64' });
                    return { image: `data:image/png;base64,${image}` };
                case 'click':
                    if (!selector)
                        throw new Error('Selector is required for click');
                    await page.click(selector);
                    return { success: true };
                case 'type':
                    if (!selector || !text)
                        throw new Error('Selector and text required for type');
                    await page.type(selector, text);
                    return { success: true };
                default:
                    return { error: 'Unknown action. Supported: search, scrape, screenshot, click, type' };
            }
        }
        catch (error) {
            return { error: `Browser Error: ${error.message}` };
        }
    }
    async initBrowser() {
        this.browser = await puppeteer_1.default.launch({
            headless: true, // Visible? Maybe user wants to see it? User said "Chrome açıp". 
            // But headless is faster. Let's start headless.
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 800 });
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
exports.BrowserTool = BrowserTool;
