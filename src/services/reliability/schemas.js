"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTOMATION_SCHEMAS = exports.EmailResponseSchema = exports.TweetThreadSchema = exports.EtsyListingSchema = exports.InstagramCaptionSchema = exports.BlogPostSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// 🛡️ STRICT VALIDATION SCHEMAS
// Denetleyicinin değiştirilemez kuralları.
// ==========================================
// 1. Blog Post Schema
exports.BlogPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(10, "Başlık çok kısa").max(100, "Başlık çok uzun"),
    content: zod_1.z.string().min(500, "İçerik çok kısa (min 500 karakter)"), // Blog en az 500 karakter olmalı
    metaDescription: zod_1.z.string().max(160, "Meta açıklama SEO sınırını (160) aşıyor"),
    tags: zod_1.z.array(zod_1.z.string()).min(3, "En az 3 etiket gerekli"),
    readTime: zod_1.z.string().regex(/^\d+ min read$/, "Okuma süresi formatı hatalı (örn: '5 min read')")
});
// 2. Instagram Caption Schema
exports.InstagramCaptionSchema = zod_1.z.object({
    caption: zod_1.z.string().min(1, "Caption boş olamaz"),
    hashtags: zod_1.z.array(zod_1.z.string())
        .min(10, "En az 10 hashtag gerekli")
        .max(30, "En fazla 30 hashtag (Instagram limiti)"),
    cta: zod_1.z.string().min(5, "Call-to-Action eksik veya çok kısa"),
    visualPrompt: zod_1.z.string().optional() // Görsel önerisi opsiyonel ama varsa string olmalı
});
// 3. Etsy Listing Schema
exports.EtsyListingSchema = zod_1.z.object({
    title: zod_1.z.string().max(140, "Etsy başlık limiti 140 karakterdir").min(10, "Başlık çok kısa"),
    description: zod_1.z.string().min(100, "Açıklama çok kısa, SEO için zayıf"),
    tags: zod_1.z.array(zod_1.z.string())
        .length(13, "Etsy tam olarak 13 etiket ister (SEO kuralı)")
        .refine(tags => tags.every(t => t.length <= 20), "Her etiket max 20 karakter olabilir"),
    price: zod_1.z.string().regex(/^\$\d+(\.\d{2})?$/, "Fiyat formatı hatalı (örn: $19.99)"),
    category: zod_1.z.string()
});
// 4. Tweet Thread Schema
exports.TweetThreadSchema = zod_1.z.object({
    tweets: zod_1.z.array(zod_1.z.string().max(280, "Tweet 280 karakteri aşamaz"))
        .min(3, "Thread en az 3 tweet olmalı")
        .max(10, "Thread çok uzun"),
    hook: zod_1.z.string().max(280, "Kanca tweeti 280 karakteri aşamaz")
});
// 5. Email Response Schema
exports.EmailResponseSchema = zod_1.z.object({
    subject: zod_1.z.string(),
    body: zod_1.z.string().min(20, "Email gövdesi çok kısa"),
    tone: zod_1.z.enum(['professional', 'friendly', 'urgent', 'empathetic']),
    actionItems: zod_1.z.array(zod_1.z.string()).optional()
});
// SCHEMAS MAP
exports.AUTOMATION_SCHEMAS = {
    'blog-post': exports.BlogPostSchema,
    'instagram-caption': exports.InstagramCaptionSchema,
    'etsy-listing': exports.EtsyListingSchema,
    'tweet': zod_1.z.object({ content: zod_1.z.string().max(280) }), // Single tweet schema
    'tweet-thread': exports.TweetThreadSchema,
    'email-response': exports.EmailResponseSchema,
    'product-description': zod_1.z.object({ content: zod_1.z.string().min(50), features: zod_1.z.array(zod_1.z.string()) }),
    'linkedin-post': zod_1.z.object({ content: zod_1.z.string(), hashtags: zod_1.z.array(zod_1.z.string()) }),
    'video-script': zod_1.z.object({ hook: zod_1.z.string(), body: zod_1.z.string(), cta: zod_1.z.string(), duration: zod_1.z.string() }),
    'seo-meta': zod_1.z.object({ title: zod_1.z.string(), description: zod_1.z.string(), keywords: zod_1.z.array(zod_1.z.string()) }),
    'trend-analysis': zod_1.z.object({ trend: zod_1.z.string(), opportunity: zod_1.z.string(), score: zod_1.z.number().min(0).max(100) })
};
