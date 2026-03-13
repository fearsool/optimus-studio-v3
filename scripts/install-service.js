const Service = require('node-windows').Service;
const path = require('path');

// Servis konfigürasyonu
const svc = new Service({
    name: 'OptimusPrimeAgent',
    description: 'Optimus Kişisel Yapay Zeka Ajanı - Arka Planda Sürekli Çalışır',
    script: path.join(__dirname, 'start-agent.js'), // JS olarak çalıştıracağız
    nodeOptions: [
        '--max-old-space-size=4096' // Büyük bellek alanı verelim
    ]
});

// Kurulum olayları
svc.on('install', function () {
    console.log('✅ Servis başarıyla kuruldu.');
    console.log('🚀 Servis başlatılıyor...');
    svc.start();
});

svc.on('alreadyinstalled', function () {
    console.log('⚠️ Servis zaten kurulu.');
    console.log('Yeniden başlatılıyor...');
    svc.start();
});

svc.on('start', function () {
    console.log('✅ Servis başlatıldı: OptimusPrimeAgent');
    console.log('Arka planda çalışıyor. Logları etkinlik görüntüleyicisinden görebilirsiniz.');
});

svc.on('error', function (e) {
    console.error('❌ Servis hatası:', e);
});

// Kurulumu başlat
console.log('📦 Optimus Ajanı Windows Servisi olarak kuruluyor...');
svc.install();
