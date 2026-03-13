// ============================================
// NOTIFICATION SERVICE
// Telegram, WhatsApp, Email, Discord, Slack
// Tüm ücretsiz bildirim kanalları
// ============================================

export type NotificationChannel = 'telegram' | 'whatsapp' | 'email' | 'discord' | 'slack';

export interface NotificationConfig {
    telegram?: {
        botToken: string;
        chatId: string;
    };
    whatsapp?: {
        token: string;
        phoneNumberId: string;
        recipientPhone: string;
    };
    email?: {
        smtpHost: string;
        smtpPort: number;
        user: string;
        pass: string;
        to: string;
    };
    discord?: {
        webhookUrl: string;
    };
    slack?: {
        webhookUrl: string;
    };
}

export interface NotificationResult {
    success: boolean;
    channel: NotificationChannel;
    error?: string;
}

// ============================================
// TELEGRAM (ÜCRETSİZ - EN KOLAY)
// Nasıl kurulur:
// 1. @BotFather'a git, /newbot yaz, bot oluştur
// 2. Token'ı al
// 3. Botu gruba ekle veya kendi chat'ine mesaj at
// 4. https://api.telegram.org/bot<TOKEN>/getUpdates ile chat_id'yi bul
// ============================================

export const sendTelegram = async (
    botToken: string,
    chatId: string,
    message: string
): Promise<NotificationResult> => {
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
        } else {
            console.error('[Telegram] Hata:', data.description);
            return { success: false, channel: 'telegram', error: data.description };
        }
    } catch (e: any) {
        console.error('[Telegram] Bağlantı hatası:', e.message);
        return { success: false, channel: 'telegram', error: e.message };
    }
};

// ============================================
// DISCORD (ÜCRETSİZ WEBHOOK)
// Nasıl kurulur:
// 1. Discord sunucunuzda bir kanal açın
// 2. Kanal ayarları → Entegrasyonlar → Webhook Oluştur
// 3. Webhook URL'sini kopyalayın
// ============================================

export const sendDiscord = async (
    webhookUrl: string,
    message: string,
    title?: string
): Promise<NotificationResult> => {
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
        } else {
            const error = await response.text();
            return { success: false, channel: 'discord', error };
        }
    } catch (e: any) {
        return { success: false, channel: 'discord', error: e.message };
    }
};

// ============================================
// SLACK (ÜCRETSİZ WEBHOOK)
// Nasıl kurulur:
// 1. https://api.slack.com/apps → Create New App
// 2. Incoming Webhooks → Activate
// 3. Add New Webhook to Workspace
// 4. Webhook URL'sini kopyalayın
// ============================================

export const sendSlack = async (
    webhookUrl: string,
    message: string
): Promise<NotificationResult> => {
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
        } else {
            const error = await response.text();
            return { success: false, channel: 'slack', error };
        }
    } catch (e: any) {
        return { success: false, channel: 'slack', error: e.message };
    }
};

// ============================================
// WHATSAPP (Meta Business API)
// NOT: Bu ücretsiz değil, business hesabı gerekli
// Alternatif: Telegram kullanın (ücretsiz)
// ============================================

export const sendWhatsApp = async (
    token: string,
    phoneNumberId: string,
    recipientPhone: string,
    message: string
): Promise<NotificationResult> => {
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

        if (data.messages?.[0]?.id) {
            console.log('[WhatsApp] Mesaj gönderildi ✓');
            return { success: true, channel: 'whatsapp' };
        } else {
            return { success: false, channel: 'whatsapp', error: data.error?.message || 'Unknown error' };
        }
    } catch (e: any) {
        return { success: false, channel: 'whatsapp', error: e.message };
    }
};

// ============================================
// EMAIL (Serverless - Frontend için sınırlı)
// NOT: Tarayıcıdan SMTP çalışmaz.
// Alternatif: EmailJS veya API Gateway kullanın
// ============================================

export const sendEmail = async (
    config: {
        to: string;
        subject: string;
        body: string;
    }
): Promise<NotificationResult> => {
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

// ============================================
// UNIFIED NOTIFICATION SENDER
// Tüm kanalları tek fonksiyondan kullan
// ============================================

export const sendNotification = async (
    config: NotificationConfig,
    message: string,
    title?: string
): Promise<NotificationResult[]> => {
    const results: NotificationResult[] = [];

    // Telegram
    if (config.telegram?.botToken && config.telegram?.chatId) {
        const formattedMsg = title ? `<b>${title}</b>\n\n${message}` : message;
        const result = await sendTelegram(config.telegram.botToken, config.telegram.chatId, formattedMsg);
        results.push(result);
    }

    // Discord
    if (config.discord?.webhookUrl) {
        const result = await sendDiscord(config.discord.webhookUrl, message, title);
        results.push(result);
    }

    // Slack
    if (config.slack?.webhookUrl) {
        const formattedMsg = title ? `*${title}*\n${message}` : message;
        const result = await sendSlack(config.slack.webhookUrl, formattedMsg);
        results.push(result);
    }

    // WhatsApp
    if (config.whatsapp?.token && config.whatsapp?.phoneNumberId && config.whatsapp?.recipientPhone) {
        const formattedMsg = title ? `${title}\n\n${message}` : message;
        const result = await sendWhatsApp(
            config.whatsapp.token,
            config.whatsapp.phoneNumberId,
            config.whatsapp.recipientPhone,
            formattedMsg
        );
        results.push(result);
    }

    return results;
};

// ============================================
// PRE-BUILT NOTIFICATION TEMPLATES
// ============================================

export const notifySuccess = async (config: NotificationConfig, blueprintName: string, output: string) => {
    const message = `✅ <b>Otomasyon Tamamlandı</b>

📋 <b>Sistem:</b> ${blueprintName}
⏰ <b>Zaman:</b> ${new Date().toLocaleString('tr-TR')}

📤 <b>Sonuç:</b>
${output.substring(0, 500)}${output.length > 500 ? '...' : ''}`;

    return sendNotification(config, message, '✅ Başarılı');
};

export const notifyError = async (config: NotificationConfig, blueprintName: string, error: string) => {
    const message = `❌ <b>Otomasyon Hatası</b>

📋 <b>Sistem:</b> ${blueprintName}
⏰ <b>Zaman:</b> ${new Date().toLocaleString('tr-TR')}

🔴 <b>Hata:</b>
${error.substring(0, 500)}${error.length > 500 ? '...' : ''}

🔧 Lütfen kontrol edin.`;

    return sendNotification(config, message, '❌ Hata');
};

export const notifyScheduledRun = async (config: NotificationConfig, blueprintName: string) => {
    const message = `🔄 <b>Zamanlanmış Çalıştırma</b>

📋 <b>Sistem:</b> ${blueprintName}
⏰ <b>Başlangıç:</b> ${new Date().toLocaleString('tr-TR')}

🤖 Otomasyon başlatıldı...`;

    return sendNotification(config, message, '🔄 Çalıştırılıyor');
};

export default {
    sendTelegram,
    sendDiscord,
    sendSlack,
    sendWhatsApp,
    sendEmail,
    sendNotification,
    notifySuccess,
    notifyError,
    notifyScheduledRun
};
