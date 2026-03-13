/**
 * 📝 TEMPLATE DESCRIPTION ENRICHER
 * 
 * Tüm şablonlara detaylı Türkçe açıklamalar ekler.
 * Her otomasyon için:
 * - Ne işe yarar?
 * - Nasıl çalışır?
 * - Kime hitap eder?
 * - Ne kazandırır?
 */

// Detaylı açıklamalar sözlüğü
export const DETAILED_DESCRIPTIONS: Record<string, {
    description: string;
    howItWorks: string;
    benefits: string[];
    targetAudience: string[];
}> = {
    // FINANCE
    'gold-tracker': {
        description: 'Altın, gümüş ve diğer değerli metal fiyatlarını anlık olarak takip eder. Belirlediğiniz fiyat seviyelerine ulaşıldığında otomatik bildirim gönderir. Yatırımcılar için ideal alım-satım zamanlaması sağlar.',
        howItWorks: '1. Merkez bankası ve uluslararası borsalardan anlık fiyat verileri çeker\n2. Belirlenen eşik değerlerle karşılaştırır\n3. Fiyat değişimlerini analiz eder\n4. SMS, Email veya Telegram ile anında bildirim gönderir',
        benefits: ['Piyasayı 7/24 takip etme zorunluluğunu kaldırır', 'Alım fırsatlarını kaçırmazsınız', 'Ani düşüşlerden korunursunuz'],
        targetAudience: ['Altın yatırımcıları', 'Kuyumcular', 'Döviz büroları', 'Bireysel tasarruf sahipleri']
    },
    'crypto-arbitrage-bot': {
        description: 'Farklı kripto para borsaları arasındaki fiyat farklarını anlık olarak tespit eder. Binance, Coinbase, Kraken gibi borsalarda aynı coinin farklı fiyatlandığı anları yakalar ve arbitraj fırsatlarını bildirir.',
        howItWorks: '1. Birden fazla borsadan eşzamanlı fiyat verisi çeker\n2. İşlem ücretleri dahil karlılık hesaplar\n3. %2+ kar potansiyeli olan fırsatları filtreler\n4. Anlık push bildirimi gönderir',
        benefits: ['Düşük riskli kar fırsatları', 'Manuel takip gerektirmez', 'Saniyeler içinde fırsat bildirimi'],
        targetAudience: ['Kripto yatırımcıları', 'Günlük trader\'lar', 'Yatırım fonları']
    },
    'stock-alert-system': {
        description: 'Borsa İstanbul ve uluslararası borsalardaki hisse senetlerini takip eder. Belirlediğiniz fiyat seviyelerinde, hacim artışlarında veya teknik gösterge sinyallerinde anında uyarı gönderir.',
        howItWorks: '1. Borsa API\'lerinden gerçek zamanlı veri alır\n2. Kullanıcının belirlediği alarm kurallarını kontrol eder\n3. RSI, MACD gibi teknik göstergeleri hesaplar\n4. Koşul sağlandığında çoklu kanal bildirimi yapar',
        benefits: ['Fırsatları kaçırmadan haberdar olun', 'Teknik analiz otomatikleşir', 'Birden fazla hisseyi aynı anda takip edin'],
        targetAudience: ['Bireysel yatırımcılar', 'Portföy yöneticileri', 'Finans danışmanları']
    },
    'currency-arbitrage': {
        description: 'Döviz kurlarındaki bankalar arası fiyat farklarını tespit eder. USD, EUR, GBP gibi para birimlerinde farklı kurumların sunduğu kurları karşılaştırır ve en avantajlı alım-satım noktalarını gösterir.',
        howItWorks: '1. Bankalar ve döviz bürolarından kur bilgisi toplar\n2. Spread hesaplaması yapar\n3. Karlı arbitraj fırsatlarını belirler\n4. Raporlar ve bildirimler gönderir',
        benefits: ['En iyi döviz kurunu bulursunuz', 'Para transferlerinde tasarruf', 'Ticaret maliyetlerini düşürür'],
        targetAudience: ['İthalat-ihracat firmaları', 'Döviz büroları', 'Uluslararası ticaret yapanlar']
    },

    // E-COMMERCE
    'ecommerce-price-tracker': {
        description: 'Rakiplerinizin e-ticaret sitelerindeki ürün fiyatlarını otomatik olarak izler. Fiyat değişikliklerini anında tespit eder ve rekabetçi fiyatlandırma stratejisi geliştirmenizi sağlar.',
        howItWorks: '1. Belirlenen rakip sitelerden ürün fiyatlarını çeker\n2. Veritabanında geçmiş fiyatlarla karşılaştırır\n3. Fiyat değişim raporları oluşturur\n4. Rekabetçi fiyat önerileri sunar',
        benefits: ['Rakip fiyatlarını 7/24 takip edin', 'Fiyat savaşlarına anında tepki verin', 'Kar marjınızı optimize edin'],
        targetAudience: ['E-ticaret mağazaları', 'Perakende zincirleri', 'Fiyatlandırma uzmanları']
    },
    'abandoned-cart': {
        description: 'Sepetini terk eden müşterilere otomatik hatırlatma mesajları gönderir. Kişiselleştirilmiş email, SMS veya WhatsApp ile müşterileri satın almaya teşvik eder ve kayıp satışları kurtarır.',
        howItWorks: '1. Sepet terk olaylarını algılar\n2. Müşteri profiline göre kişiselleştirilmiş mesaj hazırlar\n3. Zamanlı hatırlatma dizisi başlatır\n4. Opsiyonel indirim kuponu önerir',
        benefits: ['Kayıp satışların %15-30\'unu kurtarın', 'Dönüşüm oranını artırın', 'Müşteri sadakatini güçlendirin'],
        targetAudience: ['Online mağazalar', 'E-ticaret girişimcileri', 'Dijital pazarlamacılar']
    },
    'amazon-replenishment-bot': {
        description: 'Amazon FBA envanterinizi otomatik yönetir. Satış hızını analiz ederek stok kritik seviyeye düşmeden önce tedarikçiye otomatik sipariş gönderir. Stok tükenmesi kaynaklı satış kayıplarını önler.',
        howItWorks: '1. Amazon Seller API\'den satış ve stok verilerini çeker\n2. Satış hızı ve mevsimsellik analizi yapar\n3. Yeniden sipariş noktasını hesaplar\n4. Tedarikçiye otomatik sipariş emri gönderir',
        benefits: ['Asla stok kalmanız', 'Tedarik sürecini otomatikleştirin', 'FBA depo ücretlerini optimize edin'],
        targetAudience: ['Amazon FBA satıcıları', 'E-ticaret işletmeleri', 'Dropshipping girişimcileri']
    },

    // CUSTOMER SERVICE
    'whatsapp-ai-assistant': {
        description: '7/24 çalışan yapay zeka destekli WhatsApp asistanı. Müşteri sorularını anında yanıtlar, sipariş durumu bilgisi verir, randevu hatırlatmaları gönderir ve SSS sorularını otomatik çözer.',
        howItWorks: '1. WhatsApp Business API ile gelen mesajları dinler\n2. AI ile mesajın amacını analiz eder\n3. Basit sorulara otomatik yanıt verir\n4. Karmaşık konuları canlı destek ekibine yönlendirir',
        benefits: ['7/24 müşteri desteği', 'Destek maliyetlerini %60 azaltın', 'Müşteri memnuniyetini artırın'],
        targetAudience: ['Küçük işletmeler', 'Online mağazalar', 'Hizmet sektörü']
    },
    'google-reviews-responder': {
        description: 'Google Business yorumlarını otomatik izler ve AI ile analiz eder. Olumlu yorumlara teşekkür, olumsuz yorumlara çözüm odaklı profesyonel yanıtlar üretir. İtibar yönetimini otomatikleştirir.',
        howItWorks: '1. Yeni Google yorumlarını gerçek zamanlı algılar\n2. Sentiment analizi ile tonunu belirler\n3. Yorum içeriğine uygun yanıt oluşturur\n4. Olumsuz yorumlarda yöneticiye bildirim gönderir',
        benefits: ['İtibarınızı koruyun', 'Tüm yorumlara anında yanıt', 'SEO puanınızı yükseltin'],
        targetAudience: ['Restoranlar', 'Oteller', 'Yerel işletmeler', 'Sağlık hizmetleri']
    },

    // CONTENT
    'social-content-factory': {
        description: 'Günlük viral trend analizi yaparak sosyal medya içerikleri üretir. Instagram, Twitter, LinkedIn için optimize edilmiş görseller, metinler ve hashtag önerileri oluşturur.',
        howItWorks: '1. Güncel trendleri ve viral içerikleri tarar\n2. Markanıza uygun konseptleri filtreler\n3. Platformlara özel caption ve görsel önerir\n4. Hazır paylaşım paketi oluşturur',
        benefits: ['Günlük içerik üretim süresini %80 azaltın', 'Trend odaklı içerikler paylaşın', 'Etkileşim oranlarını artırın'],
        targetAudience: ['Sosyal medya yöneticileri', 'Dijital ajanslar', 'Influencer\'lar', 'KOBİ\'ler']
    },
    'blog-to-social': {
        description: 'Blog yazılarınızı otomatik olarak sosyal medya içeriklerine dönüştürür. Bir blog yazısından Twitter thread, LinkedIn post, Instagram carousel ve Facebook paylaşımı oluşturur.',
        howItWorks: '1. Blog içeriğini analiz eder\n2. Anahtar mesajları ve önemli noktaları çıkarır\n3. Her platform için uygun formatta yeniden yazar\n4. Görsel önerileri sunar',
        benefits: ['Bir içerikten 5+ paylaşım üretin', 'İçerik üretim maliyetini düşürün', 'Tutarlı marka sesi koruyun'],
        targetAudience: ['İçerik pazarlamacıları', 'Bloggerlar', 'Dijital ajanslar']
    },

    // ASSISTANT
    'appointment-reminder': {
        description: 'Müşterilerinize randevu hatırlatma mesajları gönderir. WhatsApp, SMS veya email ile randevudan 24 saat ve 1 saat önce otomatik bildirim yapar. Randevu iptallerini ve no-show\'ları azaltır.',
        howItWorks: '1. Takvim/CRM sisteminden randevuları çeker\n2. Belirlenen zamanlarda hatırlatma mesajı oluşturur\n3. Birden fazla kanaldan (SMS, WhatsApp, Email) gönderir\n4. Onay/iptal yanıtlarını takip eder',
        benefits: ['Randevu iptallerini %40 azaltın', 'No-show oranını düşürün', 'Müşteri memnuniyetini artırın'],
        targetAudience: ['Kuaförler', 'Klinikler', 'Avukatlar', 'Danışmanlar']
    },
    'hair-salon-appointment-bot': {
        description: 'Kuaför salonları için özel tasarlanmış AI randevu asistanı. Instagram DM ve WhatsApp\'tan gelen mesajları yanıtlar, randevu oluşturur, hizmet bilgisi verir ve kararsız müşterileri ikna etmeye çalışır.',
        howItWorks: '1. Sosyal medya mesajlarını dinler\n2. Müşterinin niyetini AI ile analiz eder\n3. Uygun randevu saatlerini önerir\n4. Kararsız müşterilere özel ikna stratejileri uygular',
        benefits: ['7/24 randevu alımı', 'Başka işlerle uğraşırken bile müşteri kaybetmeyin', 'Müşteri dönüşüm oranını artırın'],
        targetAudience: ['Kuaför salonları', 'Güzellik merkezleri', 'SPA\'lar', 'Berberler']
    },

    // ANALYTICS
    'weekly-analytics-report': {
        description: 'Tüm platformlardan (Google Analytics, sosyal medya, satış) verileri toplayarak haftalık otomatik rapor oluşturur. Yöneticilere AI yorumlu, okunması kolay özetler gönderir.',
        howItWorks: '1. Birden fazla veri kaynağından metrikleri toplar\n2. Önceki dönemlerle karşılaştırır\n3. AI ile trendleri ve anomalileri analiz eder\n4. PDF raporu email ile gönderir',
        benefits: ['Haftalık rapor hazırlama süresini sıfırlayın', 'Veriye dayalı kararlar alın', 'Tüm metrikleri tek yerde görün'],
        targetAudience: ['Pazarlama yöneticileri', 'C-level yöneticiler', 'Dijital ajanslar']
    },
    'customer-feedback-ai': {
        description: 'Müşteri yorumlarını, anket yanıtlarını ve destek taleplerini AI ile analiz eder. Duygu analizi yaparak memnuniyet trendlerini çıkarır ve iyileştirme önerileri sunar.',
        howItWorks: '1. Birden fazla kaynaktan geri bildirimleri toplar\n2. NLP ile duygu analizi yapar\n3. Ortak şikayetleri ve övgüleri kategorize eder\n4. Aksiyon önerileriyle rapor sunar',
        benefits: ['Müşteri sesini duyun', 'Proaktif iyileştirmeler yapın', 'Memnuniyet skorunu yükseltin'],
        targetAudience: ['Müşteri deneyimi ekipleri', 'Ürün yöneticileri', 'Kalite departmanları']
    },

    // MONEY MAKER
    'lead-hunter': {
        description: 'LinkedIn\'den hedef sektör ve pozisyondaki potansiyel müşterileri otomatik bulur. Profilleri puanlar, kişiselleştirilmiş bağlantı mesajları hazırlar ve CRM\'e aktarır.',
        howItWorks: '1. Belirlenen kriterlere göre LinkedIn profilleri tarar\n2. Potansiyel değerine göre lead skorlaması yapar\n3. Her lead için kişiselleştirilmiş mesaj taslağı oluşturur\n4. Verileri CRM sistemine aktarır',
        benefits: ['Satış ekibinin prospecting süresini %70 azaltın', 'Yüksek kaliteli lead\'ler bulun', 'Kişiselleştirilmiş outreach yapın'],
        targetAudience: ['B2B satış ekipleri', 'Dijital ajanslar', 'Danışmanlık firmaları']
    },
    'customer-invoice-automation': {
        description: 'Siparişlerden otomatik fatura oluşturur, müşteriye gönderir ve ödeme takibi yapar. Gecikmiş ödemelere otomatik hatırlatmalar gönderir ve nakit akışını iyileştirir.',
        howItWorks: '1. Yeni siparişleri algılar\n2. Sipariş verilerine göre e-fatura oluşturur\n3. Faturayı müşteriye otomatik gönderir\n4. Ödeme durumunu takip eder ve gecikmelerde hatırlatır',
        benefits: ['Faturalama süresini %90 kısaltın', 'Ödeme gecikmeleri azalsın', 'Nakit akışını iyileştirin'],
        targetAudience: ['Freelancerlar', 'KOBİ\'ler', 'Hizmet sektörü', 'E-ticaret']
    },

    // VIDEO
    'ovi-reels-factory': {
        description: 'AI destekli viral Reels ve TikTok videoları üretir. Trend analizi yapar, viral hook\'lar oluşturur, konuşan avatar videoları hazırlar ve çoklu platformlara uygun formatta dışa aktarır.',
        howItWorks: '1. TikTok ve Instagram trendlerini analiz eder\n2. Viral potansiyeli yüksek script yazar\n3. AI avatar ile video oluşturur\n4. Platformlara uygun boyutlarda export eder',
        benefits: ['Günlük video üretim süresini saatlere indirin', 'Trend odaklı içerikler üretin', 'Kamera karşısına geçmeden video yapın'],
        targetAudience: ['İçerik üreticileri', 'Sosyal medya yöneticileri', 'E-ticaret markaları']
    },
    'youtube-shorts-maker': {
        description: 'Uzun videolardan otomatik olarak YouTube Shorts klipler çıkarır. En ilgi çekici anları AI ile tespit eder, altyazı ekler ve Shorts formatında düzenler.',
        howItWorks: '1. Uzun videoyu analiz eder\n2. Yüksek etkileşim potansiyeli olan segmentleri belirler\n3. Dikey formata dönüştürür\n4. Otomatik altyazı ve efektler ekler',
        benefits: ['Mevcut içeriklerinizi yeniden değerlendirin', 'Shorts için ayrı çekim yapmayın', 'İzlenme sayınızı katlayın'],
        targetAudience: ['YouTuber\'lar', 'Podcast yapımcıları', 'Eğitimciler']
    }
};

export default DETAILED_DESCRIPTIONS;
