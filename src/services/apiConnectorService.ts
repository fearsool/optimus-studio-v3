/**
 * API Connector Library
 * Her popüler servis için hazır bağlantı kodu üretir
 */

// API Connector tipleri
export interface APIConnector {
    name: string;
    type: 'ai' | 'social' | 'ecommerce' | 'communication' | 'finance' | 'data';
    requiredEnvVars: string[];
    pythonImports: string[];
    pythonCode: string;
    description: string;
}

// HuggingFace AI Connector
export const HUGGINGFACE_CONNECTOR: APIConnector = {
    name: 'HuggingFace',
    type: 'ai',
    requiredEnvVars: ['HUGGINGFACE_TOKEN'],
    pythonImports: ['import requests', 'import os'],
    pythonCode: `
def huggingface_generate(prompt: str, model: str = "mistralai/Mistral-7B-Instruct-v0.2") -> str:
    """HuggingFace ile metin üret"""
    API_URL = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_TOKEN')}"}
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 500,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True
        }
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get('generated_text', '').replace(prompt, '').strip()
    return ""
`,
    description: 'HuggingFace Inference API ile AI metin üretimi'
};

// Gemini AI Connector
export const GEMINI_CONNECTOR: APIConnector = {
    name: 'Gemini',
    type: 'ai',
    requiredEnvVars: ['GEMINI_API_KEY'],
    pythonImports: ['import google.generativeai as genai', 'import os'],
    pythonCode: `
def gemini_generate(prompt: str) -> str:
    """Google Gemini ile metin üret"""
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text if response.text else ""
`,
    description: 'Google Gemini API ile AI metin üretimi'
};

// Email (SMTP) Connector
export const EMAIL_CONNECTOR: APIConnector = {
    name: 'Email SMTP',
    type: 'communication',
    requiredEnvVars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'],
    pythonImports: ['import smtplib', 'from email.mime.text import MIMEText', 'from email.mime.multipart import MIMEMultipart', 'import os'],
    pythonCode: `
def send_email(to: str, subject: str, body: str) -> bool:
    """Email gönder"""
    try:
        msg = MIMEMultipart()
        msg['From'] = os.getenv('SMTP_FROM')
        msg['To'] = to
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(os.getenv('SMTP_HOST'), int(os.getenv('SMTP_PORT', 587)))
        server.starttls()
        server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASS'))
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email hatası: {e}")
        return False
`,
    description: 'SMTP ile email gönderimi'
};

// Telegram Connector
export const TELEGRAM_CONNECTOR: APIConnector = {
    name: 'Telegram',
    type: 'communication',
    requiredEnvVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    pythonImports: ['import requests', 'import os'],
    pythonCode: `
def send_telegram(message: str) -> bool:
    """Telegram mesajı gönder"""
    try:
        url = f"https://api.telegram.org/bot{os.getenv('TELEGRAM_BOT_TOKEN')}/sendMessage"
        data = {"chat_id": os.getenv('TELEGRAM_CHAT_ID'), "text": message, "parse_mode": "HTML"}
        response = requests.post(url, data=data)
        return response.status_code == 200
    except Exception as e:
        print(f"Telegram hatası: {e}")
        return False
`,
    description: 'Telegram Bot API ile mesaj gönderimi'
};

// Google Sheets Connector
export const SHEETS_CONNECTOR: APIConnector = {
    name: 'Google Sheets',
    type: 'data',
    requiredEnvVars: ['GOOGLE_SHEETS_CREDENTIALS_JSON', 'GOOGLE_SHEET_ID'],
    pythonImports: ['import gspread', 'from google.oauth2.service_account import Credentials', 'import os', 'import json'],
    pythonCode: `
def get_sheet_data(sheet_name: str = "Sheet1") -> list:
    """Google Sheets'ten veri al"""
    creds_json = json.loads(os.getenv('GOOGLE_SHEETS_CREDENTIALS_JSON'))
    creds = Credentials.from_service_account_info(creds_json, scopes=['https://www.googleapis.com/auth/spreadsheets'])
    client = gspread.authorize(creds)
    sheet = client.open_by_key(os.getenv('GOOGLE_SHEET_ID')).worksheet(sheet_name)
    return sheet.get_all_records()

def append_to_sheet(data: list, sheet_name: str = "Sheet1") -> bool:
    """Google Sheets'e veri ekle"""
    creds_json = json.loads(os.getenv('GOOGLE_SHEETS_CREDENTIALS_JSON'))
    creds = Credentials.from_service_account_info(creds_json, scopes=['https://www.googleapis.com/auth/spreadsheets'])
    client = gspread.authorize(creds)
    sheet = client.open_by_key(os.getenv('GOOGLE_SHEET_ID')).worksheet(sheet_name)
    sheet.append_row(data)
    return True
`,
    description: 'Google Sheets okuma/yazma'
};

// Binance Connector
export const BINANCE_CONNECTOR: APIConnector = {
    name: 'Binance',
    type: 'finance',
    requiredEnvVars: ['BINANCE_API_KEY', 'BINANCE_API_SECRET'],
    pythonImports: ['from binance.client import Client', 'import os'],
    pythonCode: `
def get_binance_client():
    """Binance client oluştur"""
    return Client(os.getenv('BINANCE_API_KEY'), os.getenv('BINANCE_API_SECRET'))

def get_balance(asset: str = 'USDT') -> float:
    """Binance bakiyesi al"""
    client = get_binance_client()
    balance = client.get_asset_balance(asset=asset)
    return float(balance['free']) if balance else 0.0

def get_price(symbol: str = 'BTCUSDT') -> float:
    """Güncel fiyat al"""
    client = get_binance_client()
    ticker = client.get_symbol_ticker(symbol=symbol)
    return float(ticker['price']) if ticker else 0.0
`,
    description: 'Binance API entegrasyonu'
};

// Tüm connectorları export et
export const API_CONNECTORS: Record<string, APIConnector> = {
    'huggingface': HUGGINGFACE_CONNECTOR,
    'gemini': GEMINI_CONNECTOR,
    'email': EMAIL_CONNECTOR,
    'telegram': TELEGRAM_CONNECTOR,
    'sheets': SHEETS_CONNECTOR,
    'binance': BINANCE_CONNECTOR
};

// Connector'a göre Python kodu üret
export function generateConnectorCode(connectorNames: string[]): string {
    const imports = new Set<string>();
    const functions: string[] = [];

    connectorNames.forEach(name => {
        const connector = API_CONNECTORS[name];
        if (connector) {
            connector.pythonImports.forEach(imp => imports.add(imp));
            functions.push(connector.pythonCode);
        }
    });

    return `# Auto-generated API Connectors
${Array.from(imports).join('\\n')}
from dotenv import load_dotenv
load_dotenv()

${functions.join('\\n')}
`;
}
