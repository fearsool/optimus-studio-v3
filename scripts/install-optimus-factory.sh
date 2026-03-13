#!/bin/bash
# install-optimus-factory.sh

set -e  # Hata durumunda dur

echo "========================================"
echo "🏭 OPTIMUS DIGITAL FACTORY KURULUMU"
echo "========================================"

# 1. Node.js ve npm kontrolü
echo "🔍 Sistem kontrolü..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı. Lütfen Node.js 18+ yükleyin."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm bulunamadı."
    exit 1
fi

echo "✅ Node.js $(node -v) ve npm $(npm -v) mevcut."

# 2. Bağımlılıklar
echo "📦 Bağımlılıklar yükleniyor..."
npm install

# 3. Veri dizinleri
echo "📁 Dizin yapısı oluşturuluyor..."
mkdir -p ./data
mkdir -p ./templates/{social-media,ecommerce,seo,crypto,marketing,development}
mkdir -p ./builds
mkdir -p ./products
mkdir -p ./dashboards
mkdir -p ./backups

# 4. Örnek template'ler
echo "📝 Örnek template'ler oluşturuluyor..."
mkdir -p ./templates/social-media
cat > ./templates/social-media/instagram-auto-poster.json << 'EOF'
{
  "id": "instagram-auto-poster",
  "name": "Instagram Auto Poster",
  "description": "Automatically post content to Instagram with AI-generated captions",
  "category": "social-media",
  "complexity": 2,
  "steps": [
    {
      "name": "Configure Instagram API",
      "action": "setup_api"
    },
    {
      "name": "Set posting schedule",
      "action": "configure_schedule"
    },
    {
      "name": "Connect content source",
      "action": "connect_source"
    }
  ],
  "requiredComponents": ["puppeteer", "instagram-private-api", "node-cron"],
  "estimatedTime": 30
}
EOF

mkdir -p ./templates/ecommerce
cat > ./templates/ecommerce/shopify-importer.json << 'EOF'
{
  "id": "shopify-importer",
  "name": "Shopify Product Importer",
  "description": "Import products from CSV/Excel to Shopify store",
  "category": "ecommerce",
  "complexity": 3,
  "steps": [
    {
      "name": "Connect to Shopify",
      "action": "shopify_auth"
    },
    {
      "name": "Map CSV columns",
      "action": "configure_mapping"
    },
    {
      "name": "Set import rules",
      "action": "set_rules"
    }
  ],
  "requiredComponents": ["shopify-api-node", "csv-parser", "axios"],
  "estimatedTime": 45
}
EOF

# 5. Environment dosyası
echo "⚙️  Environment konfigürasyonu..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env.example .env olarak kopyalandı."
    echo "⚠️  Lütfen .env dosyasını düzenleyin: API key'leri ekleyin."
else
    echo "✅ .env dosyası zaten mevcut."
fi

# 6. TypeScript build
echo "🔨 TypeScript derleniyor..."
npm run build:server

# 7. Database initialization
echo "🗄️  Veritabanı hazırlanıyor..."
if [ -f ./data/optimus.db ]; then
    echo "✅ Veritabanı zaten mevcut."
else
    echo "🆕 Yeni veritabanı oluşturuluyor..."
    node -e "
        const { Database } = require('better-sqlite3');
        const db = new Database('./data/optimus.db');
        console.log('✅ SQLite veritabanı oluşturuldu.');
    "
fi

# 8. Servis dosyası (Linux için)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔄 Systemd servis dosyası oluşturuluyor..."
    cat > /tmp/optimus-factory.service << EOF
[Unit]
Description=Optimus Digital Factory
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=$(which node) dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    echo "⚠️  Systemd servis dosyası /tmp/optimus-factory.service olarak oluşturuldu."
    echo "⚠️  Kurmak için: sudo mv /tmp/optimus-factory.service /etc/systemd/system/"
    echo "⚠️  Sonra: sudo systemctl daemon-reload && sudo systemctl enable optimus-factory"
fi

# 9. Tamamlandı
echo ""
echo "========================================"
echo "✅ OPTIMUS DIGITAL FACTORY KURULDU!"
echo "========================================"
echo ""
echo "🎯 BAŞLATMAK İÇİN:"
echo "1. .env dosyasını düzenle (API key'leri ekle)"
echo "2. Geliştirme modunda: npm run dev"
echo "3. Production modunda: npm start"
echo ""
echo "📊 Dashboard: http://localhost:3005/factory"
echo "🛠️  Komutlar:"
echo "   npm run factory:create -- --category social-media --template instagram-auto-poster"
echo "   npm run factory:mass-produce -- --category ecommerce --count 5"
echo "   npm run security:audit"
echo ""
echo "📞 Sorunlar için:"
echo "   - API key'lerinizi kontrol edin"
echo "   - .env dosyasını düzenleyin"
echo "   - Log'lara bakın: tail -f logs/optimus.log"
echo "========================================"
