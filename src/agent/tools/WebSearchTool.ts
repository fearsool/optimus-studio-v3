
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: 'google' | 'duckduckgo' | 'bing';
    relevance: number;
    timestamp: Date;
}

export class WebSearchTool {
    public name = 'web_search';
    public description = 'Search the web for information using Google or DuckDuckGo.';

    private googleApiKey?: string;
    private googleSearchEngineId?: string;
    private cache = new Map<string, { results: SearchResult[]; timestamp: number }>();

    constructor() {
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    }

    async execute(args: { query: string; numResults?: number }): Promise<any> {
        return this.search(args.query, { numResults: args.numResults });
    }

    async search(
        query: string,
        options?: {
            numResults?: number;
            useGoogle?: boolean;
            useDuckDuckGo?: boolean;
            timeout?: number;
        }
    ): Promise<SearchResult[]> {
        console.log(`🔍 Arama: "${query}"`);

        const numResults = options?.numResults || 10;
        const timeout = options?.timeout || 10000;

        // Cache kontrolü
        const cacheKey = `search:${query}:${numResults}`;
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1 saat cache
            console.log('📦 Cache\'ten yüklendi');
            return cached.results;
        }

        const results: SearchResult[] = [];
        const promises = [];

        // Google arama
        if (options?.useGoogle !== false && this.googleApiKey && this.googleSearchEngineId) {
            promises.push(
                this.searchGoogle(query, Math.min(numResults, 10), timeout)
                    .catch(error => {
                        console.warn('Google arama başarısız:', error.message);
                        return [];
                    })
            );
        }

        // DuckDuckGo arama (Fallback)
        if (options?.useDuckDuckGo !== false) {
            promises.push(
                this.searchDuckDuckGo(query, numResults, timeout)
                    .catch(error => {
                        console.warn('DuckDuckGo arama başarısız:', error.message);
                        return [];
                    })
            );
        }

        // Tüm aramaları paralel yap
        const allResults = await Promise.all(promises);
        allResults.flat().forEach(result => results.push(result));

        // Tekilleştir ve sırala
        const finalResults = this.deduplicateAndSort(results, numResults);

        // Cache'e kaydet
        this.cache.set(cacheKey, { results: finalResults, timestamp: Date.now() });

        return finalResults;
    }

    private async searchGoogle(
        query: string,
        numResults: number,
        timeout: number
    ): Promise<SearchResult[]> {
        const url = 'https://www.googleapis.com/customsearch/v1';

        try {
            const response = await axios.get(url, {
                params: {
                    key: this.googleApiKey,
                    cx: this.googleSearchEngineId,
                    q: query,
                    num: numResults,
                    lr: 'lang_tr',
                    gl: 'tr',
                    safe: 'active'
                },
                timeout
            });

            if (!response.data.items) {
                return [];
            }

            return response.data.items.map((item: any, index: number) => ({
                title: item.title,
                url: item.link,
                snippet: item.snippet,
                source: 'google',
                relevance: 1 - (index * 0.05), // Sıraya göre azalan relevance
                timestamp: new Date()
            }));

        } catch (error) {
            // console.error('Google API hatası:', error);
            throw error;
        }
    }

    private async searchDuckDuckGo(
        query: string,
        numResults: number,
        timeout: number
    ): Promise<SearchResult[]> {
        const url = 'https://html.duckduckgo.com/html/';

        try {
            // DDG HTML search is often blocked or requires minimal headers
            const response = await axios.post(url, `q=${encodeURIComponent(query)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout
            });

            const $ = cheerio.load(response.data);
            const results: SearchResult[] = [];

            $('.result').each((index, element) => {
                if (results.length >= numResults) return false;

                const title = $(element).find('.result__title').text().trim();
                const url = $(element).find('.result__url').attr('href');
                const snippet = $(element).find('.result__snippet').text().trim();

                if (title && url && snippet && !url.includes('duckduckgo.com/y.js')) {
                    let cleanUrl = url;
                    if (url.startsWith('//')) cleanUrl = 'https:' + url;

                    results.push({
                        title,
                        url: cleanUrl,
                        snippet,
                        source: 'duckduckgo',
                        relevance: 0.9 - (index * 0.1),
                        timestamp: new Date()
                    });
                }
            });

            return results;

        } catch (error) {
            // console.error('DuckDuckGo hatası:', error);
            throw error;
        }
    }

    private deduplicateAndSort(results: SearchResult[], limit: number): SearchResult[] {
        const seen = new Set<string>();
        const uniqueResults: SearchResult[] = [];

        for (const result of results) {
            const key = result.url.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(result);
            }
        }

        uniqueResults.sort((a, b) => b.relevance - a.relevance);
        return uniqueResults.slice(0, limit);
    }

    async fetchPageContent(url: string): Promise<{
        title: string;
        content: string;
        mainText: string;
        links: string[];
    }> {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            $('script, style, nav, footer, header').remove();

            const title = $('title').text() || $('h1').first().text() || url;

            let mainText = '';
            const selectors = ['article', 'main', '.post-content', '.article-content', '#content'];
            for (const selector of selectors) {
                const element = $(selector).first();
                if (element.length && element.text().length > 500) {
                    mainText = element.text();
                    break;
                }
            }

            if (!mainText) {
                const paragraphs: string[] = [];
                $('p').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 100) paragraphs.push(text);
                });
                mainText = paragraphs.slice(0, 10).join('\n\n');
            }

            const links: string[] = [];
            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('http')) links.push(href);
            });

            return {
                title: this.cleanText(title),
                content: response.data.substring(0, 50000),
                mainText: this.cleanText(mainText),
                links: [...new Set(links)].slice(0, 50)
            };

        } catch (error) {
            console.error('Sayfa getirme hatası:', error);
            throw error;
        }
    }

    private cleanText(text: string): string {
        return text.replace(/\s+/g, ' ').replace(/[\r\n]+/g, '\n').trim();
    }

    clearCache(): void {
        this.cache.clear();
        console.log('🧹 Arama cache\'i temizlendi');
    }
}
