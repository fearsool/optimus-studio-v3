import { z } from 'zod';

// ==========================================
// 🛡️ STRICT VALIDATION SCHEMAS
// Denetleyicinin değiştirilemez kuralları.
// ==========================================

// 1. Blog Post Schema
export const BlogPostSchema = z.object({
    title: z.string().min(10, "Başlık çok kısa").max(100, "Başlık çok uzun"),
    content: z.string().min(500, "İçerik çok kısa (min 500 karakter)"), // Blog en az 500 karakter olmalı
    metaDescription: z.string().max(160, "Meta açıklama SEO sınırını (160) aşıyor"),
    tags: z.array(z.string()).min(3, "En az 3 etiket gerekli"),
    readTime: z.string().regex(/^\d+ min read$/, "Okuma süresi formatı hatalı (örn: '5 min read')")
});

// 2. Instagram Caption Schema
export const InstagramCaptionSchema = z.object({
    caption: z.string().min(1, "Caption boş olamaz"),
    hashtags: z.array(z.string())
        .min(10, "En az 10 hashtag gerekli")
        .max(30, "En fazla 30 hashtag (Instagram limiti)"),
    cta: z.string().min(5, "Call-to-Action eksik veya çok kısa"),
    visualPrompt: z.string().optional() // Görsel önerisi opsiyonel ama varsa string olmalı
});

// 3. Etsy Listing Schema
export const EtsyListingSchema = z.object({
    title: z.string().max(140, "Etsy başlık limiti 140 karakterdir").min(10, "Başlık çok kısa"),
    description: z.string().min(100, "Açıklama çok kısa, SEO için zayıf"),
    tags: z.array(z.string())
        .length(13, "Etsy tam olarak 13 etiket ister (SEO kuralı)")
        .refine(tags => tags.every(t => t.length <= 20), "Her etiket max 20 karakter olabilir"),
    price: z.string().regex(/^\$\d+(\.\d{2})?$/, "Fiyat formatı hatalı (örn: $19.99)"),
    category: z.string()
});

// 4. Tweet Thread Schema
export const TweetThreadSchema = z.object({
    tweets: z.array(z.string().max(280, "Tweet 280 karakteri aşamaz"))
        .min(3, "Thread en az 3 tweet olmalı")
        .max(10, "Thread çok uzun"),
    hook: z.string().max(280, "Kanca tweeti 280 karakteri aşamaz")
});

// 5. Email Response Schema
export const EmailResponseSchema = z.object({
    subject: z.string(),
    body: z.string().min(20, "Email gövdesi çok kısa"),
    tone: z.enum(['professional', 'friendly', 'urgent', 'empathetic']),
    actionItems: z.array(z.string()).optional()
});

// SCHEMAS MAP
export const AUTOMATION_SCHEMAS = {
    'blog-post': BlogPostSchema,
    'instagram-caption': InstagramCaptionSchema,
    'etsy-listing': EtsyListingSchema,
    'tweet': z.object({ content: z.string().max(280) }), // Single tweet schema
    'tweet-thread': TweetThreadSchema,
    'email-response': EmailResponseSchema,
    'product-description': z.object({ content: z.string().min(50), features: z.array(z.string()) }),
    'linkedin-post': z.object({ content: z.string(), hashtags: z.array(z.string()) }),
    'video-script': z.object({ hook: z.string(), body: z.string(), cta: z.string(), duration: z.string() }),
    'seo-meta': z.object({ title: z.string(), description: z.string(), keywords: z.array(z.string()) }),
    'trend-analysis': z.object({ trend: z.string(), opportunity: z.string(), score: z.number().min(0).max(100) })
};
