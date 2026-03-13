"use strict";
// ============================================
// NOTIFICATION SERVICE
// Telegram, WhatsApp, Email, Discord, Slack
// Tüm ücretsiz bildirim kanalları
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyScheduledRun = exports.notifyError = exports.notifySuccess = exports.sendNotification = exports.sendEmail = exports.sendWhatsApp = exports.sendSlack = exports.sendDiscord = exports.sendTelegram = void 0;
// ============================================
// TELEGRAM (ÜCRETSİZ - EN KOLAY)
// Nasıl kurulur:
// 1. @BotFather'a git, /newbot yaz, bot oluştur
// 2. Token'ı al
// 3. Botu gruba ekle veya kendi chat'ine mesaj at
// 4. https://api.telegram.org/bot<TOKEN>/getUpdates ile chat_id'yi bul
// ============================================
const sendTelegram = async (botToken, chatId, message) => {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        const data = await response.json();
        if (data.ok) {
            console.log('[Telegram] Mesaj gönderildi ✓');
            return { success: true, channel: 'telegram' };
        }
        else {
            console.error('[Telegram] Hata:', data.description);
            return { success: false, channel: 'telegram', error: data.description };
        }
    }
    catch (e) {
        console.error('[Telegram] Bağlantı hatası:', e.message);
        return { success: false, channel: 'telegram', error: e.message };
    }
};
exports.sendTelegram = sendTelegram;
// ============================================
// DISCORD (ÜCRETSİZ WEBHOOK)
// Nasıl kurulur:
// 1. Discord sunucunuzda bir kanal açın
// 2. Kanal ayarları → Entegrasyonlar → Webhook Oluştur
// 3. Webhook URL'sini kopyalayın
// ============================================
const sendDiscord = async (webhookUrl, message, title) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                        title: title || '🤖 OmniFlow Bildirimi',
                        description: message,
                        color: 5814783, // indigo
                        timestamp: new Date().toISOString()
                    }]
            })
        });
        if (response.ok) {
            console.log('[Discord] Mesaj gönderildi ✓');
            return { success: true, channel: 'discord' };
        }
        else {
            const error = await response.text();
            return { success: false, channel: 'discord', error };
        }
    }
    catch (e) {
        return { success: false, channel: 'discord', error: e.message };
    }
};
exports.sendDiscord = sendDiscord;
// ============================================
// SLACK (ÜCRETSİZ WEBHOOK)
// Nasıl kurulur:
// 1. https://api.slack.com/apps → Create New App
// 2. Incoming Webhooks → Activate
// 3. Add New Webhook to Workspace
// 4. Webhook URL'sini kopyalayın
// ============================================
const sendSlack = async (webhookUrl, message) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: message,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `🤖 *OmniFlow*\n${message}`
                        }
                    }
                ]
            })
        });
        if (response.ok) {
            console.log('[Slack] Mesaj gönderildi ✓');
            return { success: true, channel: 'slack' };
        }
        else {
            const error = await response.text();
            return { success: false, channel: 'slack', error };
        }
    }
    catch (e) {
        return { success: false, channel: 'slack', error: e.message };
    }
};
exports.sendSlack = sendSlack;
// ============================================
// WHATSAPP (Meta Business API)
// NOT: Bu ücretsiz değil, business hesabı gerekli
// Alternatif: Telegram kullanın (ücretsiz)
// ============================================
const sendWhatsApp = async (token, phoneNumberId, recipientPhone, message) => {
    var _a, _b, _c;
    try {
        const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: recipientPhone,
                type: 'text',
                text: { body: message }
            })
        });
        const data = await response.json();
        if ((_b = (_a = data.messages) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) {
            console.log('[WhatsApp] Mesaj gönderildi ✓');
            return { success: true, channel: 'whatsapp' };
        }
        else {
            return { success: false, channel: 'whatsapp', error: ((_c = data.error) === null || _c === void 0 ? void 0 : _c.message) || 'Unknown error' };
        }
    }
    catch (e) {
        return { success: false, channel: 'whatsapp', error: e.message };
    }
};
exports.sendWhatsApp = sendWhatsApp;
// ============================================
// EMAIL (Serverless - Frontend için sınırlı)
// NOT: Tarayıcıdan SMTP çalışmaz.
// Alternatif: EmailJS veya API Gateway kullanın
// ============================================
const sendEmail = async (config) => {
    // Frontend'de doğrudan SMTP kullanamayız
    // EmailJS veya benzeri bir servis gerekir
    console.warn('[Email] Tarayıcıdan email göndermek için EmailJS veya backend gerekli.');
    // EmailJS ile gönderim (ücretsiz 200 email/ay)
    // https://www.emailjs.com/ adresinden kurulum yapın
    return {
        success: false,
        channel: 'email',
        error: 'Email gönderimi için EmailJS kurulumu yapın veya backend kullanın'
    };
};
exports.sendEmail = sendEmail;
// ============================================
// UNIFIED NOTIFICATION SENDER
// Tüm kanalları tek fonksiyondan kullan
// ============================================
const sendNotification = async (config, message, title) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const results = [];
    // Telegram
    if (((_a = config.telegram) === null || _a === void 0 ? void 0 : _a.botToken) && ((_b = config.telegram) === null || _b === void 0 ? void 0 : _b.chatId)) {
        const formattedMsg = title ? `<b>${title}</b>\n\n${message}` : message;
        const result = await (0, exports.sendTelegram)(config.telegram.botToken, config.telegram.chatId, formattedMsg);
        results.push(result);
    }
    // Discord
    if ((_c = config.discord) === null || _c === void 0 ? void 0 : _c.webhookUrl) {
        const result = await (0, exports.sendDiscord)(config.discord.webhookUrl, message, title);
        results.push(result);
    }
    // Slack
    if ((_d = config.slack) === null || _d === void 0 ? void 0 : _d.webhookUrl) {
        const formattedMsg = title ? `*${title}*\n${message}` : message;
        const result = await (0, exports.sendSlack)(config.slack.webhookUrl, formattedMsg);
        results.push(result);
    }
    // WhatsApp
    if (((_e = config.whatsapp) === null || _e === void 0 ? void 0 : _e.token) && ((_f = config.whatsapp) === null || _f === void 0 ? void 0 : _f.phoneNumberId) && ((_g = config.whatsapp) === null || _g === void 0 ? void 0 : _g.recipientPhone)) {
        const formattedMsg = title ? `${title}\n\n${message}` : message;
        const result = await (0, exports.sendWhatsApp)(config.whatsapp.token, config.whatsapp.phoneNumberId, config.whatsapp.recipientPhone, formattedMsg);
        results.push(result);
    }
    return results;
};
exports.sendNotification = sendNotification;
// ============================================
// PRE-BUILT NOTIFICATION TEMPLATES
// ============================================
const notifySuccess = async (config, blueprintName, output) => {
    const message = `✅ <b>Otomasyon Tamamlandı</b>

📋 <b>Sistem:</b> ${blueprintName}
⏰ <b>Zaman:</b> ${new Date().toLocaleString('tr-TR')}

📤 <b>Sonuç:</b>
${output.substring(0, 500)}${output.length > 500 ? '...' : ''}`;
    return (0, exports.sendNotification)(config, message, '✅ Başarılı');
};
exports.notifySuccess = notifySuccess;
const notifyError = async (config, blueprintName, error) => {
    const message = `❌ <b>Otomasyon Hatası</b>

📋 <b>Sistem:</b> ${blueprintName}
⏰ <b>Zaman:</b> ${new Date().toLocaleString('tr-TR')}

🔴 <b>Hata:</b>
${error.substring(0, 500)}${error.length > 500 ? '...' : ''}

🔧 Lütfen kontrol edin.`;
    return (0, exports.sendNotification)(config, message, '❌ Hata');
};
exports.notifyError = notifyError;
const notifyScheduledRun = async (config, blueprintName) => {
    const message = `🔄 <b>Zamanlanmış Çalıştırma</b>

📋 <b>Sistem:</b> ${blueprintName}
⏰ <b>Başlangıç:</b> ${new Date().toLocaleString('tr-TR')}

🤖 Otomasyon başlatıldı...`;
    return (0, exports.sendNotification)(config, message, '🔄 Çalıştırılıyor');
};
exports.notifyScheduledRun = notifyScheduledRun;
exports.default = {
    sendTelegram: exports.sendTelegram,
    sendDiscord: exports.sendDiscord,
    sendSlack: exports.sendSlack,
    sendWhatsApp: exports.sendWhatsApp,
    sendEmail: exports.sendEmail,
    sendNotification: exports.sendNotification,
    notifySuccess: exports.notifySuccess,
    notifyError: exports.notifyError,
    notifyScheduledRun: exports.notifyScheduledRun
};
