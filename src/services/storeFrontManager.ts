
import { SystemBlueprint, TestBadge } from '../types';
import { salesPackageService } from './salesPackageService';
import { shopifyService } from './integrations/shopifyService';
import { gumroadService } from './integrations/gumroadService';

export interface PublishResult {
    success: boolean;
    shopifyUrl?: string;
    gumroadUrl?: string;
    logs: string[];
}

export const storeFrontManager = {
    /**
     * Publishes an automation to both Shopify (Sales) and Gumroad (Showcase)
     */
    async publishAutomation(blueprint: SystemBlueprint, testBadge: TestBadge): Promise<PublishResult> {
        const logs: string[] = [];
        logs.push(`🚀 Starting StoreFront Auto-Publish for: ${blueprint.name}`);

        try {
            // 1. Generate Sales Assets (AI + Fal.ai)
            logs.push('📦 Generating sales assets (Cover, Copy, Pricing)...');
            const pkg = await salesPackageService.generateSalesPackage(blueprint, testBadge, {
                generateCover: true,
                priceRange: 'high', // Premium pricing for automations
                language: 'tr' // Default to Turkish as requested
            });
            logs.push(`✅ Assets generated: ${pkg.title} / $${pkg.suggestedPrice}`);

            // 2. Publish to Shopify (Primary Store)
            logs.push('🛍️ Publishing to Shopify...');
            const shopifyProduct = await shopifyService.createProduct({
                title: pkg.title,
                body_html: pkg.description.replace(/\n/g, '<br>'),
                vendor: 'OmniFlow Factory',
                product_type: 'Automation',
                tags: `automation, ai, ${blueprint.category}`,
                images: pkg.coverImageUrl ? [{ src: pkg.coverImageUrl }] : [],
                variants: [{
                    price: pkg.suggestedPrice.toString(),
                    sku: `AUTO-${Date.now()}`,
                    inventory_management: null, // Unlimited digital product
                    inventory_policy: 'continue'
                }]
            });

            if (!shopifyProduct) {
                throw new Error('Shopify publishing failed.');
            }
            logs.push(`✅ Shopify Product Active: ${shopifyProduct.url}`);

            // 3. Publish to Gumroad (Showcase / Redirect)
            logs.push('🏪 Building Gumroad Showcase...');

            // Modify description for Gumroad to include REDIRECT CTA
            const showcaseDescription = `
            ${pkg.description}

            ================================================
            ⚠️ BU ÜRÜNÜ WEB SİTEMİZDEN SATIN ALIN! ⚠️
            
            Daha düşük komisyon ve anında teslimat için:
            👉 ${shopifyProduct.url}
            👉 ${shopifyProduct.url}
            ================================================
            `;

            const gumroadProduct = await gumroadService.createProduct({
                name: pkg.title,
                description: showcaseDescription,
                price_cents: pkg.suggestedPrice * 100, // Gumroad uses cents
                url: `showcase-${Date.now()}`, // Custom slug
                redirect_url: shopifyProduct.url // Redirect if supported or manual CTA
            });

            if (!gumroadProduct) {
                console.warn('⚠️ Gumroad publishing failed, but Shopify is active.');
                logs.push('❌ Gumroad failed (Check API Key)');
            } else {
                logs.push(`✅ Gumroad Showcase Active: ${gumroadProduct.short_url}`);
            }

            return {
                success: true,
                shopifyUrl: shopifyProduct.url,
                gumroadUrl: gumroadProduct?.short_url,
                logs
            };

        } catch (error: any) {
            console.error('StoreFront Publish Failed:', error);
            logs.push(`❌ CRITICAL ERROR: ${error.message}`);
            return {
                success: false,
                logs
            };
        }
    }
};
