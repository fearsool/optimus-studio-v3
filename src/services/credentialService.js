"use strict";
/**
 * CREDENTIAL VAULT SERVICE V4.0
 * ==============================
 * REAL ENCRYPTION with Web Crypto API
 * - AES-256-GCM (authenticated encryption)
 * - Random IV per encryption
 * - Supabase storage with fallback to localStorage
 * - Server-side only decrypt ready
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialService = exports.KNOWN_PROVIDERS = void 0;
const supabaseService_1 = __importDefault(require("./supabaseService"));
const VAULT_PREFIX = 'omniflow_vault_v4_';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;
exports.KNOWN_PROVIDERS = [
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
    { key: 'HUGGINGFACE_TOKEN', label: 'Hugging Face Token' },
    { key: 'GROQ_API_KEY', label: 'Groq API Key' },
    { key: 'GITHUB_TOKEN', label: 'GitHub Token' },
    { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token' },
    { key: 'TELEGRAM_CHAT_ID', label: 'Telegram Chat ID' },
    { key: 'BINANCE_API_KEY', label: 'Binance API Key' },
    { key: 'BINANCE_SECRET', label: 'Binance Secret' },
    { key: 'STRIPE_API_KEY', label: 'Stripe API Key' },
    { key: 'SUPABASE_KEY', label: 'Supabase Service Key' },
    { key: 'FAL_API_KEY', label: 'Fal.ai API Key' }
];
// ============================================
// WEB CRYPTO API - AES-256-GCM ENCRYPTION
// ============================================
/**
 * Get or generate a master encryption key
 * In production, this should come from a secure environment variable
 */
async function getMasterKey() {
    const keyMaterial = await getKeyMaterial();
    const salt = getSalt();
    return crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: salt.buffer,
        iterations: 100000,
        hash: 'SHA-256'
    }, keyMaterial, { name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt', 'decrypt']);
}
/**
 * Get key material from passphrase
 */
async function getKeyMaterial() {
    // In production, use environment variable
    const passphrase = getPassphrase();
    const encoder = new TextEncoder();
    return crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
}
/**
 * Get passphrase from environment or use fallback
 */
function getPassphrase() {
    var _a;
    // Try to get from environment
    const envKey = (_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_VAULT_PASSPHRASE;
    if (envKey && envKey.length >= 16) {
        return envKey;
    }
    // Fallback: Generate device-specific key
    let deviceKey = localStorage.getItem('omniflow_device_key');
    if (!deviceKey) {
        deviceKey = crypto.randomUUID() + '-' + Date.now();
        localStorage.setItem('omniflow_device_key', deviceKey);
    }
    return deviceKey;
}
/**
 * Get or generate salt (stored in localStorage)
 */
function getSalt() {
    const storedSalt = localStorage.getItem('omniflow_vault_salt');
    if (storedSalt) {
        return new Uint8Array(JSON.parse(storedSalt));
    }
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    localStorage.setItem('omniflow_vault_salt', JSON.stringify(Array.from(salt)));
    return salt;
}
/**
 * Encrypt value using AES-256-GCM
 */
async function encryptValue(value) {
    try {
        const key = await getMasterKey();
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const encoder = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoder.encode(value));
        // Combine IV + encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        // Return as base64
        return btoa(String.fromCharCode(...combined));
    }
    catch (error) {
        console.error('[Vault V4] Encryption failed:', error);
        throw new Error('Encryption failed');
    }
}
/**
 * Decrypt value using AES-256-GCM
 */
async function decryptValue(encrypted) {
    try {
        const key = await getMasterKey();
        // Decode base64
        const combined = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
        // Extract IV and ciphertext
        const iv = combined.slice(0, IV_LENGTH);
        const ciphertext = combined.slice(IV_LENGTH);
        const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
        return new TextDecoder().decode(decrypted);
    }
    catch (error) {
        console.error('[Vault V4] Decryption failed:', error);
        return '';
    }
}
/**
 * Mask a value for display
 */
function maskValue(value) {
    if (!value || value.length < 8)
        return '****';
    return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}
// ============================================
// SUPABASE STORAGE (Primary)
// ============================================
async function isSupabaseAvailable() {
    try {
        const client = supabaseService_1.default.initSupabase();
        return client !== null;
    }
    catch (_a) {
        return false;
    }
}
// ============================================
// MAIN CREDENTIAL SERVICE
// ============================================
class CredentialService {
    /**
     * Save a credential (Supabase-first, localStorage fallback)
     */
    async saveKey(provider, value, displayName) {
        const encrypted = await encryptValue(value);
        const name = displayName || provider;
        // Try Supabase first
        if (await isSupabaseAvailable()) {
            try {
                const client = supabaseService_1.default.initSupabase();
                await (client === null || client === void 0 ? void 0 : client.from('credentials').upsert({
                    provider,
                    name,
                    encrypted_value: encrypted,
                    created_at: new Date().toISOString()
                }, { onConflict: 'provider' }));
                console.log(`[Vault V4] Saved to Supabase (AES-256-GCM): ${provider}`);
                return true;
            }
            catch (error) {
                console.warn('[Vault V4] Supabase save failed, using localStorage:', error);
            }
        }
        // Fallback to localStorage
        const key = VAULT_PREFIX + provider;
        localStorage.setItem(key, JSON.stringify({
            encrypted,
            name,
            provider,
            createdAt: Date.now()
        }));
        console.log(`[Vault V4] Saved to localStorage (AES-256-GCM): ${provider}`);
        return true;
    }
    /**
     * Get a credential value (decrypted)
     */
    async getKey(provider) {
        // Try Supabase first
        if (await isSupabaseAvailable()) {
            try {
                const client = supabaseService_1.default.initSupabase();
                const { data } = await (client === null || client === void 0 ? void 0 : client.from('credentials').select('encrypted_value').eq('provider', provider).maybeSingle()) || { data: null };
                if (data === null || data === void 0 ? void 0 : data.encrypted_value) {
                    return await decryptValue(data.encrypted_value);
                }
            }
            catch (error) {
                console.warn('[Vault V4] Supabase read failed:', error);
            }
        }
        // Fallback to localStorage
        const key = VAULT_PREFIX + provider;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return await decryptValue(parsed.encrypted);
            }
            catch (_a) {
                return null;
            }
        }
        // Legacy fallback (V3 format)
        return this.getLegacyKey(provider);
    }
    /**
     * Legacy key retrieval (for migration)
     */
    getLegacyKey(provider) {
        const legacyKey = 'omniflow_vault_' + provider;
        const stored = localStorage.getItem(legacyKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // V3 format was XOR+Base64
                return this.decryptLegacy(parsed.encrypted);
            }
            catch (_a) {
                return null;
            }
        }
        return null;
    }
    /**
     * Decrypt V3 format (for migration)
     */
    decryptLegacy(encrypted) {
        try {
            const legacyKey = 'omniflow_v3_secure';
            const decoded = atob(encrypted);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ legacyKey.charCodeAt(i % legacyKey.length));
            }
            return atob(result);
        }
        catch (_a) {
            return '';
        }
    }
    /**
     * List all credentials (masked values)
     */
    async listCredentials() {
        const credentials = [];
        // Try Supabase first
        if (await isSupabaseAvailable()) {
            try {
                const client = supabaseService_1.default.initSupabase();
                const { data } = await (client === null || client === void 0 ? void 0 : client.from('credentials').select('provider, name, encrypted_value, created_at').order('created_at', { ascending: false })) || { data: null };
                if (data && data.length > 0) {
                    for (const row of data) {
                        const decrypted = await decryptValue(row.encrypted_value);
                        credentials.push({
                            id: row.provider,
                            provider: row.provider,
                            name: row.name,
                            maskedValue: maskValue(decrypted),
                            createdAt: new Date(row.created_at).getTime()
                        });
                    }
                    return credentials;
                }
            }
            catch (error) {
                console.warn('[Vault V4] Supabase list failed:', error);
            }
        }
        // Fallback to localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === null || key === void 0 ? void 0 : key.startsWith(VAULT_PREFIX)) {
                try {
                    const stored = JSON.parse(localStorage.getItem(key) || '');
                    const decrypted = await decryptValue(stored.encrypted);
                    credentials.push({
                        id: stored.provider,
                        provider: stored.provider,
                        name: stored.name,
                        maskedValue: maskValue(decrypted),
                        createdAt: stored.createdAt
                    });
                }
                catch (_a) {
                    // Skip invalid entries
                }
            }
        }
        return credentials;
    }
    /**
     * Delete a credential
     */
    async deleteKey(provider) {
        // Try Supabase first
        if (await isSupabaseAvailable()) {
            try {
                const client = supabaseService_1.default.initSupabase();
                await (client === null || client === void 0 ? void 0 : client.from('credentials').delete().eq('provider', provider));
                console.log(`[Vault V4] Deleted from Supabase: ${provider}`);
            }
            catch (error) {
                console.warn('[Vault V4] Supabase delete failed:', error);
            }
        }
        // Also remove from localStorage
        localStorage.removeItem(VAULT_PREFIX + provider);
        localStorage.removeItem('omniflow_vault_' + provider); // Legacy
        return true;
    }
    /**
     * Export credentials for execution (decrypted)
     * WARNING: Only call server-side or in secure context
     */
    async exportForExecution() {
        const result = {};
        for (const provider of exports.KNOWN_PROVIDERS) {
            const value = await this.getKey(provider.key);
            if (value) {
                result[provider.key] = value;
            }
        }
        return result;
    }
    /**
     * Migrate V3 credentials to V4 (AES-256-GCM)
     */
    async migrateFromV3() {
        let migrated = 0;
        for (const provider of exports.KNOWN_PROVIDERS) {
            const legacyValue = this.getLegacyKey(provider.key);
            if (legacyValue) {
                await this.saveKey(provider.key, legacyValue, provider.label);
                // Remove legacy
                localStorage.removeItem('omniflow_vault_' + provider.key);
                migrated++;
                console.log(`[Vault V4] Migrated: ${provider.key}`);
            }
        }
        return migrated;
    }
    /**
     * Check if vault is using secure encryption
     */
    isSecure() {
        return typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined';
    }
    /**
     * Get encryption info
     */
    getEncryptionInfo() {
        return {
            algorithm: 'AES-256-GCM',
            keyLength: KEY_LENGTH,
            secure: this.isSecure()
        };
    }
}
exports.credentialService = new CredentialService();
exports.default = exports.credentialService;
