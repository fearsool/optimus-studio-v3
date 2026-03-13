/**
 * 📱 WHATSAPP CONNECTOR (Baileys)
 * ================================
 * Replaces the fragile Puppeteer-based implementation.
 * Uses @whiskeysockets/baileys — a proper WhatsApp Web API.
 *
 * Setup:
 *   1. Start the agent: npm run agent
 *   2. Scan the QR code printed in the terminal with your phone
 *   3. Session is saved to ./whatsapp-session/ — you won't need to scan again
 *
 * Commands (send from your phone):
 *   !status   - Agent health check
 *   !task <x> - Send a task to the agent
 *   !ask <x>  - Quick AI question
 *   !help     - Show all commands
 */

import { EventBus } from '../../core/EventBus';
import { huggingFaceAdapter } from '../core/HuggingFaceAdapter';
import * as fs from 'fs';
import * as path from 'path';

export class WhatsAppConnector {
    private sock: any = null;
    private isConnected = false;
    private adminPhone: string;
    private sessionPath: string;
    private eventBus: EventBus;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT = 5;

    constructor() {
        this.adminPhone = process.env.ADMIN_PHONE ? process.env.ADMIN_PHONE.replace('+', '') + '@s.whatsapp.net' : '';
        this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';
        this.eventBus = EventBus.getInstance();
    }

    // ============ INIT ============

    async initialize(): Promise<boolean> {
        if (process.env.WHATSAPP_ENABLED !== 'true') {
            console.log('[WhatsApp] Disabled. Set WHATSAPP_ENABLED=true in .env to enable.');
            return false;
        }

        if (!this.adminPhone) {
            console.warn('[WhatsApp] ADMIN_PHONE not set. WhatsApp bot disabled.');
            return false;
        }

        return this.connect();
    }

    async connect(): Promise<boolean> {
        try {
            // Dynamic import to avoid webpack bundling issues
            const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = await import('@whiskeysockets/baileys' as any);

            // Ensure session directory exists
            if (!fs.existsSync(this.sessionPath)) {
                fs.mkdirSync(this.sessionPath, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);

            this.sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, console as any),
                },
                printQRInTerminal: true, // QR shows in terminal
                browser: ['Optimus Agent', 'Chrome', '1.0.0'],
                connectTimeoutMs: 60_000,
                defaultQueryTimeoutMs: 60_000,
                keepAliveIntervalMs: 25_000,
                logger: {
                    level: 'warn',
                    trace: () => { }, debug: () => { }, info: (obj: any, msg: string) => {
                        if (msg) console.log('[WA]', msg);
                    },
                    warn: (obj: any, msg: string) => console.warn('[WA]', msg),
                    error: (obj: any, msg: string) => console.error('[WA]', msg),
                    fatal: (obj: any, msg: string) => console.error('[WA FATAL]', msg),
                    child: () => ({ trace: () => { }, debug: () => { }, info: () => { }, warn: () => { }, error: () => { }, fatal: () => { }, child: () => ({}) })
                },
            });

            // Save credentials whenever updated
            this.sock.ev.on('creds.update', saveCreds);

            // Connection lifecycle
            this.sock.ev.on('connection.update', async (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log('\n[WhatsApp] 📱 QR Kodu terminalde görüntüleniyor. Telefonunuzla tarayın!\n');
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
                    if (shouldReconnect && this.reconnectAttempts < this.MAX_RECONNECT) {
                        this.reconnectAttempts++;
                        console.log(`[WhatsApp] Bağlantı kapatıldı, yeniden bağlanılıyor... (${this.reconnectAttempts}/${this.MAX_RECONNECT})`);
                        setTimeout(() => this.connect(), 5000);
                    } else {
                        console.log('[WhatsApp] Bağlantı kalıcı olarak kapatıldı veya çıkış yapıldı.');
                        this.isConnected = false;
                    }
                }

                if (connection === 'open') {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    console.log('[WhatsApp] ✅ Bağlantı başarılı! Mesajlar dinleniyor...');
                    await this.sendMessage(this.adminPhone, '🤖 *Optimus Agent* bağlandı! Komutlarım: !status, !task, !ask, !help');
                }
            });

            // Incoming message handler
            this.sock.ev.on('messages.upsert', async (m: any) => {
                const message = m.messages[0];
                if (!message?.key || message.key.fromMe) return; // Skip own messages

                const from = message.key.remoteJid;
                const text = message.message?.conversation
                    || message.message?.extendedTextMessage?.text
                    || '';

                if (!text || !from) return;
                if (!this.isAuthorized(from)) return; // Security: ignore unknown senders

                await this.handleIncomingMessage(from, text.trim());
            });

            return true;
        } catch (error: any) {
            console.error('[WhatsApp] ❌ Bağlantı hatası:', error.message);
            return false;
        }
    }

    // ============ COMMAND HANDLER ============

    private async handleIncomingMessage(from: string, text: string): Promise<void> {
        console.log(`[WhatsApp] 📥 Mesaj: "${text}"`);

        try {
            if (text.startsWith('!help')) {
                await this.sendMessage(from, this.getHelpMessage());

            } else if (text.startsWith('!status')) {
                const mem = process.memoryUsage();
                const hfHealth = await huggingFaceAdapter.healthCheck();
                await this.sendMessage(from,
                    `🤖 *Optimus Durum*\n\n` +
                    `💾 Bellek: ${Math.round(mem.rss / 1024 / 1024)} MB\n` +
                    `🤗 HuggingFace: ${hfHealth.ok ? '✅' : '❌'} ${hfHealth.message}\n` +
                    `🕐 ${new Date().toLocaleString('tr-TR')}`
                );

            } else if (text.startsWith('!task ')) {
                const taskDescription = text.slice(6).trim();
                const taskId = `wa_${Date.now()}`;
                this.eventBus.emit('task:created', {
                    id: taskId,
                    type: 'custom',
                    priority: 'high',
                    data: { command: taskDescription, source: 'whatsapp', from },
                    createdAt: new Date(),
                }, 'WhatsAppBot');
                await this.sendMessage(from, `✅ Görev kuyruğa eklendi:\n_${taskDescription}_\nID: ${taskId}`);

            } else if (text.startsWith('!ask ')) {
                const question = text.slice(5).trim();
                await this.sendMessage(from, '🤔 Düşünüyorum...');
                try {
                    const result = await huggingFaceAdapter.generate(question, 'chat_turkish');
                    await this.sendMessage(from, `💬 *Optimus:*\n\n${result.content}`);
                } catch (err: any) {
                    await this.sendMessage(from, `❌ Yanıt üretilemedi: ${err.message}`);
                }

            } else {
                // Free-form message → treat as question
                const result = await huggingFaceAdapter.generate(text, 'chat_turkish');
                await this.sendMessage(from, result.content);
            }
        } catch (error: any) {
            console.error('[WhatsApp] Mesaj işleme hatası:', error.message);
        }
    }

    // ============ SEND MESSAGE ============

    async sendMessage(jidOrPhone: string, message: string): Promise<boolean> {
        if (!this.sock || !this.isConnected) {
            console.warn('[WhatsApp] Bağlı değil, mesaj gönderilemedi.');
            return false;
        }

        try {
            // Normalize phone number to JID
            const jid = jidOrPhone.includes('@')
                ? jidOrPhone
                : jidOrPhone.replace('+', '') + '@s.whatsapp.net';

            await this.sock.sendMessage(jid, { text: message });
            return true;
        } catch (error: any) {
            console.error('[WhatsApp] Mesaj gönderme hatası:', error.message);
            return false;
        }
    }

    /**
     * Notify admin about agent events.
     */
    async notify(message: string): Promise<void> {
        if (!this.adminPhone) return;
        await this.sendMessage(this.adminPhone, message);
    }

    // ============ HELPERS ============

    private isAuthorized(jid: string): boolean {
        if (!this.adminPhone) return false;
        return jid === this.adminPhone || jid.startsWith(this.adminPhone.split('@')[0]);
    }

    private getHelpMessage(): string {
        return `🤖 *Optimus Komutları*\n\n!status — Sistem durumu\n!task <metin> — Göreve gönder\n!ask <soru> — Hızlı AI sorusu\n!help — Bu yardım\n\nYa da doğrudan bir şey yazabilirsiniz, Optimus anlayacaktır 😊`;
    }

    /** Helper - kept for backward compatibility with old WhatsAppConnector interface */
    async waitForResponse(timeout: number, validOptions: string[]): Promise<string | null> {
        return null;
    }
}
