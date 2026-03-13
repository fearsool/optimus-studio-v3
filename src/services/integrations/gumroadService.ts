
import { integrationManager } from '../integrationService';

const GUMROAD_API_URL = 'https://api.gumroad.com/v2/products';

export interface GumroadProduct {
    name: string;
    description: string;
    price_cents: number; // Gumroad uses cents
    url?: string;
    cover_url?: string;
    thumbnail_url?: string;
    file_info?: Blob;
    redirect_url?: string; // Custom field for our use case (in config)
}

export const gumroadService = {
    getAccessToken(): string | null {
        const integration = integrationManager.getIntegrations().find(i => i.type === 'gumroad');
        return integration?.isActive ? integration.credentials.accessToken : null;
    },

    async createProduct(product: GumroadProduct): Promise<{ id: string, short_url: string } | null> {
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

        } catch (error) {
            console.error('[Gumroad] Product creation failed:', error);
            return null;
        }
    }
};
