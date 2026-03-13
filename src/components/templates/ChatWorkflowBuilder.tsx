// src/components/templates/ChatWorkflowBuilder.tsx
// ─── Konuş & Oluştur: Chat-to-Workflow AI Builder ───────────────
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Plus, RefreshCw } from 'lucide-react';
import { AutomationTemplate } from './TemplateStore';

interface Message { role: 'user' | 'ai'; text: string; template?: AutomationTemplate; }

// Pattern matcher — parses natural language to workflow structure
const parseIntent = (text: string): AutomationTemplate | null => {
    const lower = text.toLowerCase();
    const now = Date.now();

    // ─── Lead / scraping patterns ───────────────────────────────
    if (lower.includes('maps') || lower.includes('harita') || lower.includes('lead') || lower.includes('müşteri bul')) {
        return {
            id: `ai-gen-${now}`, name: 'AI: Local Lead Engine', category: 'Müşteri Bulma', price: '₺299',
            description: 'Haritadan işletme bul → puanla → teklif gönder',
            longDesc: 'AI tarafından oluşturuldu.', tags: ['Lead', 'Maps', 'AI'], icon: '🗺️',
            difficulty: 'Gelişmiş', rating: 5.0, downloads: 0,
            nodes: [
                { id: `n1`, type: 'trigger', position: { x: 50, y: 100 }, label: 'START', data: {} },
                { id: `n2`, type: 'process', position: { x: 260, y: 100 }, label: 'Maps Tarayıcı', data: {} },
                { id: `n3`, type: 'ai', position: { x: 480, y: 100 }, label: 'LLM Veri Çıkar', data: { model: 'gpt-4' } },
                { id: `n4`, type: 'process', position: { x: 700, y: 100 }, label: 'Fırsat Puanla', data: {} },
                { id: `n5`, type: 'ai', position: { x: 260, y: 250 }, label: 'Teklif Üret', data: { model: 'gpt-4-turbo' } },
                { id: `n6`, type: 'output', position: { x: 480, y: 250 }, label: 'E-posta Gönder', data: {} },
                { id: `n7`, type: 'output', position: { x: 700, y: 250 }, label: "CRM Kaydet", data: {} },
            ],
            connections: [
                { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
                { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
                { id: 'c5', source: 'n5', target: 'n6' }, { id: 'c6', source: 'n5', target: 'n7' },
            ],
            readme: `# AI: Local Lead Engine\n\nAI tarafından otomatik oluşturuldu.\n\n---\n*Optimus Studio AI Builder*`,
        };
    }

    // ─── Content / social media ─────────────────────────────────
    if (lower.includes('içerik') || lower.includes('tiktok') || lower.includes('instagram') || lower.includes('video') || lower.includes('viral')) {
        return {
            id: `ai-gen-${now}`, name: 'AI: Viral İçerik Fabrikası', category: 'İçerik Üretimi', price: '₺249',
            description: 'Trend analizi → senaryo → görsel → yayınla',
            longDesc: 'AI tarafından oluşturuldu.', tags: ['Viral', 'TikTok', 'AI'], icon: '🎬',
            difficulty: 'Orta', rating: 5.0, downloads: 0,
            nodes: [
                { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'Zamanlayıcı', data: {} },
                { id: 'n2', type: 'ai', position: { x: 260, y: 100 }, label: 'Trend Analizi', data: { model: 'gpt-4' } },
                { id: 'n3', type: 'ai', position: { x: 480, y: 100 }, label: 'Senaryo Yaz', data: { model: 'mixtral' } },
                { id: 'n4', type: 'ai', position: { x: 700, y: 100 }, label: 'Hook Üret', data: { model: 'mistral' } },
                { id: 'n5', type: 'process', position: { x: 920, y: 100 }, label: 'Görsel Üret', data: {} },
                { id: 'n6', type: 'output', position: { x: 1120, y: 100 }, label: 'Yayınla', data: {} },
            ],
            connections: [
                { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
                { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
                { id: 'c5', source: 'n5', target: 'n6' },
            ],
            readme: `# AI: Viral İçerik Fabrikası\n\nAI tarafından otomatik oluşturuldu.\n\n---\n*Optimus Studio AI Builder*`,
        };
    }

    // ─── E-mail / outreach ──────────────────────────────────────
    if (lower.includes('e-posta') || lower.includes('email') || lower.includes('mail') || lower.includes('bülten') || lower.includes('newsletter')) {
        return {
            id: `ai-gen-${now}`, name: 'AI: Akıllı E-posta Dizisi', category: 'E-posta Pazarlama', price: '₺199',
            description: 'Kişiselleştirilmiş e-posta dizisi + follow-up',
            longDesc: 'AI tarafından oluşturuldu.', tags: ['E-posta', 'Follow-up'], icon: '📧',
            difficulty: 'Kolay', rating: 5.0, downloads: 0,
            nodes: [
                { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'E-posta Tetik', data: {} },
                { id: 'n2', type: 'ai', position: { x: 260, y: 100 }, label: 'Kişiselleştir', data: { model: 'gpt-4' } },
                { id: 'n3', type: 'output', position: { x: 480, y: 100 }, label: 'E-posta Gönder', data: {} },
                { id: 'n4', type: 'process', position: { x: 480, y: 240 }, label: 'Açılma Takibi', data: {} },
                { id: 'n5', type: 'ai', position: { x: 700, y: 240 }, label: 'Follow-up Yaz', data: { model: 'gpt-4' } },
                { id: 'n6', type: 'output', position: { x: 920, y: 240 }, label: 'Follow-up Gönder', data: {} },
            ],
            connections: [
                { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
                { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
                { id: 'c5', source: 'n5', target: 'n6' },
            ],
            readme: `# AI: Akıllı E-posta Dizisi\n\nAI tarafından otomatik oluşturuldu.\n\n---\n*Optimus Studio AI Builder*`,
        };
    }

    // ─── SEO / content analysis ─────────────────────────────────
    if (lower.includes('seo') || lower.includes('rakip') || lower.includes('analiz') || lower.includes('competitor')) {
        return {
            id: `ai-gen-${now}`, name: 'AI: Rakip İzleme & SEO Uyarı', category: 'SEO & Analiz', price: '₺229',
            description: 'Rakip sitelerini izle → değişiklik tespit → uyar',
            longDesc: 'AI tarafından oluşturuldu.', tags: ['SEO', 'Rakip', 'Analiz'], icon: '🔍',
            difficulty: 'Orta', rating: 5.0, downloads: 0,
            nodes: [
                { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'Zamanlayıcı', data: {} },
                { id: 'n2', type: 'process', position: { x: 260, y: 100 }, label: 'Rakip Site Crawl', data: {} },
                { id: 'n3', type: 'ai', position: { x: 480, y: 100 }, label: 'Değişiklik Analizi', data: { model: 'gpt-4' } },
                { id: 'n4', type: 'ai', position: { x: 700, y: 100 }, label: 'Strateji Öner', data: { model: 'gpt-4-turbo' } },
                { id: 'n5', type: 'output', position: { x: 900, y: 100 }, label: 'Slack/E-posta Uyarı', data: {} },
            ],
            connections: [
                { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
                { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
            ],
            readme: `# AI: Rakip İzleme & SEO Uyarı\n\nAI tarafından otomatik oluşturuldu.\n\n---\n*Optimus Studio AI Builder*`,
        };
    }

    // ─── Customer support ───────────────────────────────────────
    if (lower.includes('destek') || lower.includes('support') || lower.includes('şikayet') || lower.includes('müşteri hizmet')) {
        return {
            id: `ai-gen-${now}`, name: 'AI: Akıllı Destek Triyajı', category: 'Müşteri Hizmetleri', price: '₺299',
            description: 'Gelen talep → sınıflandır → yönlendir → otomatik yanıt',
            longDesc: 'AI tarafından oluşturuldu.', tags: ['Destek', 'AI', 'CRM'], icon: '🎫',
            difficulty: 'Orta', rating: 5.0, downloads: 0,
            nodes: [
                { id: 'n1', type: 'trigger', position: { x: 50, y: 100 }, label: 'E-posta/Webhook', data: {} },
                { id: 'n2', type: 'ai', position: { x: 260, y: 100 }, label: 'Talep Sınıflandır', data: { model: 'gpt-4' } },
                { id: 'n3', type: 'process', position: { x: 480, y: 100 }, label: 'Öncelik Puanla', data: {} },
                { id: 'n4', type: 'ai', position: { x: 700, y: 100 }, label: 'Yanıt Üret', data: { model: 'gpt-4-turbo' } },
                { id: 'n5', type: 'output', position: { x: 480, y: 250 }, label: 'Ekip Yönlendir', data: {} },
                { id: 'n6', type: 'output', position: { x: 700, y: 250 }, label: 'Otomatik Yanıt', data: {} },
                { id: 'n7', type: 'output', position: { x: 920, y: 100 }, label: 'CRM Güncelle', data: {} },
            ],
            connections: [
                { id: 'c1', source: 'n1', target: 'n2' }, { id: 'c2', source: 'n2', target: 'n3' },
                { id: 'c3', source: 'n3', target: 'n4' }, { id: 'c4', source: 'n4', target: 'n5' },
                { id: 'c5', source: 'n4', target: 'n6' }, { id: 'c6', source: 'n4', target: 'n7' },
            ],
            readme: `# AI: Akıllı Destek Triyajı\n\nAI tarafından otomatik oluşturuldu.\n\n---\n*Optimus Studio AI Builder*`,
        };
    }

    // ─── Generic fallback ───────────────────────────────────────
    return {
        id: `ai-gen-${now}`,
        name: `AI: ${text.slice(0, 40)}...`,
        category: 'Özel Otomasyon', price: '₺249',
        description: text.slice(0, 80),
        longDesc: 'Kullanıcı isteğiyle AI tarafından oluşturuldu.',
        tags: ['AI', 'Özel'], icon: '✨',
        difficulty: 'Orta', rating: 5.0, downloads: 0,
        nodes: [
            { id: 'n1', type: 'trigger', position: { x: 50, y: 120 }, label: 'Tetikleyici', data: {} },
            { id: 'n2', type: 'ai', position: { x: 260, y: 120 }, label: 'AI İşlem', data: { model: 'gpt-4' } },
            { id: 'n3', type: 'output', position: { x: 480, y: 120 }, label: 'Çıktı/Aksiyon', data: {} },
        ],
        connections: [
            { id: 'c1', source: 'n1', target: 'n2' },
            { id: 'c2', source: 'n2', target: 'n3' },
        ],
        readme: `# ${text.slice(0, 40)}\n\nAI tarafından otomatik oluşturuldu.\n\n---\n*Optimus Studio AI Builder*`,
    };
};

const AI_SUGGESTIONS = [
    'Google Maps\'ten kuaför müşterisi bul',
    'TikTok viral içerik otomasyonu',
    'Rakip web sitelerimi izle ve uyar',
    'Gelen destek e-postalarını otomatik yanıtla',
    'LinkedIn\'den B2B lead topla ve CRM\'e kaydet',
    'PDF faturaları oku ve muhasebe sistemine aktar',
    'YouTube yorumlarından potansiyel müşteri bul',
];

interface ChatWorkflowBuilderProps {
    onGenerateTemplate: (template: AutomationTemplate) => void;
    onLoadTemplate: (template: AutomationTemplate) => void;
}

export const ChatWorkflowBuilder = ({ onGenerateTemplate, onLoadTemplate }: ChatWorkflowBuilderProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            text: '👋 Merhaba! Hangi otomasyonu oluşturmak istediğinizi Türkçe anlatın.\n\nÖrnekler:\n• "Google Maps\'ten lead topla, e-posta gönder"\n• "TikTok için viral içerik oluştur"\n• "Müşteri destek e-postalarını otomatik yanıtla"',
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedTemplate, setGeneratedTemplate] = useState<AutomationTemplate | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

        const template = parseIntent(text);
        const aiResponse = template
            ? `✅ Otomasyon yapısı oluşturuldu: **${template.name}**\n\n📊 ${template.nodes.length} node, ${template.connections.length} bağlantı\n\n🎯 Kategori: ${template.category}\n💰 Tahmini değer: ${template.price}\n\nAşağıdan Canvas'a yükleyebilir veya ZIP olarak indirebilirsiniz:`
            : `Anlıyorum! Daha spesifik anlatabilir misiniz? Örneğin:\n• Hangi kaynaktan veri çekilecek?\n• Çıktı nereye gidecek?\n• Hangi AI modeli kullanılsın?`;

        setMessages(prev => [...prev, { role: 'ai', text: aiResponse, template: template || undefined }]);
        if (template) {
            setGeneratedTemplate(template);
            onGenerateTemplate(template);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
            {/* Header */}
            <div className="px-4 py-3 flex-shrink-0 flex items-center gap-3"
                style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                    <Sparkles size={14} className="text-white" />
                </div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Konuş & Oluştur</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Doğal dille otomasyon tasarla</div>
                </div>
            </div>

            {/* Quick suggestions */}
            <div className="px-4 py-2 flex-shrink-0 overflow-x-auto custom-scrollbar"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex gap-2" style={{ width: 'max-content' }}>
                    {AI_SUGGESTIONS.slice(0, 4).map((s, i) => (
                        <button key={i} onClick={() => setInput(s)}
                            className="px-2 py-1 rounded text-xs flex-shrink-0 transition-colors"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontSize: 10 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#a78bfa'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i}>
                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="rounded-xl px-3 py-2 max-w-[85%]"
                                style={{
                                    background: msg.role === 'user' ? 'rgba(139,92,246,0.2)' : 'var(--bg-raised)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(139,92,246,0.3)' : 'var(--border-subtle)'}`,
                                    fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                {msg.text}
                            </div>
                        </div>
                        {/* Template card in message */}
                        {msg.template && (
                            <div className="mt-2 ml-0 rounded-xl p-3"
                                style={{ background: 'var(--bg-raised)', border: '1px solid rgba(43,202,141,0.3)', maxWidth: '85%' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span style={{ fontSize: 20 }}>{msg.template.icon}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{msg.template.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onLoadTemplate(msg.template!)}
                                        className="flex-1 py-1.5 rounded text-xs font-medium"
                                        style={{ background: 'rgba(43,202,141,0.15)', color: 'var(--accent-green)', border: '1px solid rgba(43,202,141,0.3)' }}>
                                        ▶ Canvas'a Yükle
                                    </button>
                                    <button
                                        onClick={() => onGenerateTemplate(msg.template!)}
                                        className="px-3 py-1.5 rounded text-xs font-medium"
                                        style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                                        + Mağazaya Ekle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
                            <Loader2 size={12} className="animate-spin" style={{ color: '#8b5cf6' }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI otomasyon tasarlıyor...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex gap-2">
                    <input
                        className="flex-1 px-3 py-2 rounded-lg outline-none"
                        style={{
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)', fontSize: 12,
                        }}
                        placeholder="Otomasyon isteğinizi yazın... (Türkçe)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#8b5cf6')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: loading || !input.trim() ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}>
                        {loading ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <Send size={14} className="text-white" />}
                    </button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Enter ile gönder • Türkçe desteklenir</span>
                    <button onClick={() => setMessages([messages[0]])}
                        className="flex items-center gap-1 text-xs"
                        style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 9 }}>
                        <RefreshCw size={9} /> Sıfırla
                    </button>
                </div>
            </div>
        </div>
    );
};
