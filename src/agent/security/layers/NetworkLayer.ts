// src/agent/security/layers/NetworkLayer.ts
import * as net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

export class NetworkLayer {
    private allowedPorts = new Set<number>([3000, 3005, 443, 80]);
    private allowedDomains = new Set<string>([
        'api.openai.com',
        'api.anthropic.com',
        'whatsapp.com',
        'stripe.com',
        'paypal.com',
        'gumroad.com'
    ]);

    // Port taraması
    async scanPorts(host: string = 'localhost', start: number = 1, end: number = 65535): Promise<PortScanResult[]> {
        const openPorts: PortScanResult[] = [];

        // Limit range for performance monitoring unless full scan requested (demo limit to 100 ports per prompt logic)
        const scanLimit = Math.min(end, start + 100);

        for (let port = start; port <= scanLimit; port++) {
            const isOpen = await this.checkPort(host, port);
            if (isOpen) {
                const service = this.guessService(port);
                openPorts.push({ port, service, status: 'open' });
            }
        }

        return openPorts;
    }

    private async checkPort(host: string, port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(1000);

            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });

            socket.on('error', () => {
                resolve(false);
            });

            socket.connect(port, host);
        });
    }

    private guessService(port: number): string {
        const services: Record<number, string> = {
            20: 'FTP Data',
            21: 'FTP Control',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            443: 'HTTPS',
            3000: 'Node.js',
            3005: 'Optimus API',
            3306: 'MySQL',
            5432: 'PostgreSQL',
            6379: 'Redis',
            8080: 'HTTP Alt'
        };

        return services[port] || 'Unknown';
    }

    // Outbound connection kontrolü
    async validateOutboundConnection(host: string, port: number): Promise<ConnectionValidation> {
        const domain = host.replace(/^https?:\/\//, '').split(':')[0];

        // Domain whitelist kontrolü
        const isDomainAllowed = this.allowedDomains.has(domain);

        // Port whitelist kontrolü
        const isPortAllowed = this.allowedPorts.has(port);

        // Gerçek bağlantı testi
        let canConnect = false;
        try {
            const response = await axios.head(`http://${host}:${port}`, { timeout: 5000 });
            canConnect = response.status < 400;
        } catch (error) {
            canConnect = false;
        }

        return {
            host,
            port,
            domain,
            isDomainAllowed,
            isPortAllowed,
            canConnect,
            timestamp: new Date(),
            riskLevel: this.calculateRiskLevel(isDomainAllowed, isPortAllowed, canConnect)
        };
    }

    private calculateRiskLevel(
        domainAllowed: boolean,
        portAllowed: boolean,
        canConnect: boolean
    ): 'low' | 'medium' | 'high' {
        if (!domainAllowed && !portAllowed) return 'high';
        if (!domainAllowed || !portAllowed) return 'medium';
        if (canConnect) return 'low';
        return 'medium';
    }

    // VPN kontrolü (basit)
    async checkVPNStatus(): Promise<VPNStatus> {
        try {
            // Public IP kontrolü
            const ipResponse = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
            const publicIp = ipResponse.data.ip;

            // IP bilgileri
            const ipInfoResponse = await axios.get(`http://ip-api.com/json/${publicIp}`, { timeout: 5000 });
            const ipInfo = ipInfoResponse.data;

            // VPN/Proxy tespiti için ek servis
            let isVPN = false;
            try {
                const vpnCheck = await axios.get(`https://v2.api.iphub.info/ip/${publicIp}`, {
                    timeout: 5000,
                    headers: { 'X-Key': process.env.IPHUB_KEY || '' }
                });
                isVPN = vpnCheck.data.block === 1;
            } catch (e) {
                // Fallback: hosting provider kontrolü
                const hostingProviders = [
                    'amazonaws', 'digitalocean', 'linode', 'vultr',
                    'azure', 'google', 'cloudflare', 'ovh'
                ];
                isVPN = hostingProviders.some(provider =>
                    ipInfo.org?.toLowerCase().includes(provider) ||
                    ipInfo.isp?.toLowerCase().includes(provider)
                );
            }

            return {
                publicIp,
                isVPN,
                country: ipInfo.country,
                city: ipInfo.city,
                isp: ipInfo.isp,
                timestamp: new Date()
            };

        } catch (error: any) {
            return {
                publicIp: 'unknown',
                isVPN: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    // Firewall rule ekleme (Linux iptables)
    async addFirewallRule(rule: FirewallRule): Promise<boolean> {
        try {
            if (process.platform !== 'linux') {
                console.warn('Firewall rules only supported on Linux');
                return false;
            }

            let command = '';
            if (rule.direction === 'inbound') {
                command = `iptables -A INPUT -p ${rule.protocol || 'tcp'} --dport ${rule.port} -j ${rule.action}`;
            } else {
                command = `iptables -A OUTPUT -p ${rule.protocol || 'tcp'} --dport ${rule.port} -j ${rule.action}`;
            }

            if (rule.source) {
                command += ` -s ${rule.source}`;
            }

            await execAsync(`sudo ${command}`);
            console.log(`✅ Firewall rule added: ${command}`);
            return true;

        } catch (error) {
            console.error('Firewall rule error:', error);
            return false;
        }
    }
}

export interface PortScanResult {
    port: number;
    service: string;
    status: 'open' | 'closed' | 'filtered';
}

export interface ConnectionValidation {
    host: string;
    port: number;
    domain: string;
    isDomainAllowed: boolean;
    isPortAllowed: boolean;
    canConnect: boolean;
    timestamp: Date;
    riskLevel: 'low' | 'medium' | 'high';
}

export interface VPNStatus {
    publicIp: string;
    isVPN: boolean;
    country?: string;
    city?: string;
    isp?: string;
    error?: string;
    timestamp: Date;
}

export interface FirewallRule {
    direction: 'inbound' | 'outbound';
    port: number;
    protocol?: 'tcp' | 'udp';
    action: 'ACCEPT' | 'DROP' | 'REJECT';
    source?: string;
}
