"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gumroadService = void 0;
const integrationService_1 = require("../integrationService");
const GUMROAD_API_URL = 'https://api.gumroad.com/v2/products';
exports.gumroadService = {
    getAccessToken() {
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'gumroad');
        return (integration === null || integration === void 0 ? void 0 : integration.isActive) ? integration.credentials.accessToken : null;
    },
    async createProduct(product) {
        const token = this.getAccessToken();
        if (!token) {
            console.warn('[Gumroad] Access token missing');
            return null;
        }
        try {
            // Gumroad API mostly receives form-data for files, but JSON is cleaner for simple products
            // However, Gumroad expects data in query params or form-data for POST usually.
            // Let's use URLSearchParams for compatibility if no file, or FormData if file.
            const params = new URLSearchParams();
            params.append('access_token', token);
            params.append('name', product.name);
            params.append('description', product.description);
            params.append('price_cents', product.price_cents.toString());
            // Note: Gumroad URL is immutable in API mostly, but we create a new one.
            const response = await fetch(GUMROAD_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Gumroad API Error: ${err}`);
            }
            const data = await response.json();
            const created = data.product;
            return {
                id: created.id,
                short_url: created.short_url
            };
        }
        catch (error) {
            console.error('[Gumroad] Product creation failed:', error);
            return null;
        }
    }
};
