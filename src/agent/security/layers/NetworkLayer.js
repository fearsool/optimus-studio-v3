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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkLayer = void 0;
// src/agent/security/layers/NetworkLayer.ts
const net = __importStar(require("net"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const axios_1 = __importDefault(require("axios"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class NetworkLayer {
    constructor() {
        this.allowedPorts = new Set([3000, 3005, 443, 80]);
        this.allowedDomains = new Set([
            'api.openai.com',
            'api.anthropic.com',
            'whatsapp.com',
            'stripe.com',
            'paypal.com',
            'gumroad.com'
        ]);
    }
    // Port taraması
    async scanPorts(host = 'localhost', start = 1, end = 65535) {
        const openPorts = [];
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
    async checkPort(host, port) {
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
    guessService(port) {
        const services = {
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
    async validateOutboundConnection(host, port) {
        const domain = host.replace(/^https?:\/\//, '').split(':')[0];
        // Domain whitelist kontrolü
        const isDomainAllowed = this.allowedDomains.has(domain);
        // Port whitelist kontrolü
        const isPortAllowed = this.allowedPorts.has(port);
        // Gerçek bağlantı testi
        let canConnect = false;
        try {
            const response = await axios_1.default.head(`http://${host}:${port}`, { timeout: 5000 });
            canConnect = response.status < 400;
        }
        catch (error) {
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
    calculateRiskLevel(domainAllowed, portAllowed, canConnect) {
        if (!domainAllowed && !portAllowed)
            return 'high';
        if (!domainAllowed || !portAllowed)
            return 'medium';
        if (canConnect)
            return 'low';
        return 'medium';
    }
    // VPN kontrolü (basit)
    async checkVPNStatus() {
        try {
            // Public IP kontrolü
            const ipResponse = await axios_1.default.get('https://api.ipify.org?format=json', { timeout: 5000 });
            const publicIp = ipResponse.data.ip;
            // IP bilgileri
            const ipInfoResponse = await axios_1.default.get(`http://ip-api.com/json/${publicIp}`, { timeout: 5000 });
            const ipInfo = ipInfoResponse.data;
            // VPN/Proxy tespiti için ek servis
            let isVPN = false;
            try {
                const vpnCheck = await axios_1.default.get(`https://v2.api.iphub.info/ip/${publicIp}`, {
                    timeout: 5000,
                    headers: { 'X-Key': process.env.IPHUB_KEY || '' }
                });
                isVPN = vpnCheck.data.block === 1;
            }
            catch (e) {
                // Fallback: hosting provider kontrolü
                const hostingProviders = [
                    'amazonaws', 'digitalocean', 'linode', 'vultr',
                    'azure', 'google', 'cloudflare', 'ovh'
                ];
                isVPN = hostingProviders.some(provider => {
                    var _a, _b;
                    return ((_a = ipInfo.org) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(provider)) ||
                        ((_b = ipInfo.isp) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(provider));
                });
            }
            return {
                publicIp,
                isVPN,
                country: ipInfo.country,
                city: ipInfo.city,
                isp: ipInfo.isp,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                publicIp: 'unknown',
                isVPN: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    // Firewall rule ekleme (Linux iptables)
    async addFirewallRule(rule) {
        try {
            if (process.platform !== 'linux') {
                console.warn('Firewall rules only supported on Linux');
                return false;
            }
            let command = '';
            if (rule.direction === 'inbound') {
                command = `iptables -A INPUT -p ${rule.protocol || 'tcp'} --dport ${rule.port} -j ${rule.action}`;
            }
            else {
                command = `iptables -A OUTPUT -p ${rule.protocol || 'tcp'} --dport ${rule.port} -j ${rule.action}`;
            }
            if (rule.source) {
                command += ` -s ${rule.source}`;
            }
            await execAsync(`sudo ${command}`);
            console.log(`✅ Firewall rule added: ${command}`);
            return true;
        }
        catch (error) {
            console.error('Firewall rule error:', error);
            return false;
        }
    }
}
exports.NetworkLayer = NetworkLayer;
