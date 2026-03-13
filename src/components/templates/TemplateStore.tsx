// src/components/templates/TemplateStore.tsx
'use client';
import React, { useState } from 'react';
import { Package, Play, Download, Search, Star, Check, Sparkles, Store } from 'lucide-react';
import { ChatWorkflowBuilder } from './ChatWorkflowBuilder';

// ─── Template types ───────────────────────────────────────────────
export interface AutomationTemplate {
    id: string; name: string; category: string; price: string;
    description: string; longDesc: string; tags: string[]; icon: string;
    difficulty: 'Kolay' | 'Orta' | 'Gelişmiş'; rating: number; downloads: number;
    nodes: any[]; connections: any[]; readme: string;
}

// ─── Category colours ─────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
    'Müşteri Bulma': '#10b981',
    'İçerik Üretimi': '#8b5cf6',
    'E-posta Pazarlama': '#f59e0b',
    'SEO & Analiz': '#3b82f6',
    'Müşteri Hizmetleri': '#ec4899',
    'Belge Otomasyonu': '#06b6d4',
    'Özel Otomasyon': '#6366f1',
};
const DIFF_COLOR: Record<string, string> = {
    'Kolay': '#10b981', 'Orta': '#f59e0b', 'Gelişmiş': '#f87171',
};

// ─── All built-in templates ───────────────────────────────────────
export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
    {
        id: 'google-maps-lead-gen', name: 'Google Maps Lead Engine', category: 'Müşteri Bulma', price: '₺299',
        description: "Google Maps'i tara → işletmeleri bul → potansiyel müşteri üret",
        longDesc: "Google Maps'te belirli kategorilerde iş yeri arar, iletişim bilgilerini toplar, fırsatları puanlar ve kişiselleştirilmiş teklif gönderir. Ajans, SaaS satıcıları ve freelancer'lar için idealdir.",
        tags: ['Lead Gen', 'B2B', 'Scraper', 'CRM', 'E-posta'], icon: '🗺️', difficulty: 'Gelişmiş', rating: 4.9, downloads: 1847,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 40, y: 100 }, label: 'START', data: {} },
            { id: 'n2', type: 'webhook', position: { x: 220, y: 70 }, label: 'Kategori Girişi', data: {} },
            { id: 'n3', type: 'process', position: { x: 420, y: 70 }, label: 'Maps HTTP Tarayıcı', data: {} },
            { id: 'n4', type: 'ai', position: { x: 620, y: 70 }, label: 'Veri Çıkarıcı (LLM)', data: { model: 'gpt-4' } },
            { id: 'n5', type: 'process', position: { x: 220, y: 220 }, label: 'Fırsat Puanlayıcı', data: {} },
            { id: 'n6', type: 'ai', position: { x: 420, y: 220 }, label: 'Teklif Üretici (AI)', data: { model: 'gpt-4-turbo' } },
            { id: 'n7', type: 'output', position: { x: 620, y: 220 }, label: 'E-posta Gönder', data: {} },
            { id: 'n8', type: 'output', position: { x: 620, y: 340 }, label: "CRM'e Kaydet", data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n5', target: 'n6' }, { id: 'c6', source: 'n6', target: 'n7' },
            { id: 'c7', source: 'n6', target: 'n8' },
        ],
        readme: `# 🗺️ Google Maps Lead Engine\n\n**Optimus Studio — v1.0.0**\n\n## Ne Yapar?\n1. Google Maps Tarama — hedef kategoride iş yeri arar\n2. Veri Toplama — ad, telefon, website, e-posta, puan, adres\n3. Fırsat Puanlama — website yok → yüksek fırsat\n4. AI Teklif Üretimi — GPT-4 ile kişiselleştirilmiş e-posta\n5. Aksiyon — e-posta + CRM\n\n## Gereksinimler\n- OpenAI API (GPT-4)\n- Google Places API\n- SMTP\n- Opsiyonel: HubSpot/Airtable\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
    {
        id: 'mind-trap-viral', name: 'Mind Trap — Viral İçerik', category: 'İçerik Üretimi', price: '₺199',
        description: 'Psikoloji bazlı viral kısa video senaryosu üretir',
        longDesc: 'Güncel psikoloji konularında TikTok/Reels videoları için senaryo, hook ve görsel prompt üretir.',
        tags: ['TikTok', 'Viral', 'AI Senaryo', 'Türkçe'], icon: '🧠', difficulty: 'Kolay', rating: 4.8, downloads: 3241,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'START: Viral', data: {} },
            { id: 'n2', type: 'ai', position: { x: 260, y: 100 }, label: 'AI Senaryo', data: { model: 'mixtral' } },
            { id: 'n3', type: 'ai', position: { x: 480, y: 100 }, label: 'Hook Üretici', data: { model: 'mistral' } },
            { id: 'n4', type: 'process', position: { x: 700, y: 100 }, label: 'Görsel Üret', data: {} },
            { id: 'n5', type: 'output', position: { x: 900, y: 100 }, label: 'Video Render', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
        ],
        readme: `# 🧠 Mind Trap — Viral İçerik\n\nPsikoloji + davranış bilimine dayalı viral video içerikleri üretir.\n\n---\n*Optimus Studio*`,
    },
    {
        id: 'trend-content-engine', name: 'Trend İçerik Motoru', category: 'İçerik Üretimi', price: '₺249',
        description: 'Gerçek zamanlı trendleri analiz eder → içerik yayınlar',
        longDesc: 'Google Trends, Twitter/X ve Reddit\'ten trendleri çeker, AI ile Türkçe içerik yazar, otomatik yayınlar.',
        tags: ['Trend', 'SEO', 'Sosyal Medya'], icon: '📈', difficulty: 'Orta', rating: 4.7, downloads: 2108,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'START: Trend', data: {} },
            { id: 'n2', type: 'ai', position: { x: 250, y: 100 }, label: 'Trend Analizi', data: { model: 'gpt-4' } },
            { id: 'n3', type: 'ai', position: { x: 470, y: 100 }, label: 'İçerik Yaz', data: { model: 'mixtral' } },
            { id: 'n4', type: 'output', position: { x: 680, y: 100 }, label: 'Yayınla', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' },
        ],
        readme: `# 📈 Trend İçerik Motoru\n\nTrendleri bulur, Türkçe içerik üretir, yayınlar.\n\n---\n*Optimus Studio*`,
    },
    {
        id: 'email-sequence-bot', name: 'E-posta Dizisi Botu', category: 'E-posta Pazarlama', price: '₺179',
        description: 'Otomatik e-posta dizisi → açılma takibi → follow-up',
        longDesc: '5 adımlı e-posta dizisi gönderir, açılmaları takip eder, follow-up yapar.',
        tags: ['E-posta', 'Drip', 'Follow-up', 'CRM'], icon: '📧', difficulty: 'Kolay', rating: 4.6, downloads: 4552,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'START: Liste', data: {} },
            { id: 'n2', type: 'ai', position: { x: 260, y: 100 }, label: 'E-posta Yaz', data: { model: 'gpt-4' } },
            { id: 'n3', type: 'output', position: { x: 480, y: 100 }, label: 'E-posta Gönder', data: {} },
            { id: 'n4', type: 'process', position: { x: 480, y: 240 }, label: 'Açılma Takibi', data: {} },
            { id: 'n5', type: 'output', position: { x: 700, y: 240 }, label: 'Follow-up', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
        ],
        readme: `# 📧 E-posta Dizisi Botu\n\nOtomatik 5 adımlı e-posta dizisi.\n\n---\n*Optimus Studio*`,
    },
    {
        id: 'local-seo-reporter', name: 'Yerel SEO Analiz Botu', category: 'SEO & Analiz', price: '₺229',
        description: 'İşletmelerin SEO durumunu analiz eder → rapor gönderir',
        longDesc: 'Website SEO puanını çeker, rakip analizi yapar, Türkçe rapor gönderir.',
        tags: ['SEO', 'Analiz', 'Rapor', 'B2B'], icon: '🔍', difficulty: 'Orta', rating: 4.5, downloads: 987,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'START', data: {} },
            { id: 'n2', type: 'process', position: { x: 250, y: 100 }, label: 'SEO Tarayıcı', data: {} },
            { id: 'n3', type: 'ai', position: { x: 450, y: 100 }, label: 'AI SEO Analiz', data: { model: 'gpt-4' } },
            { id: 'n4', type: 'ai', position: { x: 660, y: 100 }, label: 'Rapor Yaz', data: { model: 'gpt-4' } },
            { id: 'n5', type: 'output', position: { x: 860, y: 100 }, label: 'Rapor Gönder', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
        ],
        readme: `# 🔍 Yerel SEO Analiz Botu\n\nSEO durumunu analiz eder ve raporlar.\n\n---\n*Optimus Studio*`,
    },
    {
        id: 'sessiz-guc-business', name: 'Sessiz Güç — İş & Finans', category: 'İçerik Üretimi', price: '₺199',
        description: 'Motivasyon + finans içerikleri için tam otomasyon',
        longDesc: 'LinkedIn, YouTube ve Instagram için motivasyon/finans içerik paketleri üretir.',
        tags: ['LinkedIn', 'Finans', 'Motivasyon', 'B2B'], icon: '💼', difficulty: 'Kolay', rating: 4.7, downloads: 2876,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'START: İş', data: {} },
            { id: 'n2', type: 'ai', position: { x: 270, y: 100 }, label: 'Motivasyon Script', data: { model: 'gpt-4' } },
            { id: 'n3', type: 'process', position: { x: 490, y: 100 }, label: 'Görsel Eşle', data: {} },
            { id: 'n4', type: 'output', position: { x: 700, y: 100 }, label: 'LinkedIn/Insta Yükle', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' },
        ],
        readme: `# 💼 Sessiz Güç — İş & Finans\n\nMotivasyonel iş içerikleri üretir.\n\n---\n*Optimus Studio*`,
    },
    // ── NEW: GitHub-inspired research-backed ────────────────────────
    {
        id: 'youtube-lead-harvester', name: 'YouTube Lead Harvester', category: 'Müşteri Bulma', price: '₺279',
        description: "YouTube yorumlarını tara → alıcı niyeti tespit → CRM'e aktar",
        longDesc: "Hedef niş videolardaki yorumları tarar, AI ile satın alma niyeti olanları tespit eder ve otomatik e-posta/DM sequence başlatır. GitHub'da en çok ⭐ alan scraper yaklaşımının Optimus versiyonu — %50 daha akıllı AI filtreleme ile.",
        tags: ['YouTube', 'Lead', 'Yorum', 'AI', 'DM'], icon: '🎯', difficulty: 'Gelişmiş', rating: 4.9, downloads: 2341,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'Zamanlayıcı', data: {} },
            { id: 'n2', type: 'process', position: { x: 260, y: 100 }, label: 'YouTube Yorum Çek', data: {} },
            { id: 'n3', type: 'ai', position: { x: 480, y: 100 }, label: 'Niyet Analizi (LLM)', data: { model: 'gpt-4' } },
            { id: 'n4', type: 'process', position: { x: 700, y: 100 }, label: 'Profil Zenginleştir', data: {} },
            { id: 'n5', type: 'ai', position: { x: 260, y: 260 }, label: 'Mesaj Üret (AI)', data: { model: 'gpt-4-turbo' } },
            { id: 'n6', type: 'output', position: { x: 480, y: 260 }, label: 'E-posta / DM Gönder', data: {} },
            { id: 'n7', type: 'output', position: { x: 700, y: 260 }, label: "CRM'e Ekle", data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n5', target: 'n6' }, { id: 'c6', source: 'n5', target: 'n7' },
        ],
        readme: `# 🎯 YouTube Lead Harvester\n\nYouTube yorumlarından satın alma niyeti olanları bulur.\n\n## Gereksinimler\n- YouTube Data API v3\n- OpenAI API (GPT-4)\n- SMTP / LinkedIn API\n- CRM entegrasyonu\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
    {
        id: 'ai-support-triage', name: 'AI Müşteri Destek Triyajı', category: 'Müşteri Hizmetleri', price: '₺299',
        description: 'Gelen e-posta → AI sınıflandır → yönlendir → otomatik yanıt',
        longDesc: 'Helpdesk bildirimlerini sınıflandırır, öncelik puanı verir, doğru ekibe yönlendirir ve GPT-4 ile ilk yanıtı üretir. HubSpot/Zendesk entegrasyonu hazır. Yardım masası maliyetini %60 düşürür.',
        tags: ['Destek', 'Triyaj', 'AI', 'CRM', 'Zendesk'], icon: '🎫', difficulty: 'Orta', rating: 4.8, downloads: 1923,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 120 }, label: 'E-posta/Webhook', data: {} },
            { id: 'n2', type: 'ai', position: { x: 260, y: 120 }, label: 'Talep Sınıflandır', data: { model: 'gpt-4' } },
            { id: 'n3', type: 'process', position: { x: 480, y: 120 }, label: 'Öncelik Puanla', data: {} },
            { id: 'n4', type: 'ai', position: { x: 700, y: 120 }, label: 'Yanıt Üret (AI)', data: { model: 'gpt-4-turbo' } },
            { id: 'n5', type: 'output', position: { x: 480, y: 280 }, label: 'Ekip Yönlendir', data: {} },
            { id: 'n6', type: 'output', position: { x: 700, y: 280 }, label: 'Otomatik Yanıt', data: {} },
            { id: 'n7', type: 'output', position: { x: 920, y: 120 }, label: 'CRM Güncelle', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n4', target: 'n6' }, { id: 'c6', source: 'n4', target: 'n7' },
        ],
        readme: `# 🎫 AI Müşteri Destek Triyajı\n\nGelen destek taleplerini otomatik sınıflandırır.\n\n## Azaltılan Maliyet\n- İlk yanıt süresi: 2 saat → 30 saniye\n- Hatalı yönlendirme: %40 azalması\n\n## Gereksinimler\n- SMTP / Zendesk API\n- OpenAI API (GPT-4)\n- CRM (HubSpot / Pipedrive)\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
    {
        id: 'linkedin-prospecting', name: 'LinkedIn Prospecting Engine', category: 'Müşteri Bulma', price: '₺349',
        description: "LinkedIn'den B2B profil topla → ICP puanla → kişisel mesaj gönder",
        longDesc: "Hedef sektör ve ünvana göre LinkedIn profillerini bulur, AI ile ICP puanı verir, kişiselleştirilmiş mesaj üretir. PhantomBuster'dan %50 daha akıllı — AI puanlama sayesinde doğru kişilere ulaşılır.",
        tags: ['LinkedIn', 'B2B', 'Lead', 'Outreach', 'ICP'], icon: '🏢', difficulty: 'Gelişmiş', rating: 4.9, downloads: 1456,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 120 }, label: 'ICP Filtresi Gir', data: {} },
            { id: 'n2', type: 'process', position: { x: 260, y: 120 }, label: 'LinkedIn Arama', data: {} },
            { id: 'n3', type: 'ai', position: { x: 480, y: 120 }, label: 'ICP Puanlaması', data: { model: 'gpt-4' } },
            { id: 'n4', type: 'process', position: { x: 700, y: 120 }, label: 'Profil Zenginleştir', data: {} },
            { id: 'n5', type: 'ai', position: { x: 260, y: 280 }, label: 'Mesaj Yaz (AI)', data: { model: 'gpt-4-turbo' } },
            { id: 'n6', type: 'output', position: { x: 480, y: 280 }, label: 'Bağlantı İsteği', data: {} },
            { id: 'n7', type: 'output', position: { x: 700, y: 280 }, label: 'CRM Pipeline', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n5', target: 'n6' }, { id: 'c6', source: 'n5', target: 'n7' },
        ],
        readme: `# 🏢 LinkedIn Prospecting Engine\n\n## PhantomBuster'dan Farkı\n- AI tabanlı ICP puanlama\n- Kişiselleştirilmiş mesaj şablonu\n- CRM entegrasyonu\n\n## Gereksinimler\n- LinkedIn API / RapidAPI\n- OpenAI API (GPT-4)\n- HubSpot veya Pipedrive CRM\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
    {
        id: 'pdf-invoice-processor', name: 'PDF Fatura İşleyici', category: 'Belge Otomasyonu', price: '₺259',
        description: 'PDF fatura yükle → AI veri çek → muhasebe sistemine aktar',
        longDesc: "Gelen PDF faturaları AI ile işler: tutar, tarih, firma adı, vergi no çıkarır, doğrular ve muhasebe uygulamasına yazar. GitHub'da 12k+ yıldız alan document AI yaklaşımının Optimus versiyonu.",
        tags: ['PDF', 'Fatura', 'AI', 'Muhasebe', 'OCR'], icon: '📄', difficulty: 'Orta', rating: 4.7, downloads: 3102,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 120 }, label: 'E-posta Eki Tetik', data: {} },
            { id: 'n2', type: 'process', position: { x: 250, y: 120 }, label: 'PDF İndir', data: {} },
            { id: 'n3', type: 'ai', position: { x: 460, y: 120 }, label: 'OCR + Veri Çıkar', data: { model: 'gpt-4-vision' } },
            { id: 'n4', type: 'process', position: { x: 680, y: 120 }, label: 'Veri Doğrula', data: {} },
            { id: 'n5', type: 'output', position: { x: 460, y: 280 }, label: 'Airtable/Excel Yaz', data: {} },
            { id: 'n6', type: 'output', position: { x: 680, y: 280 }, label: 'Muhasebe Sistemi', data: {} },
            { id: 'n7', type: 'output', position: { x: 900, y: 120 }, label: 'E-posta Onay', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n4', target: 'n6' }, { id: 'c6', source: 'n4', target: 'n7' },
        ],
        readme: `# 📄 PDF Fatura İşleyici\n\nGelen faturaları otomatik işler ve kaydeder.\n\n## Çıkarılan Veriler\n- Firma adı, vergi no, adres\n- Tarih, son ödeme, tutar, KDV\n\n## Gereksinimler\n- SMTP (eki almak için)\n- OpenAI Vision API\n- Airtable / Google Sheets\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
    {
        id: 'competitor-spy-bot', name: 'Rakip Gözetleme Botu', category: 'SEO & Analiz', price: '₺239',
        description: 'Rakip siteleri izle → değişiklik tespit → AI strateji öner',
        longDesc: 'Rakip firmaların fiyat, ürün, içerik değişikliklerini takip eder ve AI ile karşı strateji üretir.',
        tags: ['Rakip', 'İzleme', 'Strateji', 'Fiyat', 'AI'], icon: '🕵️', difficulty: 'Orta', rating: 4.6, downloads: 876,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 120 }, label: 'Zamanlayıcı (6h)', data: {} },
            { id: 'n2', type: 'process', position: { x: 260, y: 120 }, label: 'Rakip Crawl', data: {} },
            { id: 'n3', type: 'process', position: { x: 480, y: 120 }, label: 'Diff Karşılaştır', data: {} },
            { id: 'n4', type: 'ai', position: { x: 700, y: 120 }, label: 'Değişiklik Analizi', data: { model: 'gpt-4' } },
            { id: 'n5', type: 'ai', position: { x: 480, y: 280 }, label: 'Strateji Üret', data: { model: 'gpt-4-turbo' } },
            { id: 'n6', type: 'output', position: { x: 700, y: 280 }, label: 'Slack/Email Uyarı', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n5', target: 'n6' },
        ],
        readme: `# 🕵️ Rakip Gözetleme Botu\n\nRakiplerin ne yaptığını 7/24 izler.\n\n## Takip Edilen\n- Fiyat değişiklikleri\n- Yeni ürün/hizmet\n- İçerik güncellemeleri\n\n## Gereksinimler\n- Puppeteer (crawling)\n- OpenAI API (GPT-4)\n- Slack veya SMTP alert\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
    {
        id: 'whatsapp-business-ai', name: 'WhatsApp Business AI', category: 'Müşteri Hizmetleri', price: '₺329',
        description: 'WhatsApp mesajları → AI anla → yanıt → randevu/sipariş',
        longDesc: 'WhatsApp Business API üzerinden gelen mesajları GPT-4 ile anlar, yanıt verir, randevu veya sipariş alır. Kuaförler, doktorlar, restoranlar için hazır.',
        tags: ['WhatsApp', 'AI', 'Chatbot', 'Randevu', 'Sipariş'], icon: '💬', difficulty: 'Gelişmiş', rating: 4.9, downloads: 2654,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 120 }, label: 'WhatsApp Webhook', data: {} },
            { id: 'n2', type: 'ai', position: { x: 260, y: 120 }, label: 'Niyet Tanı (LLM)', data: { model: 'gpt-4' } },
            { id: 'n3', type: 'process', position: { x: 480, y: 120 }, label: 'Müşteri Ara', data: {} },
            { id: 'n4', type: 'ai', position: { x: 700, y: 120 }, label: 'Yanıt Üret', data: { model: 'gpt-4-turbo' } },
            { id: 'n5', type: 'output', position: { x: 480, y: 280 }, label: 'WhatsApp Yanıt', data: {} },
            { id: 'n6', type: 'output', position: { x: 700, y: 280 }, label: 'Randevu/Sipariş', data: {} },
            { id: 'n7', type: 'output', position: { x: 920, y: 120 }, label: 'CRM Güncelle', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
            { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            { id: 'c5', source: 'n4', target: 'n6' }, { id: 'c6', source: 'n4', target: 'n7' },
        ],
        readme: `# 💬 WhatsApp Business AI\n\nWhatsApp gelen mesajları otomatik yönetir.\n\n## Uygun Sektörler\n- Kuaförler (randevu)\n- Doktor / Klinik\n- Restoran (sipariş)\n- E-ticaret (takip)\n\n## Gereksinimler\n- WhatsApp Business API (Meta)\n- OpenAI API (GPT-4)\n- Google Calendar / Randevu sistemi\n\n---\n*Optimus Studio — AI Fabrikası v3.1*`,
    },
];

// ─── ZIP download helper ──────────────────────────────────────────
async function downloadTemplateZip(template: AutomationTemplate) {
    const manifest = {
        name: template.name, id: template.id, version: '1.0.0',
        category: template.category, difficulty: template.difficulty,
        price: template.price, created: new Date().toISOString(), platform: 'optimus-studio',
    };
    const workflowJson = { manifest, workflow: { nodes: template.nodes, connections: template.connections } };
    try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const folder = zip.folder(template.id)!;
        folder.file('workflow.json', JSON.stringify(workflowJson, null, 2));
        folder.file('README.md', template.readme);
        folder.file('manifest.json', JSON.stringify(manifest, null, 2));
        folder.file('preview.txt', `Optimus Studio — ${template.name}\nNode: ${template.nodes.length}\nBağlantı: ${template.connections.length}`);
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${template.id}-optimus.zip`; a.click();
        URL.revokeObjectURL(url);
    } catch {
        const blob = new Blob([JSON.stringify(workflowJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${template.id}.json`; a.click();
        URL.revokeObjectURL(url);
    }
}

// ─── Template Card ────────────────────────────────────────────────
interface CardProps {
    template: AutomationTemplate;
    selected: boolean;
    downloaded: boolean;
    onSelect: () => void;
    onLoad: () => void;
    onDownload: () => void;
}
const TemplateCard = ({ template, selected, downloaded, onSelect, onLoad, onDownload }: CardProps) => (
    <div onClick={onSelect} className="rounded-xl cursor-pointer"
        style={{
            background: 'var(--bg-raised)', padding: 16,
            border: `1px solid ${selected ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
            boxShadow: selected ? '0 0 0 1.5px var(--accent-green)' : 'none',
        }}>
        <div className="flex items-start justify-between mb-3">
            <span style={{ fontSize: 28 }}>{template.icon}</span>
            <div className="text-right">
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-green)' }}>{template.price}</div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: 10, color: '#f59e0b' }}>{template.rating}</span>
                </div>
            </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{template.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>{template.description}</div>
        <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {tag}
                </span>
            ))}
        </div>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${CAT_COLOR[template.category] ?? '#888'}22`, color: CAT_COLOR[template.category] ?? '#888' }}>
                    {template.category}
                </span>
                <span style={{ fontSize: 10, color: DIFF_COLOR[template.difficulty] }}>{template.difficulty}</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>↓ {template.downloads.toLocaleString()}</span>
        </div>
        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium"
                style={{ background: 'rgba(43,202,141,0.12)', color: 'var(--accent-green)', border: '1px solid rgba(43,202,141,0.25)' }}
                onClick={e => { e.stopPropagation(); onLoad(); }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(43,202,141,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(43,202,141,0.12)')}>
                <Play size={11} fill="currentColor" /> Canvas'a Yükle
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                style={{
                    background: downloaded ? 'rgba(16,185,129,0.12)' : 'rgba(139,92,246,0.12)',
                    color: downloaded ? '#10b981' : '#a78bfa',
                    border: `1px solid ${downloaded ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.25)'}`,
                }}
                onClick={e => { e.stopPropagation(); onDownload(); }}>
                {downloaded ? <Check size={11} /> : <Download size={11} />} ZIP
            </button>
        </div>
    </div>
);

// ─── Main TemplateStore ───────────────────────────────────────────
interface TemplateStoreProps {
    onLoadTemplate: (template: AutomationTemplate) => void;
}

export const TemplateStore = ({ onLoadTemplate }: TemplateStoreProps) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Tümü');
    const [selected, setSelected] = useState<AutomationTemplate | null>(null);
    const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
    const [activeView, setActiveView] = useState<'store' | 'chat'>('store');
    const [aiTemplates, setAiTemplates] = useState<AutomationTemplate[]>([]);

    const allTemplates = [...AUTOMATION_TEMPLATES, ...aiTemplates];
    const categories = ['Tümü', ...Array.from(new Set(allTemplates.map(t => t.category)))];
    const filtered = allTemplates.filter(t => {
        const matchCat = category === 'Tümü' || t.category === category;
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchSearch;
    });

    const handleDownload = async (template: AutomationTemplate) => {
        await downloadTemplateZip(template);
        setDownloaded(prev => new Set(prev).add(template.id));
    };

    const TabBtn = ({ id, icon, label }: { id: 'store' | 'chat'; icon: React.ReactNode; label: string }) => (
        <button onClick={() => setActiveView(id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium"
            style={{
                borderBottom: activeView === id ? '2px solid var(--accent-green)' : '2px solid transparent',
                color: activeView === id ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'transparent',
            }}>
            {icon} {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>

            {/* ── Top nav ──────────── */}
            <div className="flex items-center justify-between flex-shrink-0 px-4"
                style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-subtle)', height: 44 }}>
                <div className="flex items-center">
                    <TabBtn id="store" icon={<Store size={13} />} label={`Mağaza (${allTemplates.length})`} />
                    <TabBtn id="chat" icon={<Sparkles size={13} />} label="Konuş & Oluştur" />
                </div>
                {activeView === 'store' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
                        <Search size={12} style={{ color: 'var(--text-muted)' }} />
                        <input className="bg-transparent outline-none"
                            style={{ fontSize: 11, color: 'var(--text-primary)', width: 180 }}
                            placeholder="Ara... (lead, destek, fatura...)"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                )}
            </div>

            {/* ── Category filter ── */}
            {activeView === 'store' && (
                <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-shrink-0"
                    style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                            style={{
                                background: category === cat ? 'var(--accent-green)' : 'var(--bg-elevated)',
                                color: category === cat ? '#000' : 'var(--text-secondary)',
                                border: `1px solid ${category === cat ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                            }}>{cat}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Chat view ──────── */}
            {activeView === 'chat' && (
                <div className="flex-1 overflow-hidden">
                    <ChatWorkflowBuilder
                        onGenerateTemplate={t => setAiTemplates(prev => [...prev, t])}
                        onLoadTemplate={template => { onLoadTemplate(template); setActiveView('store'); }}
                    />
                </div>
            )}

            {/* ── Store grid + detail ── */}
            {activeView === 'store' && (
                <div className="flex flex-1 overflow-hidden">
                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {filtered.map(template => (
                                <TemplateCard key={template.id} template={template}
                                    selected={selected?.id === template.id}
                                    downloaded={downloaded.has(template.id)}
                                    onSelect={() => setSelected(template)}
                                    onLoad={() => onLoadTemplate(template)}
                                    onDownload={() => handleDownload(template)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Detail pane */}
                    {selected && (
                        <div className="flex-shrink-0 overflow-y-auto custom-scrollbar"
                            style={{ width: 300, borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-raised)', padding: 16 }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{selected.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selected.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{selected.longDesc}</div>
                            <div className="flex items-center gap-2 mb-3">
                                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>{selected.price}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>tek seferlik</span>
                            </div>
                            <div className="flex gap-3 mb-3">
                                {[{ v: selected.nodes.length, l: 'Node' }, { v: selected.rating, l: 'Puan' }, { v: selected.downloads.toLocaleString(), l: 'İndirme' }].map(({ v, l }) => (
                                    <div key={l} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{v}</div>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Akış Adımları</div>
                                {selected.nodes.map((node, i) => (
                                    <div key={i} className="flex items-center gap-2 py-1">
                                        <span style={{ width: 16, height: 16, background: 'var(--accent-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#000', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{node.label}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold mb-2"
                                style={{ background: 'var(--accent-green)', color: '#000' }}
                                onClick={() => onLoadTemplate(selected)}>
                                <Play size={12} fill="black" /> Canvas'a Yükle
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold"
                                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
                                onClick={() => handleDownload(selected)}>
                                <Package size={12} /> ZIP İndir (Satışa Hazır)
                            </button>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                                workflow.json + README.md + manifest.json
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
