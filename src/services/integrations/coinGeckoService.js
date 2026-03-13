"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinGeckoService = void 0;
const BASE_URL = 'https://api.coingecko.com/api/v3';
exports.coinGeckoService = {
    /**
     * Get top market cap coins to spot trends
     */
    async getMarketTrends(limit = 10) {
        try {
            const response = await fetch(`${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`);
            if (!response.ok)
                throw new Error(`CoinGecko API Error: ${response.status}`);
            return await response.json();
        }
        catch (error) {
            console.error('CoinGecko Trend Error:', error);
            // Fallback mock data if rate limited
            return [
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin (Mock)', current_price: 64000, price_change_percentage_24h: 2.5, market_cap: 1000000 },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum (Mock)', current_price: 3400, price_change_percentage_24h: 1.2, market_cap: 500000 },
            ];
        }
    },
    /**
     * Get specific coin price
     */
    async getPrice(coinId) {
        var _a;
        try {
            const response = await fetch(`${BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`);
            const data = await response.json();
            return ((_a = data[coinId]) === null || _a === void 0 ? void 0 : _a.usd) || null;
        }
        catch (error) {
            console.error('CoinGecko Price Error:', error);
            return null;
        }
    },
    /**
     * Get trending search coins (Hype detection)
     */
    async getTrendingSearch() {
        try {
            const response = await fetch(`${BASE_URL}/search/trending`);
            const data = await response.json();
            return data.coins || [];
        }
        catch (error) {
            console.warn('CoinGecko Trending Error (Rate Limit?)');
            return [];
        }
    }
};
