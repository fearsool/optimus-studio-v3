"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETSY_SEO_LISTING_ENGINE = void 0;
const types_1 = require("../../types");
exports.ETSY_SEO_LISTING_ENGINE = {
    id: 'etsy-auto-listing-engine',
    slug: 'etsy-auto-listing-engine',
    name: 'Etsy Auto Listing Engine 🚀',
    description: 'Ürün fotoğraflarından otomatik olarak SEO uyumlu Etsy başlığı, açıklaması ve etiketleri üreten ve mağazanıza taslak olarak ekleyen tam otomatik sistem.',
    category: 'ecommerce',
    difficulty: 'easy',
    estimatedRevenue: '$9/mo per user',
    icon: '🛍️',
    tags: ['etsy', 'seo', 'ecommerce', 'ai', 'automation'],
    isOfficial: true,
    sourceUrl: 'https://omniflow.com/official/etsy-engine',
    // REFINERY STATE: REFINED
    refineLevel: 'refined',
    sellable: true,
    // COMMERCIALIZATION DATA
    monetizationType: 'subscription',
    businessOutcome: {
        problem: 'Etsy satıcıları ürün girmek için ürün başına 20-30 dakika harcıyor. SEO uyumlu yazmak uzmanlık gerektiriyor.',
        solution: 'Ürün adını ve birkaç özelliği girin; Yapay Zeka en çok aranan kelimelerle (Long Tail Keywords) listing oluştursun.',
        value: 'Her yeni üründe 25 dakika tasarruf. SEO optimizasyonu ile %30 daha fazla trafik potansiyeli.',
        targetUser: ['Etsy Satıcıları', 'Dijital Ürün Üreticileri', 'Print on Demand Mağazaları']
    },
    // GOVERNANCE
    refinedBy: 'system-factory-admin',
    refinedAt: new Date().toISOString(),
    refineChecklistVersion: 'v2.0',
    blockingReasons: [],
    // IP PROTECTION
    signature: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', // Mock Signature
    // BLUEPRINT (The Machine)
    blueprint: {
        nodes: [
            {
                id: 'trigger',
                type: types_1.NodeType.STATE_MANAGER,
                title: 'Start Process',
                role: 'System',
                task: 'Initialize Layout',
                status: types_1.StepStatus.IDLE,
                x: 100, y: 100,
                connections: [{ targetId: 'input-node' }]
            },
            {
                id: 'input-node',
                type: types_1.NodeType.EXTERNAL_CONNECTOR, // HUMAN_IN_THE_LOOP not available, using Connector or Approval
                title: 'Ürün Bilgisi',
                role: 'User',
                task: 'Ürün adı ve temel özellikleri girin',
                status: types_1.StepStatus.IDLE,
                x: 300, y: 100,
                connections: [{ targetId: 'ai-seo' }]
            },
            {
                id: 'ai-seo',
                type: types_1.NodeType.AGENT_PLANNER, // Replace AGENT
                title: 'AI SEO Uzmanı',
                role: 'GPT-4o',
                task: 'Etsy algoritmasına uygun başlık ve etiketleri üret',
                status: types_1.StepStatus.IDLE,
                x: 500, y: 100,
                connections: [{ targetId: 'ai-desc' }]
            },
            {
                id: 'ai-desc',
                type: types_1.NodeType.CONTENT_CREATOR, // Copywriter fits here
                title: 'Copywriter',
                role: 'Claude 3.5',
                task: 'Satış odaklı, hikaye tabanlı ürün açıklaması yaz',
                status: types_1.StepStatus.IDLE,
                x: 700, y: 100,
                connections: [{ targetId: 'etsy-api' }]
            },
            {
                id: 'etsy-api',
                type: types_1.NodeType.EXTERNAL_CONNECTOR,
                title: 'Etsy Publish',
                role: 'Etsy API',
                task: 'Taslak (Draft) olarak mağazaya gönder',
                status: types_1.StepStatus.IDLE,
                x: 900, y: 100,
                connections: []
            }
        ]
    }
};
