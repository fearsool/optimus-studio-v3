"use strict";
// import puppeteer from 'puppeteer'; // Moved to dynamic import
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppConnector = void 0;
class WhatsAppConnector {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isAuthenticated = false;
    }
    async initialize() {
        await this.connect();
    }
    // BAĞLANTI KURMA
    async connect() {
        try {
            console.log('📱 WhatsApp bağlantısı kuruluyor...');
            // Puppeteer başlat
            if (typeof window === 'undefined') {
                // Use require to bypass static analysis (Webpack sometimes chases imports even if dynamic)
                // Using a variable to trick webpack's parser
                const moduleName = 'puppeteer';
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const puppeteer = require(moduleName);
                this.browser = await puppeteer.launch({
                    headless: false, // QR kod görmek için false
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage'
                    ],
                    // executablePath: process.env.CHROME_PATH || undefined // Commented out to use bundled chromium
                });
            }
            else {
                console.warn('Puppeteer cannot run in browser environment');
                return false;
            }
            this.page = await this.browser.newPage();
            // User-Agent ayarla
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            // WhatsApp Web'e git
            await this.page.goto('https://web.whatsapp.com', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });
            // QR kodunu bekle
            console.log('📱 Lütfen WhatsApp QR kodunu tarayın...');
            // QR kodunun göründüğünü kontrol et
            await this.page.waitForSelector('canvas[aria-label="Scan me!"]', {
                timeout: 120000 // 2 dakika
            }).catch(() => {
                console.log('QR kodu bulunamadı, kontrol ediliyor...');
            });
            // Oturum açıldı mı kontrol et
            await this.page.waitForSelector('div[data-testid="chat-list"]', {
                timeout: 120000
            });
            this.isAuthenticated = true;
            console.log('✅ WhatsApp bağlantısı başarılı!');
            // Mesaj dinlemeyi başlat
            this.startMessageListener();
            return true;
        }
        catch (error) {
            console.error('WhatsApp bağlantı hatası:', error);
            return false;
        }
    }
    // MESAJ GÖNDERME
    async sendMessage(phoneNumber, message) {
        if (!this.isAuthenticated || !this.page) {
            const connected = await this.connect();
            if (!connected)
                return false;
        }
        try {
            if (!this.page)
                return false;
            // Chat aç
            const chatUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            await this.page.goto(chatUrl, { waitUntil: 'networkidle2' });
            // Gönder butonunu bekle
            await this.page.waitForSelector('button[data-testid="compose-btn-send"]', {
                timeout: 30000
            });
            // Enter'a bas (bazen buton tıklamak çalışmıyor)
            await this.page.keyboard.press('Enter');
            // Mesajın gönderildiğini kontrol et
            await this.page.waitForTimeout(3000);
            console.log(`✅ WhatsApp mesajı gönderildi: ${phoneNumber}`);
            return true;
        }
        catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            return false;
        }
    }
    // MESAJ DİNLEME
    async startMessageListener() {
        if (!this.page)
            return;
        console.log('👂 WhatsApp mesajları dinleniyor...');
        // Son mesajları takip et
        let lastMessageCount = 0;
        const checkLoop = async () => {
            try {
                if (!this.page)
                    return;
                const messages = await this.page.evaluate(() => {
                    const messageElements = document.querySelectorAll('[data-testid="msg-container"]');
                    return Array.from(messageElements).map(el => {
                        var _a, _b;
                        return ({
                            text: ((_a = el.querySelector('[data-testid="conversation-turn"]')) === null || _a === void 0 ? void 0 : _a.textContent) || '',
                            isFromMe: el.querySelector('[data-testid="msg-check"]') !== null,
                            time: ((_b = el.querySelector('[data-testid="message-time"]')) === null || _b === void 0 ? void 0 : _b.textContent) || ''
                        });
                    });
                });
                // Yeni mesajları işle
                if (messages.length > lastMessageCount) {
                    const newMessages = messages.slice(lastMessageCount);
                    for (const msg of newMessages) {
                        if (!msg.isFromMe && msg.text.trim()) {
                            await this.processIncomingMessage(msg.text);
                        }
                    }
                    lastMessageCount = messages.length;
                }
            }
            catch (error) {
                console.error('Mesaj dinleme hatası:', error);
            }
            setTimeout(checkLoop, 5000);
        };
        checkLoop();
    }
    // GELEN MESAJ İŞLEME
    async processIncomingMessage(message) {
        console.log(`📥 WhatsApp'tan mesaj: ${message}`);
        // Simplified handler for now as we don't have full AgentCore reference loop yet
    }
    // Helper for dashboards
    async waitForResponse(timeout, validOptions) {
        // Stub implementation
        return null;
    }
}
exports.WhatsAppConnector = WhatsAppConnector;
