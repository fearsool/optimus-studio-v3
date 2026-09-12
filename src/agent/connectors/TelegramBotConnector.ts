/**
 * 🤖 TELEGRAM BOT CONNECTOR
 * =========================
 * Full Telegram bot for commanding and monitoring all agents.
 *
 * Commands:
 *   /start      - Activate agent & show welcome
 *   /status     - Health check & system status
 *   /task <text>- Send a custom task to agent pipeline
 *   /models     - Show active HuggingFace models
 *   /ask <text> - Ask Optimus a quick question (Turkish OK)
 *   /stop       - Pause the agent loop
 *   /resume     - Resume paused agent loop
 *   /help       - Show all commands
 *
 * Security: Only TELEGRAM_ADMIN_CHAT_ID can use commands.
 */

import TelegramBot from 'node-telegram-bot-api';
import { EventBus } from '../../core/EventBus';
import { huggingFaceAdapter } from '../core/HuggingFaceAdapter';

interface BotConfig {
    token: string;
    adminChatId: number;
    agentName?: string;
}

export class TelegramBotConnector {
    private bot: TelegramBot | null = null;
    private eventBus: EventBus;
    private config: BotConfig;
    private isAgentPaused = false;
    private startTime = Date.now();
    private messageCount = 0;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.config = {
            token: process.env.TELEGRAM_BOT_TOKEN || '',
            adminChatId: parseInt(process.env.TELEGRAM_ADMIN_CHAT_ID || '0', 10),
            agentName: 'Optimus',
        };
    }

    // ============ INIT ============

    async initialize(): Promise<boolean> {
        if (!this.config.token || this.config.token.length < 25 || this.config.token.includes('YOUR_') || this.config.token === 'test_token') {
            console.warn('[Telegram] ⚠️  TELEGRAM_BOT_TOKEN geçersiz veya ayarlanmamış. Telegram botu devre dışı.');
            return false;
        }

        if (!this.config.adminChatId) {
            console.warn('[Telegram] ⚠️  TELEGRAM_ADMIN_CHAT_ID not set. Bot will reject all messages for safety.');
        }

        try {
            this.bot = new TelegramBot(this.config.token, { polling: true });

            // Polling hatası durumunda döngüye girmeden durdur
            this.bot.on('polling_error', (err: any) => {
                console.warn('[Telegram] ⚠️  Telegram bağlantı/yetki hatası (token geçersiz olabilir). Polling durduruluyor...');
                this.bot?.stopPolling().catch(() => {});
            });

            this.registerCommands();
            this.setupAgentEventListeners();

            console.log('[Telegram] ✅ Bot başlatıldı ve komutlar dinleniyor...');
            await this.notify('🤖 *Optimus Agent Başlatıldı!*\nTüm sistemler çevrimiçi. /help ile komutlara bakabilirsiniz.', true);
            return true;
        } catch (error: any) {
            console.error('[Telegram] ❌ Bot başlatma hatası:', error.message);
            return false;
        }
    }

    // ============ COMMAND REGISTRATION ============

    private registerCommands(): void {
        if (!this.bot) return;

        // Security middleware: check every message
        this.bot.on('message', (msg) => {
            this.messageCount++;
            if (!this.isAuthorized(msg.chat.id)) {
                this.bot?.sendMessage(msg.chat.id,
                    '🔒 Yetkisiz erişim. Bu bot sadece yetkili kullanıcılar içindir.');
                console.warn(`[Telegram] 🚨 Unauthorized access attempt from chat_id: ${msg.chat.id}`);
            }
        });

        // /help
        this.bot.onText(/\/help/, (msg) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            this.bot?.sendMessage(msg.chat.id, this.getHelpMessage(), { parse_mode: 'Markdown' });
        });

        // /start
        this.bot.onText(/\/start/, async (msg) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            const welcome = `
🤖 *Optimus'a hoş geldiniz!*

Ben sizin kişisel AI agent orkestratörünüzüm.
Şu anda ${this.getFormattedUptime()} süredir aktifim.

*Kullanılabilir komutlar:*
${this.getHelpMessage()}
      `.trim();
            this.bot?.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
        });

        // /status
        this.bot.onText(/\/status/, async (msg) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            const statusMsg = await this.buildStatusMessage();
            this.bot?.sendMessage(msg.chat.id, statusMsg, { parse_mode: 'Markdown' });
        });

        // /models
        this.bot.onText(/\/models/, (msg) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            const modelsMsg = this.buildModelsMessage();
            this.bot?.sendMessage(msg.chat.id, modelsMsg, { parse_mode: 'Markdown' });
        });

        // /stop
        this.bot.onText(/\/stop/, (msg) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            this.isAgentPaused = true;
            this.eventBus.emit('agent:pause', {}, 'TelegramBot');
            this.bot?.sendMessage(msg.chat.id, '⏸️ Agent döngüsü *durduruldu*. /resume ile devam ettirin.', { parse_mode: 'Markdown' });
        });

        // /resume
        this.bot.onText(/\/resume/, (msg) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            this.isAgentPaused = false;
            this.eventBus.emit('agent:resume', {}, 'TelegramBot');
            this.bot?.sendMessage(msg.chat.id, '▶️ Agent döngüsü *devam ettirildi*.', { parse_mode: 'Markdown' });
        });

        // /task <description>
        this.bot.onText(/\/task (.+)/, (msg, match) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            const taskDescription = match?.[1] || '';
            if (!taskDescription.trim()) {
                this.bot?.sendMessage(msg.chat.id, '❌ Görev açıklaması boş. Örnek: `/task SEO optimizasyonu yap`', { parse_mode: 'Markdown' });
                return;
            }

            const taskId = `telegram_${Date.now()}`;
            this.eventBus.emit('task:created', {
                id: taskId,
                type: 'custom',
                priority: 'high',
                data: {
                    command: taskDescription,
                    source: 'telegram',
                    chatId: msg.chat.id,
                },
                createdAt: new Date(),
            }, 'TelegramBot');

            this.bot?.sendMessage(msg.chat.id,
                `📋 *Görev kuyruğa eklendi!*\n\n📝 \`${taskDescription}\`\n🆔 ID: \`${taskId}\`\n\nSonuç hazır olduğunda bildirim alacaksınız.`,
                { parse_mode: 'Markdown' }
            );
        });

        // /ask <question> — Quick AI query without task queue
        this.bot.onText(/\/ask (.+)/, async (msg, match) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            const question = match?.[1] || '';
            if (!question.trim()) {
                this.bot?.sendMessage(msg.chat.id, '❌ Soru boş. Örnek: `/ask Hava durumu nasıl?`');
                return;
            }

            const thinkingMsg = await this.bot?.sendMessage(msg.chat.id, '🤔 Düşünüyorum...');

            try {
                const result = await huggingFaceAdapter.generate(question, 'chat_turkish');
                const reply = `💬 *Optimus:*\n\n${result.content}\n\n_Model: ${result.model}_`;
                this.bot?.sendMessage(msg.chat.id, reply, { parse_mode: 'Markdown' });
            } catch (error: any) {
                this.bot?.sendMessage(msg.chat.id, `❌ Yanıt üretilemedi: ${error.message}`);
            }
        });

        // /image <prompt> — Generate image on demand
        this.bot.onText(/\/image (.+)/, async (msg, match) => {
            if (!this.isAuthorized(msg.chat.id)) return;
            const prompt = match?.[1] || '';

            await this.bot?.sendMessage(msg.chat.id, '🎨 Görsel üretiliyor, lütfen bekleyin (~30 sn)...');

            try {
                const result = await huggingFaceAdapter.generateImage(prompt);
                const buffer = Buffer.from(result.base64, 'base64');
                await this.bot?.sendPhoto(msg.chat.id, buffer, { caption: `🖼️ Prompt: ${prompt}\nModel: ${result.model}` });
            } catch (error: any) {
                this.bot?.sendMessage(msg.chat.id, `❌ Görsel üretilemedi: ${error.message}`);
            }
        });
    }

    // ============ AGENT EVENT LISTENERS ============

    private setupAgentEventListeners(): void {
        // Notify on task completion
        this.eventBus.on('task:completed', (event) => {
            const result = event.data?.result;
            const msg = [
                '✅ *Görev Tamamlandı*',
                event.data?.taskId ? `🆔 ID: \`${event.data.taskId}\`` : '',
                result?.message ? `📄 ${result.message}` : '',
            ].filter(Boolean).join('\n');

            this.notify(msg, true);
        });

        // Notify on task failure
        this.eventBus.on('task:failed', (event) => {
            const msg = [
                '❌ *Görev Başarısız*',
                event.data?.taskId ? `🆔 ID: \`${event.data.taskId}\`` : '',
                event.data?.error ? `⚠️ Hata: ${event.data.error}` : '',
            ].filter(Boolean).join('\n');

            this.notify(msg, true);
        });

        // Notify on system error
        this.eventBus.on('error:occurred', (event) => {
            const error = event.data?.error;
            const msg = `🚨 *Sistem Hatası*\n\nKaynak: ${event.source}\nHata: ${error?.message || 'Bilinmeyen hata'}`;
            this.notify(msg, true);
        });

        // Notify on factory events (if automation factory emits them)
        this.eventBus.on('product:created', (event) => {
            const msg = `🏭 *Yeni Ürün Üretildi!*\n\n${JSON.stringify(event.data, null, 2).slice(0, 200)}`;
            this.notify(msg, true);
        });
    }

    // ============ PUBLIC NOTIFY METHOD ============

    /**
     * Send a notification message to the admin chat.
     */
    async notify(message: string, markdown = false): Promise<void> {
        if (!this.bot || !this.config.adminChatId) return;
        try {
            await this.bot.sendMessage(this.config.adminChatId, message, {
                parse_mode: markdown ? 'Markdown' : undefined,
                disable_notification: false,
            });
        } catch (error: any) {
            console.error('[Telegram] Bildirim gönderme hatası:', error.message);
        }
    }

    // ============ HELPERS ============

    private isAuthorized(chatId: number): boolean {
        if (!this.config.adminChatId) return false;
        return chatId === this.config.adminChatId;
    }

    private getHelpMessage(): string {
        return `
/status   — 🩺 Agent sağlık durumu
/task \\<metin\\> — 📋 Göreve gönder
/ask \\<soru\\>  — 💬 Optimus'a hızlı sor
/image \\<prompt\\> — 🎨 Görsel üret
/models   — 🤖 Aktif AI modelleri
/stop     — ⏸️ Agent'ı durdur
/resume   — ▶️ Agent'ı devam ettir
/help     — ❓ Bu yardım mesajı
    `.trim();
    }

    private async buildStatusMessage(): Promise<string> {
        const hfHealth = await huggingFaceAdapter.healthCheck();
        const mem = process.memoryUsage();
        const uptime = this.getFormattedUptime();

        return `
🤖 *Optimus Agent Durumu*

⏱️ Çalışma süresi: \`${uptime}\`
💾 Bellek: \`${Math.round(mem.rss / 1024 / 1024)} MB\`
📨 Telegram mesajları: \`${this.messageCount}\`
⏯️ Agent döngüsü: ${this.isAgentPaused ? '⏸️ Durdu' : '▶️ Aktif'}

*AI Provider:*
🤗 HuggingFace: ${hfHealth.ok ? '✅ Bağlı' : `❌ ${hfHealth.message}`}

*Zaman:* ${new Date().toLocaleString('tr-TR')}
    `.trim();
    }

    private buildModelsMessage(): string {
        return `
🤖 *Aktif HuggingFace Modelleri*

💬 Türkçe Chat:
  \`mistralai/Mistral-7B-Instruct-v0.3\`

💻 Kod Üretimi:
  \`Qwen/Qwen2.5-Coder-7B-Instruct\`

🧠 Akıl Yürütme:
  \`deepseek-ai/DeepSeek-R1-Distill-Qwen-7B\`

📝 Özetleme:
  \`facebook/bart-large-cnn\`

🎨 Görsel Üretimi:
  \`stabilityai/stable-diffusion-xl-base-1.0\`

🔢 Embedding:
  \`sentence-transformers/all-MiniLM-L6-v2\`

_Hepsi ücretsiz tier 🎉_
    `.trim();
    }

    private getFormattedUptime(): string {
        const ms = Date.now() - this.startTime;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h}s ${m}d ${s}sn`;
    }

    async stop(): Promise<void> {
        if (this.bot) {
            await this.bot.stopPolling();
            console.log('[Telegram] Bot durduruldu.');
        }
    }
}

// Singleton
export const telegramBot = new TelegramBotConnector();
