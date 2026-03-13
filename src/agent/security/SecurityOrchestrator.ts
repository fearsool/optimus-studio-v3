// src/agent/security/SecurityOrchestrator.ts
import { HardwareLayer } from '@/agent/security/layers/HardwareLayer';
import { DataEncryptionLayer } from '@/agent/security/layers/DataEncryptionLayer';
import { NetworkLayer } from '@/agent/security/layers/NetworkLayer';
import { AccessControlLayer } from '@/agent/security/layers/AccessControlLayer';
import { AuditLayer } from '@/agent/security/layers/AuditLayer';
import { EmergencyProtocols } from '@/agent/security/emergency/EmergencyProtocols';

export class SecurityOrchestrator {
    private hardware: HardwareLayer;
    private encryption: DataEncryptionLayer;
    private network: NetworkLayer;
    private access: AccessControlLayer;
    private audit: AuditLayer;
    private emergency: EmergencyProtocols;

    private securityScore: number = 0;
    private lastAudit: Date | null = null;
    private isLocked: boolean = false;

    constructor() {
        this.hardware = new HardwareLayer();
        this.encryption = new DataEncryptionLayer();
        this.network = new NetworkLayer();
        this.access = new AccessControlLayer();
        this.audit = new AuditLayer();
        this.emergency = new EmergencyProtocols();
    }

    async initialize(): Promise<void> {
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

    private async runInitialAudit(): Promise<SecurityAudit> {
        const auditResults: AuditResult[] = [];

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

        const audit: SecurityAudit = {
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

    private async auditHardware(): Promise<number> {
        try {
            const usbDevices = await this.hardware.detectUSBDevices();
            const hasStorageDevices = usbDevices.some(d => d.type === 'storage');

            const processIsolated = await this.hardware.checkProcessIsolation();

            // Puanlama (0-1)
            let score = 0.7; // Base score

            if (!hasStorageDevices) score += 0.1;
            if (processIsolated) score += 0.2;

            return Math.min(1, score);
        } catch (error) {
            console.error('Hardware audit failed:', error);
            return 0.3;
        }
    }

    private async auditEncryption(): Promise<number> {
        // Encryption strength check
        const hasStrongEncryption = true; // Assume true for now
        const keyManagementSecure = true;

        let score = 0.5;
        if (hasStrongEncryption) score += 0.3;
        if (keyManagementSecure) score += 0.2;

        return Math.min(1, score);
    }

    private async auditNetwork(): Promise<number> {
        const vpnStatus = await this.network.checkVPNStatus();
        const openPorts = await this.network.scanPorts('localhost', 3000, 3020);

        let score = 0.6;

        if (!vpnStatus.isVPN) score += 0.2;
        if (openPorts.length <= 3) score += 0.2;

        return Math.min(1, score);
    }

    private async auditAccessControl(): Promise<number> {
        return 0.8; // Placeholder
    }

    private generateRecommendations(results: AuditResult[]): string[] {
        const recommendations: string[] = [];

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

    private async initializeEncryptionKeys(): Promise<void> {
        // Ana anahtar oluştur
        const masterKey = await this.encryption.deriveKey(
            process.env.MASTER_ENCRYPTION_KEY || 'default-master-key-change-me',
            Buffer.from(process.env.ENCRYPTION_SALT || 'default-salt-change-me', 'hex')
        );

        // Anahtarı güvenli şekilde kaydet
        await this.encryption.saveEncryptedKey(
            'master',
            masterKey,
            process.env.KEY_ENCRYPTION_PASSWORD || 'change-this-password'
        );

        console.log('🔑 Encryption keys initialized');
    }

    private async checkNetworkSecurity(): Promise<void> {
        const vpnStatus = await this.network.checkVPNStatus();

        if (vpnStatus.isVPN) {
            console.log('🔒 VPN detected, network traffic is secured');
        } else {
            console.warn('⚠️  No VPN detected, consider enabling for sensitive operations');
        }
    }

    async runSecurityAudit(): Promise<SecurityAudit> {
        if (this.isLocked) {
            throw new Error('Security system is locked');
        }

        console.log('🔍 Running security audit...');
        const audit = await this.runInitialAudit();

        // WhatsApp'a rapor gönder
        await this.sendSecurityReport(audit);

        return audit;
    }

    async lockSystem(): Promise<void> {
        this.isLocked = true;

        // Tüm kritik işlemleri durdur
        // Şifreli verileri kilit altına al
        // Yeni bağlantıları reddet

        console.log('🔐 Security system locked');
    }

    async unlockSystem(password: string): Promise<boolean> {
        if (password === process.env.SECURITY_UNLOCK_PASSWORD) {
            this.isLocked = false;
            console.log('🔓 Security system unlocked');
            return true;
        }

        console.error('❌ Invalid unlock password');
        return false;
    }

    private async sendSecurityReport(audit: SecurityAudit): Promise<void> {
        // WhatsApp entegrasyonu burada
        console.log('📤 Security report ready for delivery');
    }

    getCurrentScore(): number {
        return this.securityScore;
    }

    getLastAuditTime(): Date | null {
        return this.lastAudit;
    }

    isSystemLocked(): boolean {
        return this.isLocked;
    }
}

export interface SecurityAudit {
    timestamp: Date;
    results: AuditResult[];
    overallScore: number;
    recommendations: string[];
}

export interface AuditResult {
    layer: string;
    score: number;
    details?: any;
}
