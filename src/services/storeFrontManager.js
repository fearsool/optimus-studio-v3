"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFrontManager = void 0;
const salesPackageService_1 = require("./salesPackageService");
const shopifyService_1 = require("./integrations/shopifyService");
const gumroadService_1 = require("./integrations/gumroadService");
exports.storeFrontManager = {
    /**
     * Publishes an automation to both Shopify (Sales) and Gumroad (Showcase)
     */
    async publishAutomation(blueprint, testBadge) {
        const logs = [];
        logs.push(`🚀 Starting StoreFront Auto-Publish for: ${blueprint.name}`);
        try {
            // 1. Generate Sales Assets (AI + Fal.ai)
            logs.push('📦 Generating sales assets (Cover, Copy, Pricing)...');
            const pkg = await salesPackageService_1.salesPackageService.generateSalesPackage(blueprint, testBadge, {
                generateCover: true,
                priceRange: 'high', // Premium pricing for automations
                language: 'tr' // Default to Turkish as requested
            });
            logs.push(`✅ Assets generated: ${pkg.title} / $${pkg.suggestedPrice}`);
            // 2. Publish to Shopify (Primary Store)
            logs.push('🛍️ Publishing to Shopify...');
            const shopifyProduct = await shopifyService_1.shopifyService.createProduct({
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
            const gumroadProduct = await gumroadService_1.gumroadService.createProduct({
                name: pkg.title,
                description: showcaseDescription,
                price_cents: pkg.suggestedPrice * 100, // Gumroad uses cents
                url: `showcase-${Date.now()}`, // Custom slug
                redirect_url: shopifyProduct.url // Redirect if supported or manual CTA
            });
            if (!gumroadProduct) {
                console.warn('⚠️ Gumroad publishing failed, but Shopify is active.');
                logs.push('❌ Gumroad failed (Check API Key)');
            }
            else {
                logs.push(`✅ Gumroad Showcase Active: ${gumroadProduct.short_url}`);
            }
            return {
                success: true,
                shopifyUrl: shopifyProduct.url,
                gumroadUrl: gumroadProduct === null || gumroadProduct === void 0 ? void 0 : gumroadProduct.short_url,
                logs
            };
        }
        catch (error) {
            console.error('StoreFront Publish Failed:', error);
            logs.push(`❌ CRITICAL ERROR: ${error.message}`);
            return {
                success: false,
                logs
            };
        }
    }
};
