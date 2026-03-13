
import { integrationManager } from '../integrationService';

const SHOPIFY_API_VERSION = '2024-01';

export interface ShopifyProduct {
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    tags: string;
    variants: {
        price: string;
        sku: string;
        inventory_management: 'shopify' | null;
        inventory_policy: 'continue' | 'deny';
    }[];
    images: { src: string }[];
}

export const shopifyService = {
    getCredentials() {
        const integration = integrationManager.getIntegrations().find(i => i.type === 'shopify');
        if (!integration || !integration.isActive) return null;
        return {
            shopName: integration.credentials.shopName,
            accessToken: integration.credentials.accessToken
        };
    },

    async createProduct(product: ShopifyProduct): Promise<{ id: string, handle: string, url: string } | null> {
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

        } catch (error) {
            console.error('[Shopify] Product creation failed:', error);
            return null;
        }
    }
};
