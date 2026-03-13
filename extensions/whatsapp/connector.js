const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

console.log('📱 Optimus WhatsApp Connector Başlatılıyor...');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'optimus-client',
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\nScanning this QR code will connect Optimus to your WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\nLütfen telefonunuzdan (Ayarlar > Bağlı Cihazlar > Cihaz Bağla) menüsüne girip kodu okutun.\n');
});

client.on('ready', () => {
    console.log('\n✅ WhatsApp Bağlantısı Başarılı!');
    console.log('Optimus artık WhatsApp üzerinden erişilebilir.');
    console.log('Session kaydedildi. Çıkış yapabilirsiniz (Ctrl+C).');

    // Kendine test mesajı at (Opsiyonel)
    // client.sendMessage(client.info.wid._serialized, '🤖 Optimus: Bağlantı kuruldu!');
});

client.on('authenticated', () => {
    console.log('✅ Authenticated successfully.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

client.initialize();
