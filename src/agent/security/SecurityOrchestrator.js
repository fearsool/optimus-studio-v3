"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityOrchestrator = void 0;
// src/agent/security/SecurityOrchestrator.ts
const HardwareLayer_1 = require("@/agent/security/layers/HardwareLayer");
const DataEncryptionLayer_1 = require("@/agent/security/layers/DataEncryptionLayer");
const NetworkLayer_1 = require("@/agent/security/layers/NetworkLayer");
const AccessControlLayer_1 = require("@/agent/security/layers/AccessControlLayer");
const AuditLayer_1 = require("@/agent/security/layers/AuditLayer");
const EmergencyProtocols_1 = require("@/agent/security/emergency/EmergencyProtocols");
class SecurityOrchestrator {
    constructor() {
        this.securityScore = 0;
        this.lastAudit = null;
        this.isLocked = false;
        this.hardware = new HardwareLayer_1.HardwareLayer();
        this.encryption = new DataEncryptionLayer_1.DataEncryptionLayer();
        this.network = new NetworkLayer_1.NetworkLayer();
        this.access = new AccessControlLayer_1.AccessControlLayer();
        this.audit = new AuditLayer_1.AuditLayer();
        this.emergency = new EmergencyProtocols_1.EmergencyProtocols();
    }
    async initialize() {
        console.log('🛡️ Security Orchestrator Initializing...');
        // 1. Sistem fingerprint oluştur
        const fingerprint = await this.hardware.getSystemFingerprint();
        console.log(`   System Fingerprint: ${fingerprint.substring(0, 16)}...`);
        // 2. İlk güvenlik audit'i
        await this.runInitialAudit();
        // 3. Encryption key'leri hazırla
        await this.initializeEncryptionKeys();
        // 4. Network security check
        await this.checkNetworkSecurity();
        console.log('✅ Security Orchestrator Ready');
    }
    async runInitialAudit() {
        const auditResults = [];
        // 1. Hardware audit
        const hardwareScore = await this.auditHardware();
        auditResults.push({ layer: 'hardware', score: hardwareScore });
        // 2. Encryption audit
        const encryptionScore = await this.auditEncryption();
        auditResults.push({ layer: 'encryption', score: encryptionScore });
        // 3. Network audit
        const networkScore = await this.auditNetwork();
        auditResults.push({ layer: 'network', score: networkScore });
        // 4. Access control audit
        const accessScore = await this.auditAccessControl();
        auditResults.push({ layer: 'access', score: accessScore });
        // Toplam skor
        const totalScore = auditResults.reduce((sum, r) => sum + r.score, 0) / auditResults.length;
        this.securityScore = Math.round(totalScore * 100);
        const audit = {
            timestamp: new Date(),
            results: auditResults,
            overallScore: this.securityScore,
            recommendations: this.generateRecommendations(auditResults)
        };
        this.lastAudit = audit.timestamp;
        // Audit log'u kaydet
        await this.audit.logAudit(audit);
        return audit;
    }
    async auditHardware() {
        try {
            const usbDevices = await this.hardware.detectUSBDevices();
            const hasStorageDevices = usbDevices.some(d => d.type === 'storage');
            const processIsolated = await this.hardware.checkProcessIsolation();
            // Puanlama (0-1)
            let score = 0.7; // Base score
            if (!hasStorageDevices)
                score += 0.1;
            if (processIsolated)
                score += 0.2;
            return Math.min(1, score);
        }
        catch (error) {
            console.error('Hardware audit failed:', error);
            return 0.3;
        }
    }
    async auditEncryption() {
        // Encryption strength check
        const hasStrongEncryption = true; // Assume true for now
        const keyManagementSecure = true;
        let score = 0.5;
        if (hasStrongEncryption)
            score += 0.3;
        if (keyManagementSecure)
            score += 0.2;
        return Math.min(1, score);
    }
    async auditNetwork() {
        const vpnStatus = await this.network.checkVPNStatus();
        const openPorts = await this.network.scanPorts('localhost', 3000, 3020);
        let score = 0.6;
        if (!vpnStatus.isVPN)
            score += 0.2;
        if (openPorts.length <= 3)
            score += 0.2;
        return Math.min(1, score);
    }
    async auditAccessControl() {
        return 0.8; // Placeholder
    }
    generateRecommendations(results) {
        const recommendations = [];
        for (const result of results) {
            if (result.score < 0.7) {
                recommendations.push(`Improve ${result.layer} security (score: ${Math.round(result.score * 100)}%)`);
            }
        }
        if (recommendations.length === 0) {
            recommendations.push('Security posture is strong. Maintain regular audits.');
        }
        return recommendations;
    }
    async initializeEncryptionKeys() {
        // Ana anahtar oluştur
        const masterKey = await this.encryption.deriveKey(process.env.MASTER_ENCRYPTION_KEY || 'default-master-key-change-me', Buffer.from(process.env.ENCRYPTION_SALT || 'default-salt-change-me', 'hex'));
        // Anahtarı güvenli şekilde kaydet
        await this.encryption.saveEncryptedKey('master', masterKey, process.env.KEY_ENCRYPTION_PASSWORD || 'change-this-password');
        console.log('🔑 Encryption keys initialized');
    }
    async checkNetworkSecurity() {
        const vpnStatus = await this.network.checkVPNStatus();
        if (vpnStatus.isVPN) {
            console.log('🔒 VPN detected, network traffic is secured');
        }
        else {
            console.warn('⚠️  No VPN detected, consider enabling for sensitive operations');
        }
    }
    async runSecurityAudit() {
        if (this.isLocked) {
            throw new Error('Security system is locked');
        }
        console.log('🔍 Running security audit...');
        const audit = await this.runInitialAudit();
        // WhatsApp'a rapor gönder
        await this.sendSecurityReport(audit);
        return audit;
    }
    async lockSystem() {
        this.isLocked = true;
        // Tüm kritik işlemleri durdur
        // Şifreli verileri kilit altına al
        // Yeni bağlantıları reddet
        console.log('🔐 Security system locked');
    }
    async unlockSystem(password) {
        if (password === process.env.SECURITY_UNLOCK_PASSWORD) {
            this.isLocked = false;
            console.log('🔓 Security system unlocked');
            return true;
        }
        console.error('❌ Invalid unlock password');
        return false;
    }
    async sendSecurityReport(audit) {
        // WhatsApp entegrasyonu burada
        console.log('📤 Security report ready for delivery');
    }
    getCurrentScore() {
        return this.securityScore;
    }
    getLastAuditTime() {
        return this.lastAudit;
    }
    isSystemLocked() {
        return this.isLocked;
    }
}
exports.SecurityOrchestrator = SecurityOrchestrator;
