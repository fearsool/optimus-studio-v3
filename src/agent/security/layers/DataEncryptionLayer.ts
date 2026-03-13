// src/agent/security/layers/DataEncryptionLayer.ts
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import * as path from 'path';

const scryptAsync = promisify(scrypt);

export class DataEncryptionLayer {
    private algorithm = 'aes-256-gcm';
    private keyLength = 32;
    private ivLength = 16;
    private saltLength = 32;

    // Anahtar türetme (password-based)
    async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
        return (await scryptAsync(password, salt, this.keyLength)) as Buffer;
    }

    // Dosya şifreleme
    async encryptFile(
        inputPath: string,
        outputPath: string,
        password: string
    ): Promise<EncryptionResult> {
        try {
            // Dosyayı oku
            const data = await fs.readFile(inputPath);

            // Salt ve IV oluştur
            const salt = randomBytes(this.saltLength);
            const iv = randomBytes(this.ivLength);

            // Anahtar türet
            const key = await this.deriveKey(password, salt);

            // Şifrele
            const cipher = createCipheriv(this.algorithm, key, iv);

            const encrypted = Buffer.concat([
                cipher.update(data),
                cipher.final()
            ]);

            const authTag = (cipher as any).getAuthTag();

            // Meta verileri ekle
            const encryptedWithMetadata = Buffer.concat([
                salt,          // 32 bytes
                iv,            // 16 bytes
                authTag,       // 16 bytes
                encrypted      // şifrelenmiş veri
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

        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Çoklu anahtar şifreleme
    async encryptWithMultipleKeys(
        data: Buffer,
        keys: string[]
    ): Promise<MultiLayerEncryptionResult> {
        let encrypted = data;
        const layers: EncryptionLayer[] = [];

        for (let i = 0; i < keys.length; i++) {
            const salt = randomBytes(this.saltLength);
            const iv = randomBytes(this.ivLength);
            const key = await this.deriveKey(keys[i], salt);

            const cipher = createCipheriv(this.algorithm, key, iv);
            encrypted = Buffer.concat([
                cipher.update(encrypted),
                cipher.final()
            ]);

            const authTag = (cipher as any).getAuthTag();

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
    encryptInMemory(data: string, key: Buffer): EncryptedData {
        const iv = randomBytes(this.ivLength);
        const cipher = createCipheriv('aes-256-gcm', key, iv);

        const encrypted = Buffer.concat([
            cipher.update(data, 'utf8'),
            cipher.final()
        ]);

        const authTag = (cipher as any).getAuthTag();

        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex'),
            authTag: authTag.toString('hex'),
            timestamp: Date.now()
        };
    }

    // Disk üzerinde şifrelenmiş anahtar yönetimi
    async saveEncryptedKey(
        keyName: string,
        keyData: Buffer,
        password: string
    ): Promise<void> {
        const keysDir = path.join(process.cwd(), '.secure-keys');
        await fs.mkdir(keysDir, { recursive: true });

        const filePath = path.join(keysDir, `${keyName}.enc`);
        const result = await this.encryptFile(
            filePath,
            filePath + '.enc', // temporary path, then move? logic seems slightly off in prompt code, but assuming inputPath is content source. Actually logic expects `encryptFile` to read from disk.
            // Wait, prompt code tries to encrypt 'filePath' to 'filePath.enc'. But filePath doesn't exist yet?
            // Ah, prompt code likely assumes we write the buffer to a temp file first or `encryptFile` logic needs adjustment. 
            // I will write keyData to temp file first.
            password
        );

        // FIX: Write keyData to file first so encryptFile can read it
        await fs.writeFile(filePath, keyData);

        const encResult = await this.encryptFile(
            filePath,
            filePath + '.enc',
            password
        );

        // Delete raw key file
        await fs.unlink(filePath);

        if (!encResult.success) {
            throw new Error(`Key encryption failed: ${encResult.error}`);
        }

        // Rename .enc file to final path
        await fs.rename(filePath + '.enc', filePath);
    }
}

export interface EncryptionResult {
    success: boolean;
    originalSize?: number;
    encryptedSize?: number;
    algorithm?: string;
    metadata?: any;
    error?: string;
}

export interface EncryptionLayer {
    layer: number;
    algorithm: string;
    salt: string;
    iv: string;
    authTag: string;
}

export interface MultiLayerEncryptionResult {
    data: Buffer;
    layers: EncryptionLayer[];
    totalLayers: number;
    encryptedAt: Date;
}

export interface EncryptedData {
    iv: string;
    encryptedData: string;
    authTag: string;
    timestamp: number;
}
