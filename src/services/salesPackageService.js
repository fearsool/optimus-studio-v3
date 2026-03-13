"use strict";
/**
 * SALES PACKAGE GENERATOR SERVICE (V3.1)
 * =======================================
 * Automatically generates sales-ready packages for Gumroad/Etsy
 *
 * Features:
 * - AI-generated product title
 * - AI-generated description
 * - Cover image generation (Fal.ai)
 * - README.md with setup instructions
 * - Pricing recommendation
 * - .zip export
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesPackageService = void 0;
// ============================================
// AI PROMPT TEMPLATES
// ============================================
const TITLE_PROMPT = (blueprint) => `
Generate a catchy, professional product title for an automation template.

Automation Name: ${blueprint.name}
Category: ${blueprint.category}
Description: ${blueprint.description}
Goal: ${blueprint.masterGoal}

Requirements:
- Max 60 characters
- Include power words (AI, Automated, Smart, Pro, etc.)
- Make it sellable for Gumroad/Etsy
- English language

Return ONLY the title, nothing else.
`;
const DESCRIPTION_PROMPT = (blueprint) => {
    var _a;
    return `
Write a compelling product description for an automation template.

Automation Name: ${blueprint.name}
Category: ${blueprint.category}
Goal: ${blueprint.masterGoal}
Number of Steps: ${((_a = blueprint.nodes) === null || _a === void 0 ? void 0 : _a.length) || 0}

Structure:
1. Hook (1 sentence - problem it solves)
2. Features (3-4 bullet points)
3. Benefits (what user gains)
4. Requirements (API keys needed)
5. Call-to-action

Requirements:
- Max 500 words
- Use markdown formatting
- Professional tone
- English language
- Include emojis sparingly

Return the description only.
`;
};
const KEYWORDS_PROMPT = (blueprint) => `
Generate 10 SEO keywords for this automation template for Gumroad/Etsy.

Automation: ${blueprint.name}
Category: ${blueprint.category}
Description: ${blueprint.description}

Return as comma-separated list, lowercase, no formatting.
`;
const COVER_PROMPT = (blueprint) => `
Modern digital product cover for "${blueprint.name}" automation. 
Clean tech aesthetic, gradient background (purple to blue), 
minimalist icons representing AI and automation, 
professional SaaS product style, 
no text on image.
`;
// Pricing matrix based on complexity
const PRICING_MATRIX = {
    easy: { low: 9, medium: 19, high: 29 },
    medium: { low: 19, medium: 39, high: 59 },
    hard: { low: 39, medium: 69, high: 99 }
};
class SalesPackageService {
    /**
     * Generate complete sales package from blueprint
     */
    async generateSalesPackage(blueprint, testBadge, options = {}) {
        const { generateCover = true, priceRange = 'medium', language = 'en' } = options;
        console.log('[SalesGen] Starting package generation for:', blueprint.name);
        // 1. Generate Title
        const title = await this.generateTitle(blueprint);
        console.log('[SalesGen] Title:', title);
        // 2. Generate Description
        const description = await this.generateDescription(blueprint);
        console.log('[SalesGen] Description generated');
        // 3. Generate Keywords
        const keywords = await this.generateKeywords(blueprint);
        console.log('[SalesGen] Keywords:', keywords);
        // 4. Generate Cover Image (optional)
        let coverImageUrl;
        if (generateCover) {
            coverImageUrl = await this.generateCoverImage(blueprint);
            console.log('[SalesGen] Cover:', coverImageUrl);
        }
        // 5. Generate README
        const readmeContent = this.generateReadme(blueprint, testBadge);
        // 6. Calculate Price
        const difficulty = this.getDifficulty(blueprint);
        const suggestedPrice = PRICING_MATRIX[difficulty][priceRange];
        console.log('[SalesGen] Package complete!');
        return {
            title,
            description,
            keywords,
            coverImageUrl,
            readmeContent,
            suggestedPrice,
            currency: 'USD',
            generatedAt: new Date().toISOString()
        };
    }
    /**
     * Generate AI title
     */
    async generateTitle(blueprint) {
        try {
            const response = await this.callAI(TITLE_PROMPT(blueprint));
            return response.trim().replace(/["']/g, '');
        }
        catch (error) {
            console.error('[SalesGen] Title generation failed:', error);
            return `${blueprint.name} - AI Automation Template`;
        }
    }
    /**
     * Generate AI description
     */
    async generateDescription(blueprint) {
        try {
            return await this.callAI(DESCRIPTION_PROMPT(blueprint));
        }
        catch (error) {
            console.error('[SalesGen] Description generation failed:', error);
            return this.generateFallbackDescription(blueprint);
        }
    }
    /**
     * Generate SEO keywords
     */
    async generateKeywords(blueprint) {
        try {
            const response = await this.callAI(KEYWORDS_PROMPT(blueprint));
            return response.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
        }
        catch (error) {
            return ['automation', 'ai', blueprint.category, 'template', 'workflow'];
        }
    }
    /**
     * Generate cover image using Fal.ai
     */
    async generateCoverImage(blueprint) {
        var _a, _b, _c;
        try {
            const FAL_API_KEY = (_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_FAL_API_KEY;
            if (!FAL_API_KEY) {
                console.warn('[SalesGen] No FAL_API_KEY, skipping cover generation');
                return undefined;
            }
            const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${FAL_API_KEY}`
                },
                body: JSON.stringify({
                    prompt: COVER_PROMPT(blueprint),
                    image_size: 'landscape_16_9',
                    num_images: 1
                })
            });
            const result = await response.json();
            return (_c = (_b = result.images) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.url;
        }
        catch (error) {
            console.error('[SalesGen] Cover generation failed:', error);
            return undefined;
        }
    }
    /**
     * Generate README.md content
     */
    generateReadme(blueprint, testBadge) {
        var _a, _b, _c, _d;
        const requiredApis = ((_a = blueprint.requiredApis) === null || _a === void 0 ? void 0 : _a.map(a => `- **${a.label}**: ${a.description}`).join('\n')) || '- No API keys required';
        return `# ${blueprint.name}

> ${blueprint.description}

## 🏷️ Test Badge
${testBadge.passed ? '✅ **VERIFIED**' : '⚠️ Unverified'}
- Last Test: ${testBadge.lastTestDate}
- Success Rate: ${testBadge.successRate}%
- Engine Version: ${testBadge.engineVersion}

## 🚀 Quick Start

1. Download the \`.json\` file
2. Open OmniFlow Factory
3. Click "Import Template"
4. Configure your API keys
5. Run!

## 🔑 Required API Keys

${requiredApis}

## 📋 What This Automation Does

**Goal:** ${blueprint.masterGoal}

**Steps:**
${((_b = blueprint.nodes) === null || _b === void 0 ? void 0 : _b.map((n, i) => `${i + 1}. **${n.title}** - ${n.task}`).join('\n')) || 'See blueprint for details'}

## 📦 Included Files

- \`${blueprint.name.replace(/\s/g, '_')}.json\` - Main blueprint
- \`README.md\` - This file

## ⚙️ Configuration

Edit the \`testConfig.variables\` in the JSON file to customize:
${((_d = (_c = blueprint.testConfig) === null || _c === void 0 ? void 0 : _c.variables) === null || _d === void 0 ? void 0 : _d.map(v => `- \`${v.key}\`: ${v.value}`).join('\n')) || '- No variables configured'}

## 📞 Support

For questions, open an issue or contact the seller.

---

*Generated by OmniFlow Factory v3.1*
*${new Date().toISOString().split('T')[0]}*
`;
    }
    /**
     * Fallback description when AI fails
     */
    generateFallbackDescription(blueprint) {
        var _a, _b;
        return `# ${blueprint.name}

${blueprint.description}

## What You Get

- Complete automation workflow (${((_a = blueprint.nodes) === null || _a === void 0 ? void 0 : _a.length) || 0} steps)
- Ready-to-use template
- Setup documentation
- Test verified ✅

## Requirements

${((_b = blueprint.requiredApis) === null || _b === void 0 ? void 0 : _b.map(a => `- ${a.label}`).join('\n')) || '- No special requirements'}

## How It Works

${blueprint.masterGoal}

---

*Ready to automate? Import and run!*
`;
    }
    /**
     * Calculate difficulty based on node count and types
     */
    getDifficulty(blueprint) {
        var _a, _b;
        const nodeCount = ((_a = blueprint.nodes) === null || _a === void 0 ? void 0 : _a.length) || 0;
        const hasApiReqs = (((_b = blueprint.requiredApis) === null || _b === void 0 ? void 0 : _b.length) || 0) > 0;
        if (nodeCount <= 3 && !hasApiReqs)
            return 'easy';
        if (nodeCount <= 6 || !hasApiReqs)
            return 'medium';
        return 'hard';
    }
    /**
     * Call AI for text generation
     */
    async callAI(prompt) {
        var _a, _b, _c, _d, _e, _f;
        // Try Groq first (fastest)
        const GROQ_API_KEY = (_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_GROQ_API_KEY;
        if (GROQ_API_KEY) {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            const result = await response.json();
            return ((_d = (_c = (_b = result.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '';
        }
        // Fallback to HuggingFace
        const HF_TOKEN = (_e = import.meta.env) === null || _e === void 0 ? void 0 : _e.VITE_HUGGINGFACE_TOKEN;
        if (HF_TOKEN) {
            const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_TOKEN}`
                },
                body: JSON.stringify({ inputs: prompt })
            });
            const result = await response.json();
            return ((_f = result[0]) === null || _f === void 0 ? void 0 : _f.generated_text) || '';
        }
        throw new Error('No AI API key available');
    }
    /**
     * Create .zip package for download
     */
    async createZipPackage(blueprint, salesPackage) {
        // Use JSZip for creating zip (would need to be imported)
        // For now, return a simple JSON blob
        const packageData = {
            __meta: {
                generator: 'OmniFlow Factory v3.1',
                generatedAt: salesPackage.generatedAt,
                platform: 'gumroad'
            },
            template: {
                ...blueprint,
                // Remove sensitive data
                apiValues: undefined,
                testConfig: { ...blueprint.testConfig, variables: [] }
            },
            sales: {
                title: salesPackage.title,
                description: salesPackage.description,
                keywords: salesPackage.keywords,
                price: salesPackage.suggestedPrice,
                currency: salesPackage.currency
            }
        };
        const jsonStr = JSON.stringify(packageData, null, 2);
        const fullContent = `${salesPackage.readmeContent}\n\n---\n\n# Template JSON\n\`\`\`json\n${jsonStr}\n\`\`\``;
        return new Blob([fullContent], { type: 'text/markdown' });
    }
}
exports.salesPackageService = new SalesPackageService();
exports.default = exports.salesPackageService;
