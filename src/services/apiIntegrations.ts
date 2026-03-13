// ============================================
// API INTEGRATIONS - Gerçek API Kod Şablonları
// OmniFlow Factory için gerçek çalışan kodlar
// ============================================

// Node tipine ve role'üne göre gerçek API kodu üretir
export interface ApiCodeTemplate {
  imports: string;
  functions: string;
  envVars: string[];
}

export type ApiType =
  | 'google_reviews'
  | 'telegram'
  | 'binance'
  | 'sentiment'
  | 'ai_content'
  | 'email'
  | 'generic_webhook';

// ============================================
// GOOGLE PLACES API - Yorum Okuma
// ============================================
export const googlePlacesReviewCode = (): ApiCodeTemplate => ({
  imports: `import requests
import os`,
  functions: `
def fetch_google_reviews():
    """Google Places API ile gerçek yorumları çeker"""
    api_key = os.getenv('GOOGLE_API_KEY')
    place_id = os.getenv('GOOGLE_PLACE_ID')
    
    if not api_key or not place_id:
        print("❌ GOOGLE_API_KEY veya GOOGLE_PLACE_ID tanımlı değil!")
        return []
    
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,rating,reviews,user_ratings_total",
        "language": "tr",
        "key": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "OK":
            result = data.get("result", {})
            reviews = result.get("reviews", [])
            print(f"✅ {len(reviews)} yorum bulundu - {result.get('name', 'İşletme')}")
            return reviews
        else:
            print(f"❌ Google API hatası: {data.get('status')}")
            return []
    except Exception as e:
        print(f"❌ Bağlantı hatası: {e}")
        return []
`,
  envVars: ['GOOGLE_API_KEY', 'GOOGLE_PLACE_ID']
});

// ============================================
// TELEGRAM BOT API - Bildirim Gönderme
// ============================================
export const telegramNotificationCode = (): ApiCodeTemplate => ({
  imports: `import requests
import os`,
  functions: `
def send_telegram_message(message, parse_mode="HTML"):
    """Telegram Bot API ile mesaj gönderir"""
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        print("⚠️ Telegram bilgileri eksik, bildirim atlanıyor")
        return False
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message[:4000],
        "parse_mode": parse_mode
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print("📱 Telegram bildirimi gönderildi")
            return True
        else:
            print(f"❌ Telegram hatası: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Telegram bağlantı hatası: {e}")
        return False
`,
  envVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
});

// ============================================
// BINANCE API - Fiyat ve İşlem
// ============================================
export const binancePriceCode = (): ApiCodeTemplate => ({
  imports: `import requests
import hmac
import hashlib
import time
import os`,
  functions: `
BINANCE_BASE_URL = "https://api.binance.com"

def get_binance_price(symbol="BTCUSDT"):
    """Binance'den anlık fiyat çeker"""
    url = f"{BINANCE_BASE_URL}/api/v3/ticker/price"
    params = {"symbol": symbol.upper()}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        price = float(data.get("price", 0))
        print(f"💰 {symbol}: \${price:,.2f}")
        return price
    except Exception as e:
        print(f"❌ Binance fiyat hatası: {e}")
        return 0

def get_binance_klines(symbol="BTCUSDT", interval="1h", limit=100):
    """Binance'den mum verileri çeker"""
    url = f"{BINANCE_BASE_URL}/api/v3/klines"
    params = {
        "symbol": symbol.upper(),
        "interval": interval,
        "limit": limit
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        klines = response.json()
        
        processed = []
        for k in klines:
            processed.append({
                "time": k[0],
                "open": float(k[1]),
                "high": float(k[2]),
                "low": float(k[3]),
                "close": float(k[4]),
                "volume": float(k[5])
            })
        print(f"📊 {len(processed)} mum verisi alındı")
        return processed
    except Exception as e:
        print(f"❌ Binance klines hatası: {e}")
        return []

def get_binance_account_balance():
    """Binance hesap bakiyesini çeker (API key gerekli)"""
    api_key = os.getenv('BINANCE_API_KEY')
    api_secret = os.getenv('BINANCE_SECRET')
    
    if not api_key or not api_secret:
        print("❌ BINANCE_API_KEY veya BINANCE_SECRET tanımlı değil!")
        return {}
    
    timestamp = int(time.time() * 1000)
    query_string = f"timestamp={timestamp}"
    signature = hmac.new(
        api_secret.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    url = f"{BINANCE_BASE_URL}/api/v3/account"
    headers = {"X-MBX-APIKEY": api_key}
    params = {"timestamp": timestamp, "signature": signature}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        balances = {}
        for balance in data.get("balances", []):
            free = float(balance.get("free", 0))
            locked = float(balance.get("locked", 0))
            if free > 0 or locked > 0:
                balances[balance["asset"]] = {"free": free, "locked": locked}
        
        print(f"💼 {len(balances)} coin bakiyesi bulundu")
        return balances
    except Exception as e:
        print(f"❌ Binance hesap hatası: {e}")
        return {}
`,
  envVars: ['BINANCE_API_KEY', 'BINANCE_SECRET']
});

// ============================================
// SENTIMENT ANALYSIS - HuggingFace
// ============================================
export const sentimentAnalysisCode = (): ApiCodeTemplate => ({
  imports: `import requests
import os`,
  functions: `
def analyze_sentiment(text):
    """HuggingFace ile duygu analizi yapar"""
    hf_token = os.getenv('HUGGINGFACE_TOKEN')
    
    if not hf_token:
        print("❌ HUGGINGFACE_TOKEN tanımlı değil!")
        return {"label": "unknown", "score": 0}
    
    API_URL = "https://api-inference.huggingface.co/models/savasy/bert-base-turkish-sentiment-cased"
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": text}, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if isinstance(result, list) and len(result) > 0:
            predictions = result[0]
            if isinstance(predictions, list):
                best = max(predictions, key=lambda x: x.get("score", 0))
                label = best.get("label", "neutral")
                score = best.get("score", 0)
                
                label_tr = {
                    "positive": "olumlu",
                    "negative": "olumsuz", 
                    "neutral": "nötr",
                    "LABEL_0": "olumsuz",
                    "LABEL_1": "olumlu"
                }.get(label, label)
                
                print(f"🎭 Sentiment: {label_tr} ({score:.2%})")
                return {"label": label_tr, "score": score, "original": label}
        
        return {"label": "belirsiz", "score": 0}
    except Exception as e:
        print(f"❌ Sentiment analizi hatası: {e}")
        return {"label": "hata", "score": 0, "error": str(e)}
`,
  envVars: ['HUGGINGFACE_TOKEN']
});

// ============================================
// AI CONTENT GENERATION - HuggingFace
// ============================================
export const aiContentGenerationCode = (): ApiCodeTemplate => ({
  imports: `import requests
import os`,
  functions: `
def generate_ai_response(prompt, max_tokens=512):
    """HuggingFace ile AI yanıt üretir"""
    hf_token = os.getenv('HUGGINGFACE_TOKEN')
    
    if not hf_token:
        print("❌ HUGGINGFACE_TOKEN tanımlı değil!")
        return "AI yanıtı üretilemedi - token eksik"
    
    API_URL = "https://router.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "google/gemma-2-2b-it",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"]["content"]
            print(f"🤖 AI yanıt üretildi ({len(content)} karakter)")
            return content
        
        return "AI yanıtı alınamadı"
    except Exception as e:
        print(f"❌ AI üretim hatası: {e}")
        return f"Hata: {e}"
`,
  envVars: ['HUGGINGFACE_TOKEN']
});

// ============================================
// EMAIL SENDING - SMTP
// ============================================
export const emailSendingCode = (): ApiCodeTemplate => ({
  imports: `import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart`,
  functions: `
def send_email(to_email, subject, body, html=False):
    """SMTP ile email gönderir"""
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    
    if not smtp_user or not smtp_pass:
        print("❌ SMTP_USER veya SMTP_PASS tanımlı değil!")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = to_email
        
        if html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        print(f"📧 Email gönderildi: {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email hatası: {e}")
        return False
`,
  envVars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
});

// ============================================
// MAPPING: Node Type + Role -> API Code
// ============================================
export const getApiCodeForNode = (
  nodeType: string,
  nodeRole: string,
  nodeTask: string
): ApiType | null => {
  const role = nodeRole.toLowerCase();
  const task = nodeTask.toLowerCase();

  if (role.includes('google') && (task.includes('yorum') || task.includes('review'))) {
    return 'google_reviews';
  }
  if (role.includes('telegram') || task.includes('telegram')) {
    return 'telegram';
  }
  if (role.includes('binance') || task.includes('binance') ||
    task.includes('kripto') || task.includes('fiyat')) {
    return 'binance';
  }
  if (nodeType === 'analyst' && (task.includes('sentiment') || task.includes('duygu') || task.includes('analiz'))) {
    return 'sentiment';
  }
  if (nodeType === 'creator' || (role.includes('ai') && task.includes('yaz'))) {
    return 'ai_content';
  }
  if (role.includes('email') || task.includes('email') || task.includes('gönder')) {
    return 'email';
  }

  return null;
};

export const getApiTemplate = (apiType: ApiType): ApiCodeTemplate => {
  switch (apiType) {
    case 'google_reviews':
      return googlePlacesReviewCode();
    case 'telegram':
      return telegramNotificationCode();
    case 'binance':
      return binancePriceCode();
    case 'sentiment':
      return sentimentAnalysisCode();
    case 'ai_content':
      return aiContentGenerationCode();
    case 'email':
      return emailSendingCode();
    default:
      return { imports: '', functions: '', envVars: [] };
  }
};
