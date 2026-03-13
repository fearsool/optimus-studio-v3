// src/agent/voice/IntentParser.ts
import { StateStore } from '../state/StateStore';
import { ModelRouter } from '../router/ModelRouter';
import natural from 'natural';
import compromise from 'compromise';
import { franc } from 'franc';
// import { TensorFlowNLP } from '@tensorflow/tfjs-node'; // Removed to fix build error

export class IntentParser {
  private stateStore: StateStore;
  private modelRouter: ModelRouter;
  // private tfNLP: TensorFlowNLP;

  // Türkçe ve İngilizce intent pattern'leri
  private intentPatterns = {
    turkish: {
      greeting: [
        'merhaba', 'selam', 'günaydın', 'iyi günler', 'nasılsın', 'ne haber',
        'hey', 'alo', 'slm', 'selamun aleyküm'
      ],
      financial: [
        'kripto', 'bitcoin', 'ethereum', 'altcoin', 'borsa', 'yatırım',
        'alım satım', 'trade', 'portföy', 'analiz', 'piyasa', 'coin',
        'dolar', 'euro', 'tl', 'para', 'kazanç', 'kar', 'zarar'
      ],
      web_development: [
        'web sitesi', 'site yap', 'website', 'tasarım', 'kod', 'programlama',
        'html', 'css', 'javascript', 'react', 'nextjs', 'seo', 'optimizasyon',
        'domain', 'hosting', 'deploy', 'yayınla'
      ],
      social_media: [
        'instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'youtube',
        'gönderi', 'post', 'paylaşım', 'beğeni', 'takipçi', 'etkileşim',
        'reels', 'hikaye', 'canlı yayın', 'promosyon'
      ],
      system_control: [
        'dur', 'başlat', 'durdur', 'kapat', 'yeniden başlat', 'güncelle',
        'yükleyici', 'kurulum', 'ayar', 'yapılandırma', 'bakım', 'temizle'
      ],
      emergency: [
        'acil', 'dur', 'yardım', 'tehlike', 'sorun', 'hata', 'kritik',
        'yetkilendirme', 'izin', 'onay', 'doğrula'
      ],
      learning: [
        'öğren', 'eğit', 'geliştir', 'yeni beceri', 'kurs', 'eğitim',
        'araştır', 'incele', 'derinleştir', 'uzmanlaş'
      ],
      personal: [
        'benim', 'bana', 'kişisel', 'tercih', 'ayar', 'profil', 'hesap',
        'şifre', 'güvenlik', 'gizlilik', 'veri'
      ]
    },
    english: {
      greeting: [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'how are you', 'what\'s up', 'yo', 'greetings'
      ],
      financial: [
        'crypto', 'bitcoin', 'ethereum', 'altcoin', 'trading', 'investment',
        'portfolio', 'analysis', 'market', 'stock', 'money', 'profit',
        'loss', 'buy', 'sell', 'trade', 'exchange'
      ],
      web_development: [
        'website', 'web development', 'site', 'design', 'code', 'programming',
        'html', 'css', 'javascript', 'react', 'nextjs', 'seo', 'optimization',
        'domain', 'hosting', 'deploy', 'publish'
      ],
      social_media: [
        'instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'youtube',
        'post', 'share', 'like', 'follower', 'engagement', 'reels',
        'story', 'live stream', 'promotion'
      ],
      system_control: [
        'stop', 'start', 'pause', 'shutdown', 'restart', 'update',
        'install', 'setup', 'configure', 'maintenance', 'clean'
      ],
      emergency: [
        'emergency', 'stop', 'help', 'danger', 'problem', 'error', 'critical',
        'authorization', 'permission', 'approve', 'verify'
      ],
      learning: [
        'learn', 'train', 'develop', 'new skill', 'course', 'education',
        'research', 'study', 'deepen', 'specialize'
      ],
      personal: [
        'my', 'me', 'personal', 'preference', 'setting', 'profile', 'account',
        'password', 'security', 'privacy', 'data'
      ]
    }
  };

  // Action mapping - Her intent için hangi aksiyon alınacak
  private actionMapping = {
    greeting: { action: 'greet', module: 'voice', priority: 'low' },
    financial: { action: 'process_financial', module: 'finance', priority: 'medium' },
    web_development: { action: 'develop_website', module: 'web', priority: 'high' },
    social_media: { action: 'manage_social', module: 'web', priority: 'medium' },
    system_control: { action: 'control_system', module: 'core', priority: 'high' },
    emergency: { action: 'handle_emergency', module: 'core', priority: 'critical' },
    learning: { action: 'start_learning', module: 'evolution', priority: 'medium' },
    personal: { action: 'update_preferences', module: 'core', priority: 'low' },
    unknown: { action: 'handle_unknown', module: 'core', priority: 'low' }
  };

  constructor() {
    this.stateStore = StateStore.getInstance();
    this.modelRouter = new ModelRouter();

    // Doğal dil işleme araçlarını başlat
    this.initializeNLP();
  }

  // ANA INTENT ÇÖZÜMLEME METODU
  async parse(text: string): Promise<IntentResult> {
    console.log(`🎯 Intent parsing: "${text}"`);

    try {
      // 1. Dil tespiti
      const language = await this.detectLanguage(text);

      // 2. Metni ön işleme
      const processedText = this.preprocessText(text, language);

      // 3. Çoklu yöntemle intent analizi
      const analysisResults = await Promise.all([
        this.ruleBasedAnalysis(processedText, language),
        this.keywordBasedAnalysis(processedText, language),
        this.machineLearningAnalysis(processedText, language),
        this.aiBasedAnalysis(processedText, language)
      ]);

      // 4. En yüksek güven skorunu seç
      const bestMatch = this.selectBestIntent(analysisResults);

      // 5. Parametre çıkarımı
      const parameters = await this.extractParameters(text, bestMatch.intent, language);

      // 6. Aciliyet seviyesi belirle
      const urgency = this.determineUrgency(text, bestMatch.intent);

      // 7. Eylemi belirle
      const action = this.determineAction(bestMatch.intent, parameters);

      // 8. WhatsApp onayı gerekip gerekmediğini belirle
      const requiresApproval = this.requiresApproval(bestMatch.intent, parameters);

      // 9. Sesli yanıt hazırla
      const voiceResponse = await this.generateVoiceResponse(bestMatch.intent, parameters, language);

      // 10. Sonucu oluştur
      const result: IntentResult = {
        originalText: text,
        processedText,
        language,
        intent: bestMatch.intent,
        confidence: bestMatch.confidence,
        parameters,
        urgency,
        action,
        requiresApproval,
        suggestedResponse: voiceResponse,
        timestamp: new Date(),
        analysisMethod: bestMatch.method,
        alternatives: analysisResults
          .filter(r => r.intent !== bestMatch.intent && r.confidence > 0.3)
          .map(r => ({ intent: r.intent, confidence: r.confidence }))
      };

      // 11. Intent'i logla (öğrenme için)
      await this.logIntent(result);

      // 12. Eğer güven çok düşükse WhatsApp'tan onay iste
      if (bestMatch.confidence < 0.4 && !requiresApproval) {
        result.requiresConfirmation = true;
        result.confirmationMessage = await this.generateConfirmationMessage(text, result);
      }

      console.log(`✅ Intent parsed: ${result.intent} (${result.confidence.toFixed(2)})`);

      return result;

    } catch (error) {
      console.error('Intent parsing error:', error);

      // Fallback intent
      return {
        originalText: text,
        processedText: text,
        language: 'unknown',
        intent: 'unknown',
        confidence: 0,
        parameters: {},
        urgency: 'low',
        action: { action: 'ask_clarification', module: 'core', priority: 'low' },
        requiresApproval: false,
        suggestedResponse: 'Anlayamadım, lütfen tekrar söyler misiniz?',
        timestamp: new Date(),
        analysisMethod: 'error',
        error: error.message
      };
    }
  }

  // DİL TESPİTİ
  private async detectLanguage(text: string): Promise<'turkish' | 'english' | 'mixed' | 'unknown'> {
    if (!text || text.trim().length < 2) return 'unknown';

    const cleanText = text.toLowerCase().trim();

    // Türkçe karakter kontrolü
    const turkishChars = /[çğıöşüÇĞİÖŞÜ]/;
    const hasTurkishChars = turkishChars.test(cleanText);

    // Yaygın Türkçe kelimeler
    const turkishWords = ['merhaba', 'selam', 'nasılsın', 'teşekkür', 'lütfen', 'evet', 'hayır'];
    const hasTurkishWords = turkishWords.some(word => cleanText.includes(word));

    // Yaygın İngilizce kelimeler
    const englishWords = ['hello', 'hi', 'how are you', 'thanks', 'please', 'yes', 'no'];
    const hasEnglishWords = englishWords.some(word => cleanText.includes(word));

    // Franc kütüphanesi ile dil tespiti
    try {
      const langCode = franc(cleanText, { minLength: 3 });

      if (langCode === 'tur') return 'turkish';
      if (langCode === 'eng') return 'english';

      // Karışık dil
      if ((hasTurkishChars || hasTurkishWords) && hasEnglishWords) {
        return 'mixed';
      }

      if (hasTurkishChars || hasTurkishWords) return 'turkish';
      if (hasEnglishWords) return 'english';

      return 'unknown';

    } catch {
      // Fallback
      if (hasTurkishChars || hasTurkishWords) return 'turkish';
      if (hasEnglishWords) return 'english';
      return 'unknown';
    }
  }

  // METİN ÖN İŞLEME
  private preprocessText(text: string, language: string): string {
    let processed = text.toLowerCase().trim();

    // Noktalama işaretlerini kaldır (bazı durumlarda koruyabiliriz)
    processed = processed.replace(/[.,!?;:]/g, ' ');

    // Fazla boşlukları temizle
    processed = processed.replace(/\s+/g, ' ').trim();

    // Dil bazlı normalizasyon
    if (language === 'turkish') {
      // Türkçe karakter normalizasyonu
      processed = processed
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
    }

    // Sayıları ve özel karakterleri işle
    processed = this.normalizeNumbersAndSymbols(processed);

    return processed;
  }

  // KURAL TABANLI ANALİZ
  private async ruleBasedAnalysis(text: string, language: string): Promise<IntentAnalysis> {
    const patterns = this.intentPatterns[language] || this.intentPatterns.english;

    const scores: Record<string, number> = {};
    const wordCount = text.split(' ').length;

    // Her intent kategorisi için skor hesapla
    for (const [intent, keywords] of Object.entries(patterns)) {
      let score = 0;
      let matchedKeywords = 0;

      for (const keyword of (keywords as string[])) {
        // Tam eşleşme
        if (text.includes(keyword)) {
          score += 2;
          matchedKeywords++;
        }
        // Bölünmüş kelime eşleşmesi
        else if (keyword.includes(' ')) {
          const parts = keyword.split(' ');
          if (parts.every(part => text.includes(part))) {
            score += 1.5;
            matchedKeywords++;
          }
        }
        // Benzerlik (Levenshtein distance)
        else {
          const words = text.split(' ');
          for (const word of words) {
            if (word.length >= 3) {
              const distance = natural.LevenshteinDistance(keyword, word, { search: true });
              if (distance < 2) { // 1 karakter fark
                score += 1;
                matchedKeywords++;
                break;
              }
            }
          }
        }
      }

      // Skoru normalize et
      if (matchedKeywords > 0) {
        scores[intent] = Math.min(score / (wordCount * 1.5), 1);
      }
    }

    // En yüksek skoru bul
    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intent, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return {
      intent: bestIntent,
      confidence: bestScore,
      method: 'rule_based',
      details: { scores }
    };
  }

  // ANAHTAR KELİME TABANLI ANALİZ
  private async keywordBasedAnalysis(text: string, language: string): Promise<IntentAnalysis> {
    const words = text.split(' ');
    const scores: Record<string, number> = {};

    // Anahtar kelime ağırlıkları
    const keywordWeights: Record<string, number> = {
      // Finansal - yüksek öncelikli
      'kripto': 2, 'bitcoin': 2, 'ethereum': 2, 'alım': 1.5, 'satım': 1.5, 'trade': 1.5,
      'borsa': 1.5, 'yatırım': 1.5, 'para': 1, 'dolar': 1, 'euro': 1,

      // Acil durum - çok yüksek öncelik
      'acil': 3, 'dur': 3, 'yardım': 2.5, 'tehlike': 2.5, 'sorun': 2,
      'hata': 2, 'kritik': 2.5, 'yetki': 2, 'izin': 2,

      // Web geliştirme
      'web': 1.5, 'site': 1.5, 'tasarım': 1, 'kod': 1, 'seo': 1.5,
      'optimizasyon': 1.5, 'domain': 1, 'hosting': 1,

      // Sosyal medya
      'instagram': 1.5, 'twitter': 1.5, 'facebook': 1.5, 'gönderi': 1,
      'post': 1, 'paylaşım': 1, 'takipçi': 1,

      // Sistem kontrol
      'başlat': 1.5, 'durdur': 1.5, 'kapat': 1.5, 'güncelle': 1,
      'yükle': 1, 'kur': 1, 'ayar': 1,

      // Öğrenme
      'öğren': 1.5, 'eğit': 1, 'geliştir': 1, 'yeni': 1, 'beceri': 1
    };

    // Her kelime için skor hesapla
    for (const word of words) {
      if (word.length < 2) continue;

      for (const [keyword, weight] of Object.entries(keywordWeights)) {
        if (word.includes(keyword) || keyword.includes(word)) {
          // Intent kategorisini belirle
          let intent = 'unknown';

          if (['kripto', 'bitcoin', 'ethereum', 'alım', 'satım', 'trade', 'borsa', 'yatırım', 'para'].includes(keyword)) {
            intent = 'financial';
          } else if (['acil', 'dur', 'yardım', 'tehlike', 'sorun', 'hata', 'kritik'].includes(keyword)) {
            intent = 'emergency';
          } else if (['web', 'site', 'tasarım', 'kod', 'seo', 'optimizasyon'].includes(keyword)) {
            intent = 'web_development';
          } else if (['instagram', 'twitter', 'facebook', 'gönderi', 'post', 'paylaşım'].includes(keyword)) {
            intent = 'social_media';
          } else if (['başlat', 'durdur', 'kapat', 'güncelle', 'yükle', 'kur'].includes(keyword)) {
            intent = 'system_control';
          } else if (['öğren', 'eğit', 'geliştir', 'yeni', 'beceri'].includes(keyword)) {
            intent = 'learning';
          }

          if (intent !== 'unknown') {
            scores[intent] = (scores[intent] || 0) + weight;
          }
        }
      }
    }

    // En yüksek skorlu intent'i bul
    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intent, score] of Object.entries(scores)) {
      const normalizedScore = Math.min(score / 5, 1); // 5 maksimum skor
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestIntent = intent;
      }
    }

    return {
      intent: bestIntent,
      confidence: bestScore,
      method: 'keyword_based',
      details: { scores }
    };
  }

  // MAKİNE ÖĞRENMESİ ANALİZİ (TensorFlow.js ile)
  private async machineLearningAnalysis(text: string, language: string): Promise<IntentAnalysis> {
    // Model not guaranteed to be loaded in this environment
    return {
      intent: 'unknown',
      confidence: 0,
      method: 'ml_fallback',
      details: { reason: 'TF model disabled' }
    };
  }



  // AI TABANLI ANALİZ (GPT ile)
  private async aiBasedAnalysis(text: string, language: string): Promise<IntentAnalysis> {
    try {
      const prompt = `
        Analyze the user's intent from this message: "${text}"
        
        Language: ${language}
        
        Return JSON with:
        {
          "intent": "greeting|financial|web_development|social_media|system_control|emergency|learning|personal|unknown",
          "confidence": 0.0-1.0,
          "reasoning": "brief explanation",
          "urgency": "low|medium|high|critical",
          "requires_human_approval": boolean
        }
        
        Consider context:
        - User is talking to an AI personal assistant named Optimus
        - Assistant can: trade crypto, build websites, manage social media, self-improve
        - Turkish/English mixed messages are possible
        - Some commands might be urgent (stop, emergency, help)
      `;

      const response = await this.modelRouter.query(
        'intent_analysis',
        prompt,
        {
          model: 'gpt-4-turbo'
        }
      );

      let parsedResponse;
      try {
        // JSON'ı çıkar (GPT bazen markdown içinde gönderir)
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(response.content);
        }
      } catch {
        // Fallback parsing
        parsedResponse = {
          intent: 'unknown',
          confidence: 0,
          reasoning: 'JSON parse failed',
          urgency: 'low',
          requires_human_approval: false
        };
      }

      return {
        intent: parsedResponse.intent || 'unknown',
        confidence: parsedResponse.confidence || 0,
        method: 'ai_gpt',
        details: parsedResponse
      };

    } catch (error) {
      console.warn('AI analysis failed:', error.message);

      return {
        intent: 'unknown',
        confidence: 0,
        method: 'ai_fallback',
        details: { error: error.message }
      };
    }
  }

  // EN İYİ INTENT'İ SEÇ
  private selectBestIntent(analyses: IntentAnalysis[]): IntentAnalysis {
    // Güven skoruna göre sırala
    const sorted = analyses
      .filter(a => a.intent !== 'unknown' && a.confidence > 0.1)
      .sort((a, b) => b.confidence - a.confidence);

    if (sorted.length === 0) {
      return {
        intent: 'unknown',
        confidence: 0,
        method: 'fallback',
        details: { reason: 'no confident intent found' }
      };
    }

    // Eğer AI analizi yüksek güvenle emergency diyorsa, öncelik ver
    const emergencyAnalysis = analyses.find(a =>
      a.intent === 'emergency' &&
      a.confidence > 0.7 &&
      a.method === 'ai_gpt'
    );

    if (emergencyAnalysis) {
      return emergencyAnalysis;
    }

    // Ağırlıklı ortalama (method'lara göre farklı ağırlıklar)
    const weightedScores: Record<string, { total: number, count: number }> = {};

    for (const analysis of analyses) {
      if (analysis.intent === 'unknown') continue;

      const weight = this.getMethodWeight(analysis.method);
      const weightedScore = analysis.confidence * weight;

      if (!weightedScores[analysis.intent]) {
        weightedScores[analysis.intent] = { total: 0, count: 0 };
      }

      weightedScores[analysis.intent].total += weightedScore;
      weightedScores[analysis.intent].count++;
    }

    // Ortalama skorları hesapla
    let bestIntent = 'unknown';
    let bestAverage = 0;

    for (const [intent, scores] of Object.entries(weightedScores)) {
      const average = scores.total / scores.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestIntent = intent;
      }
    }

    // En iyi analizi bul
    const bestAnalysis = sorted.find(a => a.intent === bestIntent) || sorted[0];

    return {
      ...bestAnalysis,
      confidence: Math.min(bestAverage, 1) // Normalize
    };
  }

  // PARAMETRE ÇIKARIMI
  private async extractParameters(text: string, intent: string, language: string): Promise<IntentParameters> {
    const params: IntentParameters = {};

    // NLP ile entity recognition
    const doc = compromise(text);

    // Sayıları çıkar
    const numbers = doc.numbers().out('array');
    if (numbers.length > 0) {
      params.amount = parseFloat(numbers[0]);
    }

    // Para birimleri
    const currencies = doc.match('#Currency').out('array');
    if (currencies.length > 0) {
      params.currency = currencies[0];
    }

    // Zaman ifadeleri
    const dates = (doc as any).dates().out('array');
    if (dates.length > 0) {
      params.date = dates[0];
    }

    // Intent'e özel parametre çıkarımı
    switch (intent) {
      case 'financial':
        // Kripto sembolleri
        const cryptoMatch = text.match(/(BTC|ETH|XRP|ADA|SOL|DOT|BNB|USDT)/i);
        if (cryptoMatch) {
          params.crypto = cryptoMatch[0].toUpperCase();
        }

        // Alım/satım
        if (text.includes('al') || text.includes('buy') || text.includes('satın al')) {
          params.action = 'buy';
        } else if (text.includes('sat') || text.includes('sell')) {
          params.action = 'sell';
        }

        // Miktar
        const amountMatch = text.match(/(\d+)\s*(dolar|dolarlık|usd|tl|lira|btc|eth)/i);
        if (amountMatch) {
          params.amount = parseFloat(amountMatch[1]);
          params.currency = amountMatch[2].toLowerCase();
        }
        break;

      case 'web_development':
        // Site adı
        const siteMatch = text.match(/(?:site|website|web)\s+(?:yap|oluştur|geliştir)\s+(?:ad[ıi]|ismi)?\s*["']?([^"'\s]+)["']?/i);
        if (siteMatch) {
          params.siteName = siteMatch[1];
        }

        // Teknoloji stack
        const techMatch = text.match(/(react|nextjs|vue|angular|node|typescript|javascript)/i);
        if (techMatch) {
          params.technology = techMatch[0].toLowerCase();
        }
        break;

      case 'social_media':
        // Platform
        const platforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'youtube'];
        for (const platform of platforms) {
          if (text.includes(platform)) {
            params.platform = platform;
            break;
          }
        }

        // İçerik tipi
        if (text.includes('gönderi') || text.includes('post')) {
          params.contentType = 'post';
        } else if (text.includes('hikaye') || text.includes('story')) {
          params.contentType = 'story';
        } else if (text.includes('reels') || text.includes('video')) {
          params.contentType = 'video';
        }
        break;

      case 'emergency':
        // Aciliyet seviyesi
        if (text.includes('acil') || text.includes('hemen') || text.includes('şimdi')) {
          params.immediate = true;
        }

        // Durma süresi
        const stopMatch = text.match(/(\d+)\s*(dakika|saat|gün)\s*dur/i);
        if (stopMatch) {
          params.duration = {
            value: parseInt(stopMatch[1]),
            unit: stopMatch[2]
          };
        }
        break;
    }

    // AI ile ek parametre çıkarımı
    const aiParams = await this.extractParametersWithAI(text, intent);
    return { ...params, ...aiParams };
  }

  // AI İLE PARAMETRE ÇIKARIMI
  private async extractParametersWithAI(text: string, intent: string): Promise<IntentParameters> {
    try {
      const prompt = `
        Extract parameters from this user message for intent: ${intent}
        
        Message: "${text}"
        
        Extract ALL parameters you can find including:
        - Amounts, numbers, quantities
        - Dates, times, durations
        - Names, titles, labels
        - URLs, emails, phone numbers
        - Specific instructions
        - Preferences, options
        
        Return as JSON object.
      `;

      const response = await this.modelRouter.query(
        'parameter_extraction',
        prompt,
        {
          model: 'gpt-4-turbo'
        }
      );

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // JSON parse hatası
      }

      return {};

    } catch (error) {
      console.warn('AI parameter extraction failed:', error.message);
      return {};
    }
  }

  // ACİLİYET SEVİYESİ BELİRLEME
  private determineUrgency(text: string, intent: string): 'low' | 'medium' | 'high' | 'critical' {
    // Intent bazlı aciliyet
    const intentUrgency: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      emergency: 'critical',
      financial: 'medium',
      system_control: 'high',
      web_development: 'medium',
      social_media: 'low',
      greeting: 'low',
      learning: 'low',
      personal: 'low',
      unknown: 'low'
    };

    let urgency = intentUrgency[intent] || 'low';

    // Metin içindeki aciliyet göstergeleri
    const urgencyIndicators = {
      critical: ['acil', 'hemen', 'şimdi', 'derhal', 'hayati', 'tehlike', 'yangın'],
      high: ['hızlı', 'çabuk', 'acele', 'önemli', 'kritik', 'acil'],
      medium: ['bugün', 'yarın', 'hızlıca', 'öncelikli']
    };

    const lowerText = text.toLowerCase();

    for (const [level, indicators] of Object.entries(urgencyIndicators)) {
      for (const indicator of indicators) {
        if (lowerText.includes(indicator)) {
          // Aciliyeti yükselt (ama düşürme)
          const levelOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          const currentLevel = levelOrder[urgency];
          const newLevel = levelOrder[level as keyof typeof levelOrder];

          if (newLevel > currentLevel) {
            urgency = level as any;
          }
          break;
        }
      }
    }

    return urgency;
  }

  // EYLEM BELİRLEME
  private determineAction(intent: string, parameters: IntentParameters): Action {
    const baseAction = this.actionMapping[intent] || this.actionMapping.unknown;

    // Parametrelere göre eylemi özelleştir
    const action: Action = {
      ...baseAction,
      parameters: { ...parameters }
    };

    // Özel durumlar
    if (intent === 'financial' && parameters.crypto) {
      action.subAction = `trade_${parameters.crypto.toLowerCase()}`;

      if (parameters.action === 'buy') {
        action.description = `${parameters.amount || ''} ${parameters.crypto} alımı`;
      } else if (parameters.action === 'sell') {
        action.description = `${parameters.amount || ''} ${parameters.crypto} satışı`;
      }
    }

    if (intent === 'web_development' && parameters.siteName) {
      action.subAction = 'create_website';
      action.description = `${parameters.siteName} sitesi oluşturma`;
    }

    if (intent === 'social_media' && parameters.platform) {
      action.subAction = `post_to_${parameters.platform}`;
      action.description = `${parameters.platform}'a içerik paylaşma`;
    }

    if (intent === 'emergency') {
      action.requiresImmediateAttention = true;
      action.overridePriority = 'critical';

      if (parameters.immediate) {
        action.timeout = 30000; // 30 saniye
      }
    }

    return action;
  }

  // ONAY GEREKLİLİĞİ
  private requiresApproval(intent: string, parameters: IntentParameters): boolean {
    // Onay gerektiren intent'ler
    const approvalRequiredIntents = ['financial', 'emergency', 'system_control'];

    if (!approvalRequiredIntents.includes(intent)) {
      return false;
    }

    // Finansal işlemlerde büyük miktarlar için onay
    if (intent === 'financial') {
      const amount = parameters.amount || 0;
      if (amount > 1000) { // 1000 USD'den fazla
        return true;
      }
    }

    // Acil durumda sistem durdurma için onay
    if (intent === 'emergency' && parameters.immediate) {
      return true;
    }

    // Sistem kontrolünde kritik işlemler için onay
    if (intent === 'system_control') {
      const criticalActions = ['shutdown', 'restart', 'update', 'install'];
      if (criticalActions.some(action =>
        parameters.action?.toLowerCase().includes(action)
      )) {
        return true;
      }
    }

    return false;
  }

  // SESLİ YANIT HAZIRLAMA
  private async generateVoiceResponse(intent: string, parameters: IntentParameters, language: string): Promise<string> {
    const responses = {
      turkish: {
        greeting: 'Merhaba! Size nasıl yardımcı olabilirim?',
        financial: `Kripto işleminiz işleniyor: ${parameters.amount ? parameters.amount + ' ' : ''}${parameters.crypto || 'kripto para'} ${parameters.action === 'buy' ? 'alımı' : 'satışı'}`,
        web_development: `Web sitesi geliştirme başlatılıyor: ${parameters.siteName || 'yeni site'}`,
        social_media: `Sosyal medya gönderiniz hazırlanıyor: ${parameters.platform || 'platform'} için ${parameters.contentType || 'içerik'}`,
        system_control: 'Sistem kontrolü uygulanıyor...',
        emergency: 'Acil durum işleniyor!',
        learning: 'Yeni beceri öğrenmeye başlıyorum...',
        personal: 'Kişisel ayarlarınız güncelleniyor.',
        unknown: 'Anlayamadım, lütfen tekrar söyler misiniz?'
      },
      english: {
        greeting: 'Hello! How can I help you?',
        financial: `Processing crypto transaction: ${parameters.amount ? parameters.amount + ' ' : ''}${parameters.crypto || 'crypto'} ${parameters.action === 'buy' ? 'purchase' : 'sale'}`,
        web_development: `Starting website development: ${parameters.siteName || 'new site'}`,
        social_media: `Preparing your social media post: ${parameters.contentType || 'content'} for ${parameters.platform || 'platform'}`,
        system_control: 'Applying system control...',
        emergency: 'Processing emergency!',
        learning: 'Starting to learn new skill...',
        personal: 'Updating your personal settings.',
        unknown: "I didn't understand, could you please repeat?"
      }
    };

    const langResponses = responses[language] || responses.english;
    return langResponses[intent] || langResponses.unknown;
  }

  // ONAY MESAJI HAZIRLAMA
  private async generateConfirmationMessage(originalText: string, intentResult: IntentResult): Promise<string> {
    const language = intentResult.language === 'turkish' ? 'turkish' : 'english';

    const messages = {
      turkish: `"${originalText}"\n\nBunu şu şekilde anladım:\nNiyet: ${intentResult.intent}\nGüven: %${(intentResult.confidence * 100).toFixed(0)}\n\nOnaylıyor musunuz? (Evet/Hayır)`,
      english: `"${originalText}"\n\nI understood this as:\nIntent: ${intentResult.intent}\nConfidence: ${(intentResult.confidence * 100).toFixed(0)}%\n\nDo you confirm? (Yes/No)`
    };

    return messages[language];
  }

  // INTENT LOGLAMA (Öğrenme için)
  private async logIntent(result: IntentResult): Promise<void> {
    await this.stateStore.storeIntent({
      text: result.originalText,
      intent: result.intent,
      confidence: result.confidence,
      language: result.language,
      parameters: result.parameters,
      timestamp: new Date(),
      wasCorrect: null // Kullanıcı onayı sonrası doldurulacak
    });
  }

  // YARDIMCI METODLAR
  private normalizeNumbersAndSymbols(text: string): string {
    return text
      .replace(/\$(\d+)/g, '$1 dolar')
      .replace(/€(\d+)/g, '$1 euro')
      .replace(/₺(\d+)/g, '$1 lira')
      .replace(/btc/gi, 'bitcoin')
      .replace(/eth/gi, 'ethereum')
      .replace(/usdt/gi, 'tether')
      .replace(/\d+k\b/gi, match => (parseInt(match) * 1000).toString())
      .replace(/\d+m\b/gi, match => (parseInt(match) * 1000000).toString());
  }

  private getMethodWeight(method: string): number {
    const weights: Record<string, number> = {
      'ai_gpt': 1.2,
      'machine_learning': 1.0,
      'rule_based': 0.8,
      'keyword_based': 0.7,
      'simple_neural': 0.6,
      'ai_fallback': 0.5,
      'ml_fallback': 0.4,
      'fallback': 0.3
    };

    return weights[method] || 0.5;
  }

  private simpleNeuralNetwork(text: string): { intent: string, confidence: number } {
    // Basit bir sinir ağı simulasyonu
    const words = text.toLowerCase().split(' ');

    // Ağırlık matrisi (intent x keyword)
    const weights: Record<string, Record<string, number>> = {
      financial: { 'kripto': 0.8, 'bitcoin': 0.9, 'alım': 0.7, 'satım': 0.7 },
      web_development: { 'web': 0.8, 'site': 0.7, 'tasarım': 0.6 },
      social_media: { 'instagram': 0.9, 'gönderi': 0.7, 'post': 0.7 }
    };

    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intent, keywordWeights] of Object.entries(weights)) {
      let score = 0;

      for (const word of words) {
        for (const [keyword, weight] of Object.entries(keywordWeights)) {
          if (word.includes(keyword) || keyword.includes(word)) {
            score += weight;
            break;
          }
        }
      }

      // Aktivasyon fonksiyonu (sigmoid benzeri)
      const activatedScore = 1 / (1 + Math.exp(-score));

      if (activatedScore > bestScore) {
        bestScore = activatedScore;
        bestIntent = intent;
      }
    }

    return { intent: bestIntent, confidence: bestScore };
  }

  private initializeNLP(): void {
    // Doğal dil işleme araçlarını başlat
    try {
      // TensorFlow.js modelini yükle
      this.loadTensorFlowModel();

      console.log('✅ NLP tools initialized');
    } catch (error) {
      console.warn('NLP initialization failed:', error.message);
    }
  }

  private async loadTensorFlowModel(): Promise<void> {
    // TensorFlow modelini yükle (eğer varsa)
    // Bu kısım gerçek model yükleme için
    try {
      // Örnek: Kendi eğittiğiniz modeli yükleyin
      // this.tfNLP = await TensorFlowNLP.load('path/to/model');

      console.log('⚠️ TensorFlow model not loaded (using fallback)');
    } catch (error) {
      console.warn('TensorFlow model loading failed:', error.message);
    }
  }
}

// TYPES
interface IntentResult {
  originalText: string;
  processedText: string;
  language: string;
  intent: string;
  confidence: number;
  parameters: IntentParameters;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  action: Action;
  requiresApproval: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  suggestedResponse: string;
  timestamp: Date;
  analysisMethod: string;
  alternatives?: Array<{ intent: string; confidence: number }>;
  error?: string;
}

interface IntentParameters {
  [key: string]: any;
  amount?: number;
  currency?: string;
  crypto?: string;
  action?: 'buy' | 'sell';
  siteName?: string;
  technology?: string;
  platform?: string;
  contentType?: string;
  immediate?: boolean;
  duration?: { value: number; unit: string };
}

interface Action {
  action: string;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parameters?: IntentParameters;
  subAction?: string;
  description?: string;
  requiresImmediateAttention?: boolean;
  overridePriority?: string;
  timeout?: number;
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  method: string;
  details: any;
}

// ToolRegistry'ye ekle
export const IntentParserTool = {
  name: 'intent_parser',
  description: 'Parse user intent from text messages',
  execute: async (text: string) => {
    const parser = new IntentParser();
    return await parser.parse(text);
  }
};
