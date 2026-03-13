"use strict";
/**
 * 🔄 FEEDBACK CLIENT - MOD 2
 *
 * Hafif, bağımsız, opsiyonel feedback client.
 * Otomasyon içine gömülür, fabrikayı besler.
 *
 * ⚠️ KRİTİK KURALLAR:
 * - Kişisel veri GÖNDERİLMEZ
 * - Fire-and-forget (hata sessiz yutulur)
 * - Fabrika kapalıysa otomasyon ÇALIŞMAYA DEVAM EDER
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackClient = void 0;
exports.feedbackClient = (() => {
    // State
    let enabled = false;
    let automationId = '';
    let lastSendTime = 0;
    const MIN_INTERVAL_MS = 60000; // Rate limit: 1 dakikada max 1 event
    // Endpoint (production'da gerçek URL)
    const endpoint = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://factory.omniflow.com/api/feedback'
        : '/api/feedback'; // Local dev için
    /**
     * Feedback toplamayı etkinleştir
     * @param id - Otomasyon ID'si (ör: 'wp-instagram-sales-bot-v1')
     */
    function enable(id) {
        enabled = true;
        automationId = id;
        console.log(`[Feedback] ✅ Enabled for: ${id}`);
    }
    /**
     * Feedback toplamayı devre dışı bırak
     */
    function disable() {
        enabled = false;
        automationId = '';
        console.log('[Feedback] ❌ Disabled');
    }
    /**
     * Anonim feedback event gönder
     *
     * @param event - Event tipi: 'conversion' | 'error' | 'usage'
     * @param context - Anonim bağlam bilgisi (KİŞİSEL VERİ YOK!)
     *
     * @example
     * feedbackClient.send('conversion', { channel: 'whatsapp', intent: 'appointment' });
     */
    async function send(event, context = {}) {
        // Kapalıysa hiçbir şey yapma
        if (!enabled)
            return;
        // Rate limit kontrolü
        const now = Date.now();
        if (now - lastSendTime < MIN_INTERVAL_MS) {
            return; // Çok sık gönderim engellendi
        }
        lastSendTime = now;
        // Payload hazırla (KİŞİSEL VERİ YOK!)
        const payload = {
            automation_id: automationId,
            event,
            context: sanitizeContext(context),
            ts: now
        };
        // Fire-and-forget gönder
        try {
            // Modern browsers: sendBeacon (background'da güvenli)
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                navigator.sendBeacon(endpoint, JSON.stringify(payload));
            }
            else {
                // Fallback: keepalive fetch
                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => { }); // Silent fail
            }
        }
        catch (_a) {
            // Silent fail - otomasyon ASLA durmamalı
        }
    }
    /**
     * Context'ten potansiyel kişisel verileri temizle
     */
    function sanitizeContext(ctx) {
        const safe = { ...ctx };
        // Potansiyel kişisel veri alanlarını sil
        const forbidden = ['name', 'email', 'phone', 'message', 'address', 'ip', 'user_id'];
        forbidden.forEach(key => delete safe[key]);
        return safe;
    }
    /**
     * Mevcut durumu kontrol et
     */
    function isEnabled() {
        return enabled;
    }
    return {
        enable,
        disable,
        send,
        isEnabled
    };
})();
exports.default = exports.feedbackClient;
