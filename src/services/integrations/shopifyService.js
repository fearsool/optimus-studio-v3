"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyService = void 0;
const integrationService_1 = require("../integrationService");
const SHOPIFY_API_VERSION = '2024-01';
exports.shopifyService = {
    getCredentials() {
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'shopify');
        if (!integration || !integration.isActive)
            return null;
        return {
            shopName: integration.credentials.shopName,
            accessToken: integration.credentials.accessToken
        };
    },
    async createProduct(product) {
        const creds = this.getCredentials();
        if (!creds) {
            console.warn('[Shopify] Credentials missing or inactive');
            return null;
        }
        try {
            const url = `https://${creds.shopName}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/products.json`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': creds.accessToken
                },
                body: JSON.stringify({ product })
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Shopify API Error: ${err}`);
            }
            const data = await response.json();
            const created = data.product;
            return {
                id: created.id,
                handle: created.handle,
                url: `https://${creds.shopName}.myshopify.com/products/${created.handle}`
            };
        }
        catch (error) {
            console.error('[Shopify] Product creation failed:', error);
            return null;
        }
    }
};
