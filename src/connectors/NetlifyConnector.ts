/**
 * 🚀 NETLIFY CONNECTOR - Deploy Automation
 * =========================================
 * Deploy sites to Netlify with local build and optional API.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// =============== TYPES ===============
export interface DeployResult {
    success: boolean;
    deployId: string | null;
    url: string | null;
    adminUrl: string | null;
    logs: string[];
}

export interface Site {
    id: string;
    name: string;
    url: string;
    adminUrl: string;
}

export interface BuildStatus {
    status: 'building' | 'ready' | 'error';
    deployId: string;
    message: string;
}

// =============== NETLIFY CONNECTOR CLASS ===============
export class NetlifyConnector {
    private token: string | null = null;
    private siteId: string | null = null;

    constructor() {
        this.loadConfig();
    }

    private loadConfig(): void {
        this.token = process.env.NETLIFY_AUTH_TOKEN || null;
        this.siteId = process.env.NETLIFY_SITE_ID || null;
    }

    // =============== CONFIGURATION ===============

    configure(token: string, siteId?: string): void {
        this.token = token;
        if (siteId) this.siteId = siteId;
    }

    isConfigured(): boolean {
        return this.token !== null;
    }

    // =============== CLI-BASED DEPLOY (LOCAL-FIRST) ===============

    async deployCli(sitePath: string, production: boolean = false): Promise<DeployResult> {
        const logs: string[] = [];

        try {
            // Check if netlify-cli is installed
            try {
                await execAsync('netlify --version');
            } catch {
                logs.push('Installing netlify-cli...');
                await execAsync('npm install -g netlify-cli');
            }

            // Build command
            let cmd = `netlify deploy --dir="${sitePath}"`;
            if (production) cmd += ' --prod';
            if (this.siteId) cmd += ` --site=${this.siteId}`;

            logs.push(`Deploying: ${cmd}`);
            const { stdout, stderr } = await execAsync(cmd);

            logs.push(stdout);
            if (stderr) logs.push(stderr);

            // Parse deploy URL from output
            const urlMatch = stdout.match(/Website URL:\s+(https?:\/\/[^\s]+)/);
            const adminMatch = stdout.match(/Unique Deploy URL:\s+(https?:\/\/[^\s]+)/);

            return {
                success: true,
                deployId: null, // CLI doesn't return this easily
                url: urlMatch ? urlMatch[1] : null,
                adminUrl: adminMatch ? adminMatch[1] : null,
                logs
            };
        } catch (error: any) {
            logs.push(`Error: ${error.message}`);
            return {
                success: false,
                deployId: null,
                url: null,
                adminUrl: null,
                logs
            };
        }
    }

    // =============== API-BASED DEPLOY ===============

    async deployApi(sitePath: string): Promise<DeployResult> {
        if (!this.token || !this.siteId) {
            return {
                success: false,
                deployId: null,
                url: null,
                adminUrl: null,
                logs: ['Netlify token or site ID not configured']
            };
        }

        const logs: string[] = [];

        try {
            // Create a deploy
            const response = await fetch(`https://api.netlify.com/api/v1/sites/${this.siteId}/deploys`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `Deploy from Optimus Studio - ${new Date().toISOString()}`
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const deploy = await response.json();
            logs.push(`Created deploy: ${deploy.id}`);

            // Note: Full file upload requires more complex handling
            // For production use, the CLI method is more reliable

            return {
                success: true,
                deployId: deploy.id,
                url: deploy.ssl_url || deploy.url,
                adminUrl: deploy.admin_url,
                logs
            };
        } catch (error: any) {
            logs.push(`Error: ${error.message}`);
            return {
                success: false,
                deployId: null,
                url: null,
                adminUrl: null,
                logs
            };
        }
    }

    // =============== SITE MANAGEMENT ===============

    async listSites(): Promise<Site[]> {
        if (!this.token) return [];

        try {
            const response = await fetch('https://api.netlify.com/api/v1/sites', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) return [];

            const sites = await response.json();
            return sites.map((s: any) => ({
                id: s.id,
                name: s.name,
                url: s.ssl_url || s.url,
                adminUrl: s.admin_url
            }));
        } catch {
            return [];
        }
    }

    async createSite(name: string): Promise<Site | null> {
        if (!this.token) return null;

        try {
            const response = await fetch('https://api.netlify.com/api/v1/sites', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (!response.ok) return null;

            const site = await response.json();
            return {
                id: site.id,
                name: site.name,
                url: site.ssl_url || site.url,
                adminUrl: site.admin_url
            };
        } catch {
            return null;
        }
    }

    async getSite(siteId: string): Promise<Site | null> {
        if (!this.token) return null;

        try {
            const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) return null;

            const site = await response.json();
            return {
                id: site.id,
                name: site.name,
                url: site.ssl_url || site.url,
                adminUrl: site.admin_url
            };
        } catch {
            return null;
        }
    }

    // =============== BUILD STATUS ===============

    async getBuildStatus(deployId: string): Promise<BuildStatus | null> {
        if (!this.token) return null;

        try {
            const response = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) return null;

            const deploy = await response.json();
            return {
                status: deploy.state === 'ready' ? 'ready' : deploy.state === 'error' ? 'error' : 'building',
                deployId: deploy.id,
                message: deploy.error_message || deploy.title || ''
            };
        } catch {
            return null;
        }
    }

    // =============== QUICK DEPLOY (BEST METHOD) ===============

    async deploy(sitePath: string, options: { production?: boolean; useCli?: boolean } = {}): Promise<DeployResult> {
        const { production = false, useCli = true } = options;

        if (useCli) {
            return this.deployCli(sitePath, production);
        } else {
            return this.deployApi(sitePath);
        }
    }
}

// =============== SINGLETON ===============
export const netlifyConnector = new NetlifyConnector();
