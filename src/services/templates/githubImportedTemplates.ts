/**
 * 100 Automation Templates - Popular Integrations
 * Generated from GitHub activepieces patterns
 * 
 * Categories: e-commerce, social-media, marketing, productivity, finance, ai
 */

import { NodeType, StepStatus } from '../../types';
import { AutomationTemplate } from './store';

// Helper to create template
const createTemplate = (
    id: string,
    name: string,
    description: string,
    category: string,
    icon: string,
    tags: string[],
    estimatedRevenue: string
): AutomationTemplate => ({
    id,
    name,
    description,
    category,
    difficulty: 'medium',
    estimatedRevenue,
    icon,
    tags,
    blueprint: {
        name,
        description,
        masterGoal: description,
        baseKnowledge: `${tags.join(', ')} entegrasyonu`,
        category,
        version: 1,
        testConfig: { variables: [], simulateFailures: false },
        nodes: [
            { id: `${id}-1`, type: NodeType.STATE_MANAGER, title: 'Başlangıç', role: 'Trigger', task: 'Workflow başlat', status: StepStatus.IDLE, connections: [{ targetId: `${id}-2` }] },
            { id: `${id}-2`, type: NodeType.EXTERNAL_CONNECTOR, title: 'Veri Al', role: 'API', task: 'Kaynak verilerini çek', status: StepStatus.IDLE, connections: [{ targetId: `${id}-3` }] },
            { id: `${id}-3`, type: NodeType.AGENT_PLANNER, title: 'İşle', role: 'Processor', task: 'Verileri dönüştür', status: StepStatus.IDLE, connections: [{ targetId: `${id}-4` }] },
            { id: `${id}-4`, type: NodeType.EXTERNAL_CONNECTOR, title: 'Gönder', role: 'Output', task: 'Sonucu hedef sisteme gönder', status: StepStatus.IDLE, connections: [] }
        ]
    }
});

export const GITHUB_IMPORTED_TEMPLATES: AutomationTemplate[] = [
    // === 🆕 AWESOME LIST TOOLS (Self-Hosted & Low-Code) ===
    createTemplate('n8n-workflow-automation', '⚡ n8n Workflow Otomasyon', 'Self-hosted workflow otomasyon platformu. 200+ entegrasyon, görsel node editörü, Zapier/Make alternatifi.', 'productivity', '⚡', ['n8n', 'workflow', 'otomasyon', 'self-hosted', 'zapier-alternatif'], '$2000-8000/ay'),
    createTemplate('nocodb-database', '🗄️ NocoDB Akıllı Veritabanı', 'Airtable açık kaynak alternatifi. SQL veritabanlarını spreadsheet arayüzüne dönüştür.', 'productivity', '🗄️', ['nocodb', 'database', 'airtable-alternatif', 'spreadsheet', 'api'], '$1000-4000/ay'),
    createTemplate('directus-headless-cms', '📂 Directus Headless CMS', 'İçerik yönetimi için headless CMS. REST + GraphQL API, özel veri modelleri.', 'content-creation', '📂', ['directus', 'cms', 'headless', 'api', 'içerik'], '$1500-5000/ay'),
    createTemplate('strapi-content-api', '📝 Strapi İçerik API', 'Esnek headless CMS. Blog, e-ticaret, uygulama içerikleri için REST/GraphQL API.', 'content-creation', '📝', ['strapi', 'cms', 'headless', 'api', 'blog'], '$1500-5000/ay'),
    createTemplate('budibase-internal-tools', '🛠️ Budibase Internal Tool Builder', 'Hızlı internal tool, admin panel ve dashboard oluşturma platformu.', 'development', '🛠️', ['budibase', 'low-code', 'internal-tools', 'dashboard'], '$2000-6000/ay'),
    createTemplate('tooljet-admin-panel', '🎛️ ToolJet Admin Panel', 'Kapsamlı admin paneli ve dashboard builder. 50+ widget, veritabanı bağlantıları.', 'development', '🎛️', ['tooljet', 'admin', 'dashboard', 'low-code', 'internal'], '$2000-6000/ay'),
    createTemplate('appsmith-dashboard', '📊 Appsmith Dashboard Builder', 'Güçlü özel dashboard ve workflow builder. JavaScript özelleştirme, gerçek zamanlı işbirliği.', 'development', '📊', ['appsmith', 'dashboard', 'workflow', 'low-code'], '$2000-6000/ay'),
    createTemplate('baserow-database-platform', '📋 Baserow Veritabanı Platformu', 'Açık kaynak no-code veritabanı. Airtable alternatifi, REST API, self-hosted.', 'productivity', '📋', ['baserow', 'database', 'no-code', 'airtable-alternatif', 'api'], '$1000-4000/ay'),
    createTemplate('flowise-ai-workflow', '🤖 FlowiseAI AI Workflow', 'LangChain tabanlı görsel AI workflow builder. Chatbot, RAG, AI agent oluşturma.', 'ai', '🤖', ['flowise', 'langchain', 'ai', 'chatbot', 'rag', 'agent'], '$3000-10000/ay'),
    createTemplate('dify-ai-platform', '🧠 Dify AI Uygulama Platformu', 'Hızlı AI uygulama geliştirme. LLM orkestrasyon, prompt yönetimi, RAG pipeline.', 'ai', '🧠', ['dify', 'ai', 'llm', 'rag', 'prompt'], '$3000-10000/ay'),
    createTemplate('anythingllm-private-ai', '🔒 AnythingLLM Özel AI Asistan', 'Multi-format döküman desteği, özel AI asistanları. Gizli ve güvenli yerel AI.', 'ai', '🔒', ['anythingllm', 'ai', 'private', 'documents', 'assistant'], '$2000-7000/ay'),
    createTemplate('weweb-web-builder', '🌐 WeWeb No-Code Web Builder', 'Responsive web uygulaması oluşturma. Görsel editör, Supabase/API entegrasyonu.', 'development', '🌐', ['weweb', 'web', 'no-code', 'builder', 'frontend'], '$1500-5000/ay'),
    createTemplate('nocobase-customizable-platform', '⚙️ NocoBase Özelleştirilebilir Platform', 'Yüksek özelleştirilebilir no-code platform. Plugin sistemi, workflow engine.', 'development', '⚙️', ['nocobase', 'no-code', 'customizable', 'workflow', 'plugin'], '$2000-6000/ay'),
    createTemplate('retool-internal-apps', '🔧 Retool Internal App Builder', 'No-code + custom code esnekliği. Veritabanı bağlantıları, API entegrasyonları.', 'development', '🔧', ['retool', 'internal', 'app', 'builder', 'api'], '$2500-8000/ay'),
    createTemplate('activepieces-automation', '🧩 Activepieces İş Otomasyonu', 'Açık kaynak iş otomasyonu. Zapier alternatifi, self-hosted, 100+ entegrasyon.', 'productivity', '🧩', ['activepieces', 'automation', 'zapier-alternatif', 'self-hosted'], '$1500-5000/ay'),

    // === 📊 ANALYTICS & TRACKING ===
    createTemplate('plausible-analytics', '📈 Plausible Web Analitik', 'Google Analytics alternatifi. Gizlilik odaklı, hafif, GDPR uyumlu analitik.', 'analytics', '📈', ['plausible', 'analytics', 'privacy', 'gdpr', 'google-alternatif'], '$1000-4000/ay'),
    createTemplate('umami-analytics', '📊 Umami Analitik Platformu', 'Basit, hızlı, gizlilik odaklı web analitik. Self-hosted, açık kaynak.', 'analytics', '📊', ['umami', 'analytics', 'privacy', 'self-hosted'], '$800-3000/ay'),
    createTemplate('matomo-enterprise-analytics', '📉 Matomo Kurumsal Analitik', 'Google Analytics tam alternatifi. Detaylı raporlar, e-ticaret takibi.', 'analytics', '📉', ['matomo', 'analytics', 'enterprise', 'e-commerce'], '$1500-5000/ay'),
    createTemplate('posthog-product-analytics', '🔬 PostHog Ürün Analitiği', 'Ürün analitiği + session replay + feature flags. Açık kaynak alternatif.', 'analytics', '🔬', ['posthog', 'product', 'analytics', 'replay', 'feature-flags'], '$2000-7000/ay'),

    // === 💬 CRM & CUSTOMER SUPPORT ===
    createTemplate('chatwoot-customer-support', '💬 Chatwoot Müşteri Desteği', 'Açık kaynak müşteri destek platformu. Multi-channel inbox, chatbot entegrasyonu.', 'customer-service', '💬', ['chatwoot', 'support', 'chat', 'inbox', 'crm'], '$2000-6000/ay'),
    createTemplate('tawk-to-live-chat', '💻 Tawk.to Canlı Sohbet', 'Ücretsiz canlı sohbet widget. Ziyaretçi takibi, ticketing, CRM özellikleri.', 'customer-service', '💻', ['tawk', 'chat', 'live-chat', 'widget', 'crm'], '$500-2000/ay'),
    createTemplate('erxes-growth-os', '🚀 Erxes Growth OS', 'Açık kaynak büyüme pazarlama platformu. CRM + Inbox + Engage + Knowledgebase.', 'money-maker', '🚀', ['erxes', 'crm', 'marketing', 'growth', 'all-in-one'], '$3000-10000/ay'),
    createTemplate('twenty-crm', '👥 Twenty Modern CRM', 'Açık kaynak modern CRM. Salesforce alternatifi, güzel UI, REST API.', 'money-maker', '👥', ['twenty', 'crm', 'salesforce-alternatif', 'sales'], '$2000-6000/ay'),

    // === 📧 EMAIL & MARKETING ===
    createTemplate('mautic-marketing-automation', '📧 Mautic Marketing Otomasyon', 'Açık kaynak pazarlama otomasyonu. Email kampanyaları, lead scoring, segmentasyon.', 'email-marketing', '📧', ['mautic', 'marketing', 'automation', 'email', 'campaigns'], '$3000-10000/ay'),
    createTemplate('listmonk-newsletter', '📰 Listmonk Newsletter Yönetimi', 'Yüksek performanslı newsletter ve email listesi yönetimi. Self-hosted, hızlı.', 'email-marketing', '📰', ['listmonk', 'newsletter', 'email', 'mailing-list', 'self-hosted'], '$1000-4000/ay'),
    createTemplate('postal-email-server', '📮 Postal Email Sunucusu', 'Tam özellikli email sunucusu. Transactional email, tracking, webhooks.', 'email-marketing', '📮', ['postal', 'email', 'server', 'transactional', 'smtp'], '$1500-5000/ay'),
    createTemplate('mailcow-email-suite', '📫 MailCow Email Suite', 'Docker tabanlı email sunucusu. Webmail, antispam, SoGo groupware.', 'email-marketing', '📫', ['mailcow', 'email', 'docker', 'webmail', 'groupware'], '$1500-5000/ay'),

    // === 💰 INVOICING & FINANCE ===
    createTemplate('invoice-ninja-billing', '💵 Invoice Ninja Faturalama', 'Profesyonel fatura ve ödeme takibi. Müşteri portalı, tekrarlayan faturalar.', 'finance', '💵', ['invoice-ninja', 'invoice', 'billing', 'payment', 'accounting'], '$1500-5000/ay'),
    createTemplate('crater-invoicing', '🧾 Crater Fatura Yazılımı', 'Modern fatura ve masraf takibi. Self-hosted, açık kaynak, güzel UI.', 'finance', '🧾', ['crater', 'invoice', 'expense', 'accounting', 'self-hosted'], '$1000-3500/ay'),
    createTemplate('akaunting-accounting', '📒 Akaunting Muhasebe', 'Tam özellikli muhasebe yazılımı. Faturalama, bankacılık, raporlama.', 'finance', '📒', ['akaunting', 'accounting', 'bookkeeping', 'invoice', 'banking'], '$2000-6000/ay'),

    // === 📝 PUBLISHING & CONTENT ===
    createTemplate('ghost-publishing', '👻 Ghost Yayıncılık Platformu', 'Modern blog ve newsletter platformu. Üyelik sistemi, SEO odaklı.', 'content-creation', '👻', ['ghost', 'blog', 'newsletter', 'publishing', 'membership'], '$2000-8000/ay'),
    createTemplate('writefreely-blog', '✍️ WriteFreely Minimalist Blog', 'Minimalist, dikkat dağıtmayan blog platformu. Fediverse entegrasyonu.', 'content-creation', '✍️', ['writefreely', 'blog', 'minimal', 'writing', 'fediverse'], '$500-2000/ay'),
    createTemplate('wordpress-automation', '📰 WordPress İçerik Otomasyonu', 'WordPress site yönetimi. Otomatik paylaşım, SEO, içerik planlama.', 'content-creation', '📰', ['wordpress', 'blog', 'cms', 'seo', 'publishing'], '$1500-5000/ay'),

    // === 🛒 E-COMMERCE BACKENDS ===
    createTemplate('medusa-ecommerce', '🛒 Medusa E-Ticaret Backend', 'Shopify alternatifi açık kaynak e-ticaret. Headless, API-first, modüler.', 'money-maker', '🛒', ['medusa', 'ecommerce', 'headless', 'shopify-alternatif', 'api'], '$3000-12000/ay'),
    createTemplate('saleor-commerce', '🏪 Saleor Commerce Platform', 'Enterprise e-ticaret platformu. GraphQL API, multi-tenant, extensible.', 'money-maker', '🏪', ['saleor', 'ecommerce', 'graphql', 'enterprise', 'platform'], '$4000-15000/ay'),
    createTemplate('bagisto-laravel-ecommerce', '🛍️ Bagisto Laravel E-Ticaret', 'Laravel tabanlı e-ticaret. Multi-store, multi-currency, modüler.', 'money-maker', '🛍️', ['bagisto', 'laravel', 'ecommerce', 'multi-store', 'php'], '$2000-7000/ay'),

    // === 🔧 DEVOPS & INFRASTRUCTURE ===
    createTemplate('portainer-docker-management', '🐳 Portainer Docker Yönetimi', 'Docker container yönetimi UI. Kolay deployment, monitoring, güvenlik.', 'development', '🐳', ['portainer', 'docker', 'container', 'devops', 'management'], '$1000-4000/ay'),
    createTemplate('coolify-paas', '☁️ Coolify Self-Hosted PaaS', 'Heroku/Vercel alternatifi. Git push deploy, SSL, veritabanları.', 'development', '☁️', ['coolify', 'paas', 'heroku-alternatif', 'deploy', 'hosting'], '$2000-8000/ay'),
    createTemplate('caprover-paas', '🚢 CapRover App Deployment', 'Kolay uygulama deployment. Docker, SSL, one-click apps.', 'development', '🚢', ['caprover', 'paas', 'docker', 'deploy', 'ssl'], '$1500-5000/ay'),
    createTemplate('uptime-kuma-monitoring', '📡 Uptime Kuma Monitoring', 'Güzel monitoring dashboard. Uptime takibi, bildirimler, status page.', 'analytics', '📡', ['uptime-kuma', 'monitoring', 'uptime', 'status-page', 'alerts'], '$500-2000/ay'),

    // === 👥 MEMBERSHIP & COMMUNITY ===
    createTemplate('memberstack-membership', '🔑 Memberstack Üyelik Sistemi', 'No-code üyelik sitesi oluşturma. Webflow, Softr entegrasyonu.', 'money-maker', '🔑', ['memberstack', 'membership', 'paywall', 'subscription', 'no-code'], '$2000-8000/ay'),
    createTemplate('discourse-forum', '💬 Discourse Forum Platformu', 'Modern topluluk forum yazılımı. Gamification, SSO, AI moderasyon.', 'productivity', '💬', ['discourse', 'forum', 'community', 'discussion', 'moderation'], '$1500-5000/ay'),
    createTemplate('forem-community', '🌱 Forem Topluluk Platformu', 'DEV.to altyapısı. Blog + forum + community. Açık kaynak.', 'content-creation', '🌱', ['forem', 'community', 'blog', 'dev.to', 'social'], '$2000-6000/ay'),

    // === 📱 MOBILE & PWA ===
    createTemplate('glide-mobile-apps', '📱 Glide Mobile App Builder', 'Google Sheets/Airtable ile mobil uygulama oluştur. No-code, hızlı.', 'development', '📱', ['glide', 'mobile', 'app', 'no-code', 'sheets'], '$1500-5000/ay'),
    createTemplate('adalo-app-builder', '📲 Adalo App Oluşturucu', 'Drag-drop mobil uygulama builder. Native iOS/Android, no-code.', 'development', '📲', ['adalo', 'mobile', 'app', 'no-code', 'native'], '$2000-6000/ay'),
    createTemplate('softr-airtable-apps', '🎯 Softr Airtable Uygulamaları', 'Airtable verilerinden web/mobil uygulama. Üyelik, portal, dashboard.', 'development', '🎯', ['softr', 'airtable', 'app', 'no-code', 'portal'], '$1500-5000/ay'),

    // === 📦 FILE & STORAGE ===
    createTemplate('nextcloud-collaboration', '☁️ Nextcloud Dosya & İşbirliği', 'Dropbox/Google Drive alternatifi. Self-hosted, 200+ entegrasyon.', 'productivity', '☁️', ['nextcloud', 'storage', 'collaboration', 'sync', 'self-hosted'], '$1000-4000/ay'),
    createTemplate('minio-object-storage', '🗃️ MinIO Object Storage', 'S3 uyumlu object storage. Self-hosted, yüksek performans.', 'development', '🗃️', ['minio', 's3', 'storage', 'object', 'self-hosted'], '$1500-5000/ay'),

    // === 🎓 LEARNING & COURSES ===
    createTemplate('moodle-lms', '🎓 Moodle Kurs Platformu', 'Açık kaynak LMS. Online kurs, sınav, sertifika sistemi.', 'content-creation', '🎓', ['moodle', 'lms', 'courses', 'learning', 'education'], '$2000-8000/ay'),
    createTemplate('canvas-lms', '📚 Canvas Öğrenme Yönetimi', 'Modern LMS platformu. Video, assignment, grading, analytics.', 'content-creation', '📚', ['canvas', 'lms', 'education', 'courses', 'learning'], '$2500-10000/ay'),

    // === E-COMMERCE (1-25) ===
    createTemplate('shopify-order-tracker', '🛒 Shopify Sipariş Takibi', 'Yeni siparişleri otomatik takip et ve müşteriye bildirim gönder', 'money-maker', '🛒', ['shopify', 'e-ticaret', 'sipariş'], '$500-2000/ay'),
    createTemplate('shopify-inventory-sync', '📦 Shopify Stok Senkronizasyonu', 'Birden fazla mağaza arasında stok seviyelerini senkronize et', 'money-maker', '📦', ['shopify', 'envanter', 'stok'], '$300-1000/ay'),
    createTemplate('shopify-abandoned-cart', '🛒 Terk Edilmiş Sepet Kurtarma', 'Terk edilmiş sepetleri tespit et ve kurtarma emaili gönder', 'money-maker', '🛒', ['shopify', 'email', 'satış'], '$1000-5000/ay'),
    createTemplate('woocommerce-order-sync', '🔄 WooCommerce Sipariş Sync', 'WooCommerce siparişlerini CRM ile senkronize et', 'money-maker', '🔄', ['woocommerce', 'crm', 'sipariş'], '$400-1500/ay'),
    createTemplate('woocommerce-review-collector', '⭐ WooCommerce Yorum Toplama', 'Satın alma sonrası otomatik yorum isteği gönder', 'money-maker', '⭐', ['woocommerce', 'yorum', 'email'], '$200-800/ay'),
    createTemplate('stripe-payment-alerts', '💳 Stripe Ödeme Bildirimleri', 'Her ödeme sonrası Slack/Email bildirimi gönder', 'finance', '💳', ['stripe', 'ödeme', 'bildirim'], '$100-500/ay'),
    createTemplate('stripe-subscription-manager', '🔄 Stripe Abonelik Yönetimi', 'Abonelik durumlarını takip et ve müşteriyi bilgilendir', 'finance', '🔄', ['stripe', 'abonelik', 'crm'], '$500-2000/ay'),
    createTemplate('stripe-invoice-automation', '📄 Stripe Fatura Otomasyonu', 'Otomatik fatura oluştur ve müşteriye gönder', 'finance', '📄', ['stripe', 'fatura', 'email'], '$300-1000/ay'),
    createTemplate('stripe-refund-tracker', '💸 Stripe İade Takibi', 'İade taleplerini takip et ve raporla', 'finance', '💸', ['stripe', 'iade', 'rapor'], '$200-800/ay'),
    createTemplate('amazon-listing-optimizer', '🏪 Amazon Listing Optimizer', 'Amazon ürün listelemelerini SEO için optimize et', 'money-maker', '🏪', ['amazon', 'seo', 'e-ticaret'], '$1000-5000/ay'),
    createTemplate('ebay-price-monitor', '📊 eBay Fiyat İzleyici', 'Rakip fiyatlarını izle ve öneriler sun', 'money-maker', '📊', ['ebay', 'fiyat', 'rakip'], '$500-2000/ay'),
    createTemplate('etsy-order-automation', '🧶 Etsy Sipariş Otomasyonu', 'Etsy siparişlerini otomatik işle ve kargola', 'money-maker', '🧶', ['etsy', 'sipariş', 'kargo'], '$400-1500/ay'),
    createTemplate('etsy-seo-booster', '🔍 Etsy SEO Artırıcı', 'Etsy listelemelerini anahtar kelimelerle optimize et', 'seo', '🔍', ['etsy', 'seo', 'anahtar kelime'], '$300-1000/ay'),
    createTemplate('alibaba-supplier-finder', '🏭 Alibaba Tedarikçi Bulucu', 'Ürün için en iyi tedarikçileri bul ve karşılaştır', 'money-maker', '🏭', ['alibaba', 'tedarik', 'üretim'], '$500-2000/ay'),
    createTemplate('trendyol-order-sync', '🇹🇷 Trendyol Sipariş Sync', 'Trendyol siparişlerini ERP ile senkronize et', 'money-maker', '🇹🇷', ['trendyol', 'sipariş', 'erp'], '$300-1000/ay'),
    createTemplate('hepsiburada-inventory', '📦 Hepsiburada Stok Yönetimi', 'Hepsiburada stok seviyelerini otomatik güncelle', 'money-maker', '📦', ['hepsiburada', 'stok', 'envanter'], '$400-1500/ay'),
    createTemplate('n11-price-automation', '💰 N11 Fiyat Otomasyonu', 'Rakip fiyatlarına göre otomatik fiyat güncelle', 'money-maker', '💰', ['n11', 'fiyat', 'otomasyon'], '$500-2000/ay'),
    createTemplate('gittigidiyor-listing', '📝 GittiGidiyor Listeleme', 'Toplu ürün listeleme ve güncelleme', 'money-maker', '📝', ['gittigidiyor', 'listeleme', 'toplu'], '$300-1000/ay'),
    createTemplate('printful-order-sync', '👕 Printful Sipariş Sync', 'Print-on-demand siparişlerini otomatik işle', 'money-maker', '👕', ['printful', 'pod', 'baskı'], '$400-1500/ay'),
    createTemplate('printify-fulfillment', '🎨 Printify Fulfillment', 'Printify siparişlerini takip et ve müşteriyi bilgilendir', 'money-maker', '🎨', ['printify', 'fulfillment', 'bildirim'], '$300-1000/ay'),
    createTemplate('paypal-transaction-monitor', '💵 PayPal İşlem İzleyici', 'PayPal işlemlerini izle ve raporla', 'finance', '💵', ['paypal', 'ödeme', 'rapor'], '$200-800/ay'),
    createTemplate('square-pos-sync', '📱 Square POS Sync', 'Square POS satışlarını muhasebe ile senkronize et', 'finance', '📱', ['square', 'pos', 'muhasebe'], '$300-1000/ay'),
    createTemplate('quickbooks-invoice-automation', '📒 QuickBooks Fatura Otomasyonu', 'QuickBooks faturaları otomatik oluştur', 'finance', '📒', ['quickbooks', 'fatura', 'muhasebe'], '$400-1500/ay'),
    createTemplate('xero-expense-tracker', '💳 Xero Harcama Takibi', 'Harcamaları otomatik kategorize et ve kaydet', 'finance', '💳', ['xero', 'harcama', 'muhasebe'], '$300-1000/ay'),
    createTemplate('freshbooks-client-onboarding', '👥 FreshBooks Müşteri Onboarding', 'Yeni müşterileri otomatik onboarding sürecine al', 'finance', '👥', ['freshbooks', 'müşteri', 'onboarding'], '$400-1500/ay'),

    // === SOCIAL MEDIA (26-50) ===
    createTemplate('instagram-post-scheduler', '📸 Instagram Post Planlayıcı', 'Instagram postlarını önceden planla ve otomatik paylaş', 'social-media', '📸', ['instagram', 'sosyal medya', 'planlama'], '$200-800/ay'),
    createTemplate('instagram-story-automation', '📱 Instagram Story Otomasyonu', 'Otomatik story oluştur ve paylaş', 'social-media', '📱', ['instagram', 'story', 'otomasyon'], '$150-600/ay'),
    createTemplate('instagram-hashtag-generator', '#️⃣ Instagram Hashtag Üretici', 'İçerik için en uygun hashtag\'leri bul', 'social-media', '#️⃣', ['instagram', 'hashtag', 'seo'], '$100-400/ay'),
    createTemplate('instagram-dm-responder', '💬 Instagram DM Yanıtlayıcı', 'DM\'lere otomatik AI yanıt ver', 'social-media', '💬', ['instagram', 'dm', 'chatbot'], '$300-1000/ay'),
    createTemplate('facebook-post-scheduler', '👍 Facebook Post Planlayıcı', 'Facebook postlarını planla ve otomatik paylaş', 'social-media', '👍', ['facebook', 'sosyal medya', 'planlama'], '$200-800/ay'),
    createTemplate('facebook-ad-optimizer', '📢 Facebook Reklam Optimizer', 'Reklam performansını analiz et ve optimize et', 'social-media', '📢', ['facebook', 'reklam', 'optimizasyon'], '$500-2000/ay'),
    createTemplate('facebook-lead-capture', '📋 Facebook Lead Yakalama', 'Facebook lead formlarından CRM\'e otomatik aktar', 'social-media', '📋', ['facebook', 'lead', 'crm'], '$400-1500/ay'),
    createTemplate('twitter-thread-creator', '🧵 Twitter Thread Oluşturucu', 'AI ile viral thread içerikleri oluştur', 'social-media', '🧵', ['twitter', 'thread', 'ai'], '$200-800/ay'),
    createTemplate('twitter-auto-reply', '🤖 Twitter Otomatik Yanıt', 'Mention\'lara otomatik AI yanıt ver', 'social-media', '🤖', ['twitter', 'reply', 'chatbot'], '$300-1000/ay'),
    createTemplate('twitter-analytics-reporter', '📊 Twitter Analitik Rapor', 'Haftalık Twitter performans raporu oluştur', 'social-media', '📊', ['twitter', 'analitik', 'rapor'], '$150-600/ay'),
    createTemplate('linkedin-post-automation', '💼 LinkedIn Post Otomasyonu', 'Profesyonel içerikler oluştur ve paylaş', 'social-media', '💼', ['linkedin', 'b2b', 'içerik'], '$300-1000/ay'),
    createTemplate('linkedin-connection-manager', '🤝 LinkedIn Bağlantı Yöneticisi', 'Hedef kitleye otomatik bağlantı isteği gönder', 'social-media', '🤝', ['linkedin', 'networking', 'b2b'], '$400-1500/ay'),
    createTemplate('linkedin-lead-scraper', '🎯 LinkedIn Lead Scraper', 'Hedef sektörden potansiyel müşterileri bul', 'money-maker', '🎯', ['linkedin', 'lead', 'b2b'], '$500-2000/ay'),
    createTemplate('tiktok-trend-finder', '🎵 TikTok Trend Bulucu', 'Viral trendleri tespit et ve içerik öner', 'social-media', '🎵', ['tiktok', 'trend', 'viral'], '$300-1000/ay'),
    createTemplate('tiktok-video-scheduler', '📹 TikTok Video Planlayıcı', 'TikTok videolarını planla ve paylaş', 'social-media', '📹', ['tiktok', 'video', 'planlama'], '$200-800/ay'),
    createTemplate('youtube-video-optimizer', '🎬 YouTube Video Optimizer', 'Video SEO için başlık, açıklama, tag optimize et', 'seo', '🎬', ['youtube', 'seo', 'video'], '$400-1500/ay'),
    createTemplate('youtube-comment-responder', '💬 YouTube Yorum Yanıtlayıcı', 'Yorumlara AI ile otomatik yanıt ver', 'social-media', '💬', ['youtube', 'yorum', 'ai'], '$200-800/ay'),
    createTemplate('youtube-analytics-report', '📈 YouTube Analitik Rapor', 'Kanal performans raporu oluştur', 'social-media', '📈', ['youtube', 'analitik', 'rapor'], '$150-600/ay'),
    createTemplate('pinterest-pin-scheduler', '📌 Pinterest Pin Planlayıcı', 'Pinterest pinlerini otomatik paylaş', 'social-media', '📌', ['pinterest', 'pin', 'planlama'], '$150-600/ay'),
    createTemplate('pinterest-seo-optimizer', '🔍 Pinterest SEO Optimizer', 'Pin açıklamalarını SEO için optimize et', 'seo', '🔍', ['pinterest', 'seo', 'anahtar kelime'], '$200-800/ay'),
    createTemplate('discord-server-moderator', '🎮 Discord Sunucu Moderatör', 'Discord sunucusunu AI ile modere et', 'productivity', '🎮', ['discord', 'moderasyon', 'ai'], '$200-800/ay'),
    createTemplate('discord-welcome-bot', '👋 Discord Karşılama Botu', 'Yeni üyeleri otomatik karşıla ve rol ver', 'productivity', '👋', ['discord', 'bot', 'karşılama'], '$100-400/ay'),
    createTemplate('telegram-group-manager', '📨 Telegram Grup Yöneticisi', 'Telegram gruplarını otomatik yönet', 'productivity', '📨', ['telegram', 'grup', 'yönetim'], '$200-800/ay'),
    createTemplate('telegram-broadcast-sender', '📢 Telegram Toplu Mesaj', 'Kanallara otomatik duyuru gönder', 'social-media', '📢', ['telegram', 'broadcast', 'duyuru'], '$150-600/ay'),
    createTemplate('whatsapp-auto-responder', '💚 WhatsApp Oto Yanıtlayıcı', 'WhatsApp mesajlarına AI ile yanıt ver', 'social-media', '💚', ['whatsapp', 'chatbot', 'ai'], '$500-2000/ay'),

    // === AI & CONTENT (51-75) ===
    createTemplate('openai-blog-writer', '✍️ OpenAI Blog Yazarı', 'AI ile SEO uyumlu blog yazıları oluştur', 'content-creation', '✍️', ['openai', 'blog', 'ai'], '$500-2000/ay'),
    createTemplate('chatgpt-email-writer', '📧 ChatGPT Email Yazarı', 'Profesyonel emailler AI ile yaz', 'content-creation', '📧', ['chatgpt', 'email', 'ai'], '$300-1000/ay'),
    createTemplate('chatgpt-product-description', '📝 ChatGPT Ürün Açıklaması', 'E-ticaret ürün açıklamaları oluştur', 'content-creation', '📝', ['chatgpt', 'e-ticaret', 'ai'], '$400-1500/ay'),
    createTemplate('ai-image-generator', '🎨 AI Görsel Üretici', 'Dall-E/Midjourney ile görseller oluştur', 'content-creation', '🎨', ['dalle', 'görsel', 'ai'], '$300-1000/ay'),
    createTemplate('ai-video-script-writer', '🎬 AI Video Senaryo Yazarı', 'YouTube/TikTok için video senaryosu yaz', 'content-creation', '🎬', ['ai', 'video', 'senaryo'], '$400-1500/ay'),
    createTemplate('ai-podcast-transcriber', '🎙️ AI Podcast Transcriber', 'Podcast bölümlerini otomatik yazıya dök', 'content-creation', '🎙️', ['ai', 'podcast', 'transkript'], '$200-800/ay'),
    createTemplate('ai-social-caption', '📱 AI Sosyal Medya Caption', 'Her platforma özel caption oluştur', 'content-creation', '📱', ['ai', 'caption', 'sosyal medya'], '$200-800/ay'),
    createTemplate('ai-seo-keyword-research', '🔍 AI SEO Anahtar Kelime', 'Niche için en iyi anahtar kelimeleri bul', 'seo', '🔍', ['ai', 'seo', 'anahtar kelime'], '$300-1000/ay'),
    createTemplate('ai-competitor-analysis', '📊 AI Rakip Analizi', 'Rakipleri analiz et ve strateji öner', 'data-analysis', '📊', ['ai', 'rakip', 'analiz'], '$400-1500/ay'),
    createTemplate('ai-customer-persona', '👤 AI Müşteri Persona', 'Hedef kitle için persona oluştur', 'data-analysis', '👤', ['ai', 'persona', 'pazarlama'], '$300-1000/ay'),
    createTemplate('ai-ad-copy-generator', '📢 AI Reklam Metni Üretici', 'Yüksek dönüşümlü reklam metinleri yaz', 'content-creation', '📢', ['ai', 'reklam', 'copywriting'], '$500-2000/ay'),
    createTemplate('ai-landing-page-builder', '🏠 AI Landing Page Builder', 'Yüksek dönüşümlü landing page tasarla', 'content-creation', '🏠', ['ai', 'landing page', 'tasarım'], '$600-2500/ay'),
    createTemplate('ai-email-subject-tester', '📧 AI Email Konu Testi', 'En iyi email konu satırını bul', 'email-marketing', '📧', ['ai', 'email', 'a/b test'], '$200-800/ay'),
    createTemplate('ai-chatbot-trainer', '🤖 AI Chatbot Eğitici', 'Müşteri hizmetleri chatbotu eğit', 'customer-service', '🤖', ['ai', 'chatbot', 'müşteri'], '$500-2000/ay'),
    createTemplate('ai-sentiment-analyzer', '😊 AI Duygu Analizi', 'Müşteri yorumlarının duygusunu analiz et', 'data-analysis', '😊', ['ai', 'duygu', 'analiz'], '$300-1000/ay'),
    createTemplate('ai-summarizer', '📋 AI Özetleyici', 'Uzun metinleri özetleyerek zaman kazan', 'productivity', '📋', ['ai', 'özet', 'verimlilik'], '$200-800/ay'),
    createTemplate('ai-translator', '🌐 AI Çevirmen', 'İçerikleri çoklu dillere çevir', 'content-creation', '🌐', ['ai', 'çeviri', 'lokalizasyon'], '$300-1000/ay'),
    createTemplate('ai-code-reviewer', '💻 AI Kod İnceleyici', 'Kodu incele ve iyileştirme öner', 'development', '💻', ['ai', 'kod', 'review'], '$400-1500/ay'),
    createTemplate('ai-sql-generator', '🗄️ AI SQL Generator', 'Doğal dilden SQL sorgusu oluştur', 'development', '🗄️', ['ai', 'sql', 'veritabanı'], '$300-1000/ay'),
    createTemplate('ai-documentation-writer', '📚 AI Dokümantasyon Yazarı', 'API ve proje dokümantasyonu oluştur', 'development', '📚', ['ai', 'dokümantasyon', 'api'], '$400-1500/ay'),
    createTemplate('ai-presentation-maker', '📊 AI Sunum Oluşturucu', 'Profesyonel sunumlar otomatik oluştur', 'productivity', '📊', ['ai', 'sunum', 'powerpoint'], '$300-1000/ay'),
    createTemplate('ai-meeting-notes', '📝 AI Toplantı Notları', 'Toplantıları kaydet ve not çıkar', 'productivity', '📝', ['ai', 'toplantı', 'transkript'], '$200-800/ay'),
    createTemplate('ai-resume-builder', '📄 AI CV Oluşturucu', 'Profesyonel CV ve cover letter yaz', 'productivity', '📄', ['ai', 'cv', 'kariyer'], '$200-800/ay'),
    createTemplate('ai-recipe-generator', '🍳 AI Tarif Üretici', 'Malzemelere göre tarif öner', 'personal', '🍳', ['ai', 'yemek', 'tarif'], '$100-400/ay'),
    createTemplate('ai-fitness-planner', '💪 AI Fitness Planı', 'Kişiye özel egzersiz programı oluştur', 'health', '💪', ['ai', 'fitness', 'sağlık'], '$200-800/ay'),

    // === PRODUCTIVITY & CRM (76-100) ===
    createTemplate('slack-notification-hub', '🔔 Slack Bildirim Merkezi', 'Tüm uygulamalardan Slack\'e bildirim topla', 'productivity', '🔔', ['slack', 'bildirim', 'entegrasyon'], '$200-800/ay'),
    createTemplate('slack-standup-bot', '🤖 Slack Standup Botu', 'Günlük standup toplantılarını otomatik yönet', 'productivity', '🤖', ['slack', 'standup', 'takım'], '$150-600/ay'),
    createTemplate('notion-database-sync', '📓 Notion Veritabanı Sync', 'Notion veritabanlarını diğer sistemlerle senkronize et', 'productivity', '📓', ['notion', 'veritabanı', 'sync'], '$200-800/ay'),
    createTemplate('notion-task-automator', '✅ Notion Görev Otomasyonu', 'Notion görevlerini otomatik yönet', 'productivity', '✅', ['notion', 'görev', 'otomasyon'], '$150-600/ay'),
    createTemplate('airtable-form-processor', '📋 Airtable Form İşleyici', 'Form yanıtlarını otomatik işle', 'productivity', '📋', ['airtable', 'form', 'otomasyon'], '$200-800/ay'),
    createTemplate('airtable-report-generator', '📊 Airtable Rapor Üretici', 'Airtable verilerinden rapor oluştur', 'data-analysis', '📊', ['airtable', 'rapor', 'analiz'], '$250-900/ay'),
    createTemplate('google-sheets-automation', '📗 Google Sheets Otomasyon', 'Spreadsheet işlemlerini otomatize et', 'productivity', '📗', ['google sheets', 'spreadsheet', 'otomasyon'], '$150-600/ay'),
    createTemplate('google-calendar-sync', '📅 Google Calendar Sync', 'Takvimleri çoklu platformlarla senkronize et', 'productivity', '📅', ['google calendar', 'takvim', 'sync'], '$100-400/ay'),
    createTemplate('hubspot-lead-automation', '🧲 HubSpot Lead Otomasyonu', 'Lead\'leri otomatik puanla ve yönlendir', 'money-maker', '🧲', ['hubspot', 'lead', 'crm'], '$500-2000/ay'),
    createTemplate('hubspot-email-sequence', '📧 HubSpot Email Dizisi', 'Otomatik email dizileri oluştur ve gönder', 'email-marketing', '📧', ['hubspot', 'email', 'nurturing'], '$400-1500/ay'),
    createTemplate('salesforce-sync', '☁️ Salesforce Senkronizasyon', 'Satış verilerini otomatik senkronize et', 'money-maker', '☁️', ['salesforce', 'crm', 'sync'], '$500-2000/ay'),
    createTemplate('mailchimp-subscriber-sync', '📬 Mailchimp Abone Sync', 'Aboneleri farklı kaynaklardan senkronize et', 'email-marketing', '📬', ['mailchimp', 'email', 'abone'], '$200-800/ay'),
    createTemplate('mailchimp-campaign-reporter', '📊 Mailchimp Kampanya Rapor', 'Email kampanyası performans raporu oluştur', 'email-marketing', '📊', ['mailchimp', 'kampanya', 'rapor'], '$150-600/ay'),
    createTemplate('sendinblue-automation', '💙 Sendinblue Otomasyon', 'Email marketing akışlarını otomatize et', 'email-marketing', '💙', ['sendinblue', 'email', 'otomasyon'], '$200-800/ay'),
    createTemplate('calendly-webhook-processor', '📅 Calendly Webhook İşleyici', 'Randevu alındığında otomatik aksiyon al', 'productivity', '📅', ['calendly', 'randevu', 'webhook'], '$150-600/ay'),
    createTemplate('zoom-meeting-automator', '🎥 Zoom Toplantı Otomasyon', 'Toplantı oluştur ve katılımcıları bilgilendir', 'productivity', '🎥', ['zoom', 'toplantı', 'video'], '$200-800/ay'),
    createTemplate('google-meet-recorder', '📹 Google Meet Kayıt', 'Toplantıları otomatik kaydet ve paylaş', 'productivity', '📹', ['google meet', 'kayıt', 'toplantı'], '$200-800/ay'),
    createTemplate('jira-ticket-automation', '🎫 Jira Ticket Otomasyon', 'Ticket\'ları otomatik oluştur ve yönet', 'development', '🎫', ['jira', 'ticket', 'proje'], '$300-1000/ay'),
    createTemplate('github-issue-tracker', '🐙 GitHub Issue Takibi', 'Issue\'ları takip et ve bildirim gönder', 'development', '🐙', ['github', 'issue', 'geliştirme'], '$150-600/ay'),
    createTemplate('trello-card-automator', '📋 Trello Kart Otomasyon', 'Trello kartlarını otomatik taşı ve güncelle', 'productivity', '📋', ['trello', 'kart', 'proje'], '$150-600/ay'),
    createTemplate('asana-task-sync', '✅ Asana Görev Sync', 'Asana görevlerini diğer sistemlerle senkronize et', 'productivity', '✅', ['asana', 'görev', 'sync'], '$200-800/ay'),
    createTemplate('monday-automation', '📊 Monday.com Otomasyon', 'Monday.com board\'larını otomatize et', 'productivity', '📊', ['monday', 'board', 'otomasyon'], '$200-800/ay'),
    createTemplate('clickup-task-manager', '✨ ClickUp Görev Yönetimi', 'ClickUp görevlerini otomatik yönet', 'productivity', '✨', ['clickup', 'görev', 'proje'], '$200-800/ay'),
    createTemplate('zendesk-ticket-automation', '🎟️ Zendesk Ticket Otomasyon', 'Destek taleplerini otomatik kategorize et', 'customer-service', '🎟️', ['zendesk', 'destek', 'ticket'], '$400-1500/ay'),
    createTemplate('freshdesk-auto-responder', '💬 Freshdesk Oto Yanıtlayıcı', 'Destek taleplerine AI ile yanıt ver', 'customer-service', '💬', ['freshdesk', 'destek', 'ai'], '$300-1000/ay')
];

export default GITHUB_IMPORTED_TEMPLATES;
