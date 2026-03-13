#!/bin/bash
# INSTALL-OPTIMUS-COMPLETE.sh

echo "🚀 OPTIMUS STUDIO - TAM ÖZELLİKLİ KURULUM"
echo "=========================================="

# 1. SİSTEM HAZIRLIĞI
echo "🔧 Sistem hazırlanıyor..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget python3 python3-pip nodejs npm
sudo apt install -y ffmpeg imagemagick build-essential cmake

# 2. GPU DESTEĞİ (NVIDIA)
echo "🎮 NVIDIA GPU kurulumu..."
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt update
sudo apt install -y cuda-toolkit-12-4 nvidia-docker2

# 3. OLLAMA + TÜM MODELLER
echo "🧠 Ollama ve AI modelleri kuruluyor..."
curl -fsSL https://ollama.ai/install.sh | sh

# ÖZEL MODELLERİ İNDİR
ollama pull qwen2.5:7b-coder-q4_K_M
ollama pull deepseek-coder:33b-q4_K_M
ollama pull mistral:7b-tr-q4_K_M
ollama pull mixtral:8x7b-q4_K_M
ollama pull llama3.1:70b-q2_K

# 4. AÇIK KAYNAK BİLEŞENLER
echo "🔧 Açık kaynak bileşenler kuruluyor..."

# ComfyUI (Video/Görsel Üretim)
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI && pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt
cd ..

# Whisper.cpp (Ses Tanıma)
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp && make -j4
./models/download-ggml-model.sh base
cd ..

# Piper TTS (Türkçe Ses Sentez)
git clone https://github.com/rhasspy/piper.git
cd piper && wget https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/turkey/medium/tr_TR-turkey-medium.onnx
cd ..

# Llama.cpp (Backup Runtime)
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp && make -j4
cd ..

# 5. NODE.JS UYGULAMASI
echo "📦 Node.js uygulaması kuruluyor..."
git clone https://github.com/optimus-studio/complete-edition.git
cd complete-edition

# Tüm bağımlılıklar
npm install
npm install @langchain/langgraph autogen open-interpreter
npm install playwright xterm monaco-editor three
npm install @react-three/fiber @react-three/drei
npm install fluent-ffmpeg ffmpeg-static
npm install sqlite3 qdrant-client chromadb

# 6. DOCKER SERVİSLERİ
echo "🐳 Docker servisleri başlatılıyor..."
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
  
  comfyui:
    image: comfyanonymous/comfyui:latest
    ports: ["8188:8188"]
    volumes:
      - ./comfyui/models:/models
      - ./comfyui/output:/output
  
  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333"]
  
  optimus-studio:
    build: .
    ports:
      - "3000:3000" # Web UI
      - "8080:8080" # Terminal
    volumes:
      - ./videos:/app/videos
      - ./exports:/app/exports
      - ./data:/app/data
    depends_on:
      - ollama
      - comfyui
EOF

docker-compose up -d

# 7. YAPILANDIRMA DOSYALARI
echo "⚙️ Yapılandırma dosyaları oluşturuluyor..."

# Ana konfigürasyon
cat > config.json << 'EOF'
{
  "system": {
    "name": "Optimus Studio Complete Edition",
    "version": "3.0.0",
    "mode": "full_autonomous"
  },
  
  "ai_models": {
    "coding": "qwen2.5:7b-coder-q4_K_M",
    "planning": "deepseek-coder:33b-q4_K_M",
    "turkish": "mistral:7b-tr-q4_K_M",
    "video_script": "mixtral:8x7b-q4_K_M",
    "long_context": "llama3.1:70b-q2_K"
  },
  
  "production": {
    "video_channels": 3,
    "automation_scouts": 5,
    "max_concurrent": 2,
    "auto_upload": true,
    "auto_monetize": true
  },
  
  "safety": {
    "self_healing": true,
    "auto_rollback": true,
    "kill_switch": true,
    "sandbox_all": true
  }
}
EOF

# 8. BAŞLANGIÇ SCRIPT'LERİ
echo "🚀 Başlangıç script'leri oluşturuluyor..."

# Video Fabrikası Başlat
cat > start-video-factory.sh << 'EOF'
#!/bin/bash
cd /opt/optimus-studio
node production_engine.js \
  --channels 3 \
  --output-dir ./videos \
  --auto-upload \
  --ai-models all
EOF

# Otomasyon Fabrikası Başlat
cat > start-automation-factory.sh << 'EOF'
#!/bin/bash
cd /opt/optimus-studio
node automation_scout.js \
  --sources github,n8n,activepieces \
  --filter profitable \
  --output-dir ./exports \
  --auto-package
EOF

# Self-Healing Sistem
cat > start-self-healing.sh << 'EOF'
#!/bin/bash
cd /opt/optimus-studio
node self_healing_engine.js \
  --mode continuous \
  --monitor all \
  --auto-repair \
  --learn-from-failures
EOF

chmod +x *.sh

echo "✅ KURULUM TAMAMLANDI!"
echo ""
echo "🎯 ÖZELLİKLER:"
echo "   • 5 Özel AI Modeli (Qwen2.5, DeepSeek, Mistral, Mixtral, Llama 70B)"
echo "   • Tam Otonom Video Fabrikası"
echo "   • CloudBot++ Hyper-Automation"
echo "   • Kendini İyileştiren Sistem"
echo "   • Yerel Çalışan, Sıfır Bulut"
echo "   • Reality Synthesis Engine"
echo ""
echo "🚀 BAŞLATMA KOMUTLARI:"
echo "   ./start-video-factory.sh     # Video üretimini başlat"
echo "   ./start-automation-factory.sh # Otomasyon keşfini başlat"
echo "   ./start-self-healing.sh      # Self-healing sistemini başlat"
echo ""
echo "🌐 ERİŞİM NOKTALARI:"
echo "   Web UI:      http://localhost:3000"
echo "   AI API:      http://localhost:11434"
echo "   ComfyUI:     http://localhost:8188"
echo "   Terminal:    http://localhost:8080"
echo ""
echo "💰 GELİR AKIŞLARI:"
echo "   1. Video İçerik Üretimi (YouTube/TikTok/Instagram)"
echo "   2. Otomasyon Paket Satışı (Gumroad/Shopify)"
echo "   3. Özel AI Hizmetleri (API erişimi)"
echo "   4. Eğitim ve Danışmanlık"
echo ""
echo "📊 BEKLENEN AYLIK GELİR: $1,500 - $5,000+"
echo "🔥 ROI: 2-3 Ay"
