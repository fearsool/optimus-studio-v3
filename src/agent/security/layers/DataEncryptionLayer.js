"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataEncryptionLayer = void 0;
const fs = __importStar(require("fs/promises"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const path = __importStar(require("path"));
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
class DataEncryptionLayer {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.saltLength = 32;
    }
    // Anahtar türetme (password-based)
    async deriveKey(password, salt) {
        return (await scryptAsync(password, salt, this.keyLength));
    }
    // Dosya şifreleme
    async encryptFile(inputPath, outputPath, password) {
        try {
            // Dosyayı oku
            const data = await fs.readFile(inputPath);
            // Salt ve IV oluştur
            const salt = (0, crypto_1.randomBytes)(this.saltLength);
            const iv = (0, crypto_1.randomBytes)(this.ivLength);
            // Anahtar türet
            const key = await this.deriveKey(password, salt);
            // Şifrele
            const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
            const encrypted = Buffer.concat([
                cipher.update(data),
                cipher.final()
            ]);
            const authTag = cipher.getAuthTag();
            // Meta verileri ekle
            const encryptedWithMetadata = Buffer.concat([
                salt, // 32 bytes
                iv, // 16 bytes
                authTag, // 16 bytes
                encrypted // şifrelenmiş veri
            ]);
            // Çıktı dosyasına yaz
            await fs.writeFile(outputPath, encryptedWithMetadata);
            return {
                success: true,
                originalSize: data.length,
                encryptedSize: encryptedWithMetadata.length,
                algorithm: this.algorithm,
                metadata: { salt: salt.toString('hex'), iv: iv.toString('hex') }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Çoklu anahtar şifreleme
    async encryptWithMultipleKeys(data, keys) {
        let encrypted = data;
        const layers = [];
        for (let i = 0; i < keys.length; i++) {
            const salt = (0, crypto_1.randomBytes)(this.saltLength);
            const iv = (0, crypto_1.randomBytes)(this.ivLength);
            const key = await this.deriveKey(keys[i], salt);
            const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
            encrypted = Buffer.concat([
                cipher.update(encrypted),
                cipher.final()
            ]);
            const authTag = cipher.getAuthTag();
            layers.push({
                layer: i + 1,
                algorithm: this.algorithm,
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            });
            // Her katmanın çıktısını birleştir
            encrypted = Buffer.concat([
                salt,
                iv,
                authTag,
                encrypted
            ]);
        }
        return {
            data: encrypted,
            layers,
            totalLayers: keys.length,
            encryptedAt: new Date()
        };
    }
    // Bellek şifreleme (in-memory)
    encryptInMemory(data, key) {
        const iv = (0, crypto_1.randomBytes)(this.ivLength);
        const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(data, 'utf8'),
            cipher.final()
        ]);
        const authTag = cipher.getAuthTag();
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex'),
            authTag: authTag.toString('hex'),
            timestamp: Date.now()
        };
    }
    // Disk üzerinde şifrelenmiş anahtar yönetimi
    async saveEncryptedKey(keyName, keyData, password) {
        const keysDir = path.join(process.cwd(), '.secure-keys');
        await fs.mkdir(keysDir, { recursive: true });
        const filePath = path.join(keysDir, `${keyName}.enc`);
        const result = await this.encryptFile(filePath, filePath + '.enc', // temporary path, then move? logic seems slightly off in prompt code, but assuming inputPath is content source. Actually logic expects `encryptFile` to read from disk.
        // Wait, prompt code tries to encrypt 'filePath' to 'filePath.enc'. But filePath doesn't exist yet?
        // Ah, prompt code likely assumes we write the buffer to a temp file first or `encryptFile` logic needs adjustment. 
        // I will write keyData to temp file first.
        password);
        // FIX: Write keyData to file first so encryptFile can read it
        await fs.writeFile(filePath, keyData);
        const encResult = await this.encryptFile(filePath, filePath + '.enc', password);
        // Delete raw key file
        await fs.unlink(filePath);
        if (!encResult.success) {
            throw new Error(`Key encryption failed: ${encResult.error}`);
        }
        // Rename .enc file to final path
        await fs.rename(filePath + '.enc', filePath);
    }
}
exports.DataEncryptionLayer = DataEncryptionLayer;
