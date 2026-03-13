/**
 * Code Generator Service
 * Şablonları gerçek çalışan Python koduna dönüştürür
 */

import { API_CONNECTORS, generateConnectorCode } from './apiConnectorService';

// Otomasyon tipi
export interface AutomationConfig {
    templateId: string;
    name: string;
    description: string;
    connectors: string[];
    schedule?: string; // cron format
    env: Record<string, string>;
}

// Python kod şablonları
export interface PythonTemplate {
    templateId: string;
    name: string;
    category: string;
    connectors: string[];
    mainCode: string;
    description: string;
}

// Gerçek çalışan Python şablonları
export const PYTHON_TEMPLATES: Record<string, PythonTemplate> = {

    // 1. Blog Yazısı Üretici
    'blog-post-generator': {
        templateId: 'blog-post-generator',
        name: 'Blog Yazısı Üretici',
        category: 'content',
        connectors: ['huggingface'],
        description: 'AI ile SEO uyumlu blog yazısı üretir',
        mainCode: `
def generate_blog_post(topic: str, keywords: list = None) -> dict:
    """Blog yazısı üret"""
    keyword_str = ", ".join(keywords) if keywords else ""
    
    prompt = f"""Bir blog yazısı yaz:
Konu: {topic}
Anahtar kelimeler: {keyword_str}

Format:
# [Başlık]

[Giriş paragrafı]

## [Alt Başlık 1]
[İçerik]

## [Alt Başlık 2]
[İçerik]

## Sonuç
[Sonuç paragrafı]

---
Yazı profesyonel, SEO uyumlu ve 500-800 kelime olmalı.
"""
    
    content = huggingface_generate(prompt)
    
    return {
        "topic": topic,
        "content": content,
        "keywords": keywords,
        "word_count": len(content.split())
    }

if __name__ == "__main__":
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else "Yapay Zeka ve Gelecek"
    keywords = sys.argv[2].split(",") if len(sys.argv) > 2 else ["AI", "teknoloji", "gelecek"]
    
    result = generate_blog_post(topic, keywords)
    print("=" * 50)
    print(f"Konu: {result['topic']}")
    print(f"Kelime sayısı: {result['word_count']}")
    print("=" * 50)
    print(result['content'])
`
    },

    // 2. Instagram Caption Üretici
    'instagram-caption-generator': {
        templateId: 'instagram-caption-generator',
        name: 'Instagram Caption Üretici',
        category: 'content',
        connectors: ['huggingface'],
        description: 'Viral Instagram caption ve hashtag üretir',
        mainCode: `
def generate_instagram_caption(theme: str, tone: str = "eğlenceli") -> dict:
    """Instagram caption üret"""
    
    prompt = f"""Instagram için viral bir caption yaz:
Tema: {theme}
Ton: {tone}

Kurallar:
1. Hook cümlesi ile başla (dikkat çekici)
2. Değer kat veya hikaye anlat
3. Call-to-action ekle
4. 5-10 alakalı hashtag ekle
5. 1-2 emoji kullan

Format:
[Caption metni]

#hashtag1 #hashtag2 #hashtag3 ...
"""
    
    content = huggingface_generate(prompt)
    
    # Hashtag'leri ayır
    lines = content.strip().split("\\n")
    caption_lines = []
    hashtags = []
    
    for line in lines:
        if line.strip().startswith("#"):
            hashtags.extend([tag.strip() for tag in line.split() if tag.startswith("#")])
        else:
            caption_lines.append(line)
    
    return {
        "theme": theme,
        "caption": "\\n".join(caption_lines).strip(),
        "hashtags": hashtags,
        "hashtag_count": len(hashtags)
    }

if __name__ == "__main__":
    import sys
    theme = sys.argv[1] if len(sys.argv) > 1 else "girişimcilik ve motivasyon"
    tone = sys.argv[2] if len(sys.argv) > 2 else "ilham verici"
    
    result = generate_instagram_caption(theme, tone)
    print("=" * 50)
    print("📸 INSTAGRAM CAPTION")
    print("=" * 50)
    print(result['caption'])
    print("")
    print(" ".join(result['hashtags']))
    print(f"\\n({result['hashtag_count']} hashtag)")
`
    },

    // 3. Etsy SEO Açıklama Üretici
    'etsy-seo-generator': {
        templateId: 'etsy-seo-generator',
        name: 'Etsy SEO Açıklama Üretici',
        category: 'ecommerce',
        connectors: ['huggingface'],
        description: 'Etsy ürün başlığı, açıklaması ve tag\'leri üretir',
        mainCode: `
def generate_etsy_listing(product: str, category: str = "dijital ürün") -> dict:
    """Etsy listing içeriği üret"""
    
    prompt = f"""Etsy için ürün listesi oluştur:
Ürün: {product}
Kategori: {category}

Oluştur:
1. SEO uyumlu başlık (140 karakter max, anahtar kelimelerle)
2. Detaylı açıklama (ürün özellikleri, kullanım, neden almalı)
3. 13 adet SEO tag (virgülle ayır)

Format:
BAŞLIK: [başlık]

AÇIKLAMA:
[açıklama]

TAG'LER: tag1, tag2, tag3, ...
"""
    
    content = huggingface_generate(prompt)
    
    # Parse et
    lines = content.strip().split("\\n")
    title = ""
    description_lines = []
    tags = []
    current_section = None
    
    for line in lines:
        line = line.strip()
        if line.startswith("BAŞLIK:"):
            title = line.replace("BAŞLIK:", "").strip()
            current_section = "title"
        elif line.startswith("AÇIKLAMA:"):
            current_section = "description"
        elif line.startswith("TAG'LER:") or line.startswith("TAGS:"):
            tags = [tag.strip() for tag in line.split(":", 1)[1].split(",")]
            current_section = "tags"
        elif current_section == "description" and line:
            description_lines.append(line)
    
    return {
        "product": product,
        "title": title[:140],
        "description": "\\n".join(description_lines),
        "tags": tags[:13],
        "tag_count": len(tags[:13])
    }

if __name__ == "__main__":
    import sys
    product = sys.argv[1] if len(sys.argv) > 1 else "Dijital Planner 2024"
    category = sys.argv[2] if len(sys.argv) > 2 else "dijital ürün"
    
    result = generate_etsy_listing(product, category)
    print("=" * 50)
    print("🛍️ ETSY LISTING")
    print("=" * 50)
    print(f"\\nBAŞLIK ({len(result['title'])} karakter):")
    print(result['title'])
    print(f"\\nAÇIKLAMA:")
    print(result['description'])
    print(f"\\nTAG'LER ({result['tag_count']} adet):")
    print(", ".join(result['tags']))
`
    },

    // 4. Tweet Üretici
    'tweet-generator': {
        templateId: 'tweet-generator',
        name: 'Tweet/X Post Üretici',
        category: 'content',
        connectors: ['huggingface'],
        description: 'Viral tweet ve thread üretir',
        mainCode: `
def generate_tweet(topic: str, style: str = "bilgilendirici") -> dict:
    """Tweet üret"""
    
    prompt = f"""Twitter/X için viral bir tweet yaz:
Konu: {topic}
Stil: {style}

Kurallar:
1. 280 karakter limiti
2. Dikkat çekici başla
3. Değer kat
4. Engagement tetikle (soru, tartışma)
5. 1-2 emoji kullan

Sadece tweet metnini yaz:
"""
    
    content = huggingface_generate(prompt)
    tweet = content.strip()[:280]
    
    return {
        "topic": topic,
        "tweet": tweet,
        "char_count": len(tweet),
        "style": style
    }

def generate_thread(topic: str, tweet_count: int = 5) -> dict:
    """Tweet thread üret"""
    
    prompt = f"""Twitter/X için {tweet_count} tweet'lik bir thread yaz:
Konu: {topic}

Kurallar:
1. Her tweet 280 karakter max
2. İlk tweet hook olmalı
3. Her tweet numaralı (1/, 2/, ...)
4. Son tweet CTA içermeli

Format:
1/ [tweet 1]
2/ [tweet 2]
...
"""
    
    content = huggingface_generate(prompt)
    tweets = []
    
    for line in content.strip().split("\\n"):
        line = line.strip()
        if line and (line[0].isdigit() or line.startswith("🧵")):
            tweets.append(line[:280])
    
    return {
        "topic": topic,
        "tweets": tweets,
        "tweet_count": len(tweets)
    }

if __name__ == "__main__":
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else "Yapay zeka ile para kazanmanın 5 yolu"
    mode = sys.argv[2] if len(sys.argv) > 2 else "tweet"  # tweet veya thread
    
    if mode == "thread":
        result = generate_thread(topic)
        print("=" * 50)
        print("🧵 TWITTER THREAD")
        print("=" * 50)
        for tweet in result['tweets']:
            print(f"\\n{tweet}")
            print("-" * 30)
    else:
        result = generate_tweet(topic)
        print("=" * 50)
        print("🐦 TWEET")
        print("=" * 50)
        print(f"\\n{result['tweet']}")
        print(f"\\n({result['char_count']}/280 karakter)")
`
    },

    // 5. Email Yanıtlayıcı
    'email-responder': {
        templateId: 'email-responder',
        name: 'AI Email Yanıtlayıcı',
        category: 'assistant',
        connectors: ['huggingface', 'email'],
        description: 'Gelen emaillere AI ile profesyonel yanıt üretir ve gönderir',
        mainCode: `
def generate_email_response(original_email: str, context: str = "") -> dict:
    """Email yanıtı üret"""
    
    prompt = f"""Aşağıdaki emaile profesyonel bir yanıt yaz:

GELEN EMAIL:
{original_email}

EK BAĞLAM:
{context if context else "Yok"}

Kurallar:
1. Profesyonel ve nazik ol
2. Soruları cevapla
3. Gerekirse ek bilgi iste
4. İmza ekle

Format:
Merhaba [isim],

[yanıt içeriği]

Saygılarımla,
[imza]
"""
    
    response = huggingface_generate(prompt)
    
    return {
        "original": original_email[:200] + "..." if len(original_email) > 200 else original_email,
        "response": response,
        "word_count": len(response.split())
    }

def respond_and_send(to: str, subject: str, original_email: str, context: str = "") -> dict:
    """Yanıt üret ve gönder"""
    
    result = generate_email_response(original_email, context)
    
    # Email gönder
    success = send_email(to, f"Re: {subject}", result['response'])
    
    return {
        **result,
        "sent": success,
        "to": to,
        "subject": f"Re: {subject}"
    }

if __name__ == "__main__":
    # Test modu - sadece yanıt üret, gönderme
    test_email = """
Merhaba,

Ürününüzle ilgileniyorum. Fiyat ve teslimat süresi hakkında bilgi alabilir miyim?

Teşekkürler,
Ahmet
"""
    
    result = generate_email_response(test_email, "E-ticaret sitesi, dijital ürün satışı")
    print("=" * 50)
    print("📧 EMAIL YANITI")
    print("=" * 50)
    print(result['response'])
    print(f"\\n({result['word_count']} kelime)")
`
    }
};

// Tam Python dosyası üret
export function generatePythonFile(templateId: string, env: Record<string, string> = {}): string {
    const template = PYTHON_TEMPLATES[templateId];
    if (!template) {
        throw new Error(`Template bulunamadı: ${templateId}`);
    }

    // Connector kodlarını al
    const connectorCode = generateConnectorCode(template.connectors);

    // Env dosyası içeriği
    const envContent = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\\n');

    // Ana Python dosyası
    const pythonFile = `#!/usr/bin/env python3
"""
${template.name}
${template.description}

Auto-generated by OmniFlow Factory
"""

${connectorCode}

# ============================================
# MAIN AUTOMATION CODE
# ============================================
${template.mainCode}
`;

    return pythonFile;
}

// Requirements.txt üret
export function generateRequirements(connectors: string[]): string {
    const baseRequirements = ['requests', 'python-dotenv'];
    const connectorRequirements: Record<string, string[]> = {
        'huggingface': [],
        'gemini': ['google-generativeai'],
        'email': [],
        'telegram': [],
        'sheets': ['gspread', 'google-auth'],
        'binance': ['python-binance']
    };

    const allRequirements = new Set(baseRequirements);
    connectors.forEach(connector => {
        connectorRequirements[connector]?.forEach(req => allRequirements.add(req));
    });

    return Array.from(allRequirements).join('\\n');
}

// GitHub Actions workflow üret
export function generateWorkflow(name: string, schedule: string = "0 9 * * *"): string {
    return `name: ${name}

on:
  schedule:
    - cron: '${schedule}'
  workflow_dispatch:

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run automation
        env:
          HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        run: |
          python main.py
`;
}

// Export all
export const CodeGeneratorService = {
    templates: PYTHON_TEMPLATES,
    generatePythonFile,
    generateRequirements,
    generateWorkflow
};
