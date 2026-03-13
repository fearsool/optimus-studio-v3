// src/agent/security/layers/HardwareLayer.ts
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class HardwareLayer {
    // Platform tespiti
    private platform = process.platform;
    private isWindows = this.platform === 'win32';
    private isMac = this.platform === 'darwin';
    private isLinux = this.platform === 'linux';

    // Sistem bilgileri (unique fingerprint)
    async getSystemFingerprint(): Promise<string> {
        const components = [
            os.hostname(),
            os.platform(),
            os.arch(),
            os.cpus()[0].model,
            os.totalmem().toString(),
            (await this.getMacAddress()).join(''),
        ];

        const hash = crypto.createHash('sha256');
        hash.update(components.join('|'));
        return hash.digest('hex');
    }

    // MAC adreslerini al
    private async getMacAddress(): Promise<string[]> {
        const interfaces = os.networkInterfaces();
        const macs: string[] = [];

        for (const iface of Object.values(interfaces)) {
            if (iface) {
                for (const info of iface) {
                    if (info.mac && info.mac !== '00:00:00:00:00:00') {
                        macs.push(info.mac);
                    }
                }
            }
        }

        return [...new Set(macs)];
    }

    // USB cihaz tespiti (platforma özel)
    async detectUSBDevices(): Promise<USBDevice[]> {
        const devices: USBDevice[] = [];

        try {
            if (this.isLinux) {
                const { stdout } = await execAsync('lsusb');
                const lines = stdout.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        const match = line.match(/Bus (\d+) Device (\d+): ID ([0-9a-f]{4}):([0-9a-f]{4}) (.+)/i);
                        if (match) {
                            devices.push({
                                bus: parseInt(match[1]),
                                device: parseInt(match[2]),
                                vendorId: match[3],
                                productId: match[4],
                                description: match[5],
                                type: this.classifyUSBDevice(match[5])
                            });
                        }
                    }
                }
            } else if (this.isMac) {
                // Mock fallback for Mac if system_profiler fails or is too slow
                try {
                    const { stdout } = await execAsync('system_profiler SPUSBDataType');
                    // Simplified parsing
                    if (stdout.includes('Flash')) devices.push({ description: 'USB Flash Drive', type: 'storage' });
                } catch (e) {
                    console.warn('Mac USB detection failed');
                }
            } else if (this.isWindows) {
                // PowerShell ile USB device bilgisi
                const { stdout } = await execAsync(
                    'powershell "Get-PnpDevice -Class USB | Select-Object FriendlyName, Status, InstanceId | ConvertTo-Json"'
                );

                try {
                    const winDevices = JSON.parse(stdout);
                    if (Array.isArray(winDevices)) {
                        for (const dev of winDevices) {
                            devices.push({
                                description: dev.FriendlyName || 'Unknown',
                                status: dev.Status,
                                instanceId: dev.InstanceId,
                                type: this.classifyUSBDevice(dev.FriendlyName)
                            });
                        }
                    }
                } catch (e) {
                    console.warn('Windows USB device parsing failed:', e);
                }
            }
        } catch (error) {
            console.error('USB detection error:', error);
        }

        return devices;
    }

    private classifyUSBDevice(description: string): 'storage' | 'keyboard' | 'mouse' | 'other' {
        if (!description) return 'other';
        const desc = description.toLowerCase();
        if (desc.includes('flash') || desc.includes('usb drive') || desc.includes('storage')) {
            return 'storage';
        } else if (desc.includes('keyboard')) {
            return 'keyboard';
        } else if (desc.includes('mouse')) {
            return 'mouse';
        }
        return 'other';
    }

    // Secure file operations
    async secureDelete(filePath: string, passes: number = 3): Promise<void> {
        try {
            const stats = await fs.stat(filePath);
            const fileSize = stats.size;

            for (let i = 0; i < passes; i++) {
                // Rastgele veri yaz
                const randomData = crypto.randomBytes(fileSize);
                await fs.writeFile(filePath, randomData, { mode: 0o600 });

                // Sıfır yaz
                const zeroData = Buffer.alloc(fileSize);
                await fs.writeFile(filePath, zeroData, { mode: 0o600 });
            }

            // Dosyayı sil
            await fs.unlink(filePath);

            console.log(`✅ Securely deleted: ${filePath} (${passes} passes)`);
        } catch (error) {
            console.error('Secure delete failed:', error);
            throw error;
        }
    }

    // RAM'deki hassas verileri temizle
    secureZeroBuffer(buffer: Buffer): void {
        buffer.fill(0);
    }

    // Process isolation check
    async checkProcessIsolation(): Promise<boolean> {
        try {
            if (this.isLinux) {
                // Control groups kontrolü
                const { stdout } = await execAsync('cat /proc/self/cgroup');
                return stdout.includes('docker') || stdout.includes('kubepods');
            }
            return false; // Windows process isolation check requires more complex API calls, assuming false/native for now
        } catch (error) {
            return false;
        }
    }
}

export interface USBDevice {
    bus?: number;
    device?: number;
    vendorId?: string;
    productId?: string;
    description: string;
    status?: string;
    instanceId?: string;
    type: 'storage' | 'keyboard' | 'mouse' | 'other';
}
