"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alphaVantageService = void 0;
const integrationService_1 = require("../integrationService");
const BASE_URL = 'https://www.alphavantage.co/query';
exports.alphaVantageService = {
    getApiKey() {
        var _a, _b;
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.ALPHAVANTAGE_API_KEY)) {
            return process.env.ALPHAVANTAGE_API_KEY;
        }
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'alphavantage');
        return ((_b = integration === null || integration === void 0 ? void 0 : integration.credentials) === null || _b === void 0 ? void 0 : _b.apiKey) || null;
    },
    /**
     * Get Real-time Quote for a Stock (e.g., IBM, AAPL)
     */
    async getStockQuote(symbol = 'IBM') {
        const apiKey = this.getApiKey();
        // Mock data if no key (for testing)
        if (!apiKey) {
            console.warn('[AlphaVantage] No API Key. Returning mock data for', symbol);
            return {
                symbol,
                price: 150.25 + (Math.random() * 5),
                change: 1.25,
                changePercent: '0.85%'
            };
        }
        try {
            const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data['Global Quote']) {
                const quote = data['Global Quote'];
                return {
                    symbol: quote['01. symbol'],
                    price: parseFloat(quote['05. price']),
                    change: parseFloat(quote['09. change']),
                    changePercent: quote['10. change percent']
                };
            }
            return null;
        }
        catch (error) {
            console.error('[AlphaVantage] Error:', error);
            return null;
        }
    },
    /**
     * Get Forex Exchange Rate (e.g., USD to EUR)
     */
    async getForexRate(from = 'USD', to = 'EUR') {
        const apiKey = this.getApiKey();
        if (!apiKey)
            return 0.92; // Mock
        try {
            const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data['Realtime Currency Exchange Rate']) {
                return parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
};
