
import { Tool } from '../core/AgentCore';
import puppeteer, { Browser, Page } from 'puppeteer';

export class BrowserTool implements Tool {
    name = 'browser_action';
    description = 'Control a web browser to search, scrape, or take screenshots. Args: { action: "search" | "scrape" | "screenshot" | "click" | "type", url?: string, selector?: string, query?: string }';

    private browser: Browser | null = null;
    private page: Page | null = null;

    async execute(args: any): Promise<any> {
        if (!this.browser) {
            await this.initBrowser();
        }

        const { action, url, selector, query, text } = args;
        const page = this.page!;

        try {
            switch (action) {
                case 'search':
                    if (!query) throw new Error('Query is required for search');
                    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                    // Scrape top results
                    return await page.evaluate(() => {
                        const results: any[] = [];
                        document.querySelectorAll('.g').forEach((el, i) => {
                            if (i > 5) return;
                            const title = el.querySelector('h3')?.innerText;
                            const link = el.querySelector('a')?.href;
                            if (title && link) results.push({ title, link });
                        });
                        return results;
                    });

                case 'scrape':
                    if (!url) throw new Error('URL is required for scrape');
                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    // Remove clutter
                    await page.evaluate(() => {
                        document.querySelectorAll('script, style, nav, footer, iframe').forEach(e => e.remove());
                    });
                    const content = await page.evaluate(() => document.body.innerText.substring(0, 5000));
                    const title = await page.title();
                    return { title, content };

                case 'screenshot':
                    if (url) await page.goto(url, { waitUntil: 'networkidle0' });
                    const image = await page.screenshot({ encoding: 'base64' });
                    return { image: `data:image/png;base64,${image}` };

                case 'click':
                    if (!selector) throw new Error('Selector is required for click');
                    await page.click(selector);
                    return { success: true };

                case 'type':
                    if (!selector || !text) throw new Error('Selector and text required for type');
                    await page.type(selector, text);
                    return { success: true };

                default:
                    return { error: 'Unknown action. Supported: search, scrape, screenshot, click, type' };
            }
        } catch (error: any) {
            return { error: `Browser Error: ${error.message}` };
        }
    }

    private async initBrowser() {
        this.browser = await puppeteer.launch({
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
