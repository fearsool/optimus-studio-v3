
import { integrationManager } from '../integrationService';

const API_URL = 'https://app.ayrshare.com/api';

export const ayrshareService = {
    /**
     * Get API Key from Env or Integration Manager
     */
    getApiKey(): string | null {
        // 1. Try Environment Variable
        if (typeof process !== 'undefined' && process.env?.AYRSHARE_API_KEY) {
            return process.env.AYRSHARE_API_KEY;
        }

        // 2. Try Integration Manager (LocalStorage)
        const integration = integrationManager.getIntegrations().find(i => i.type === 'ayrshare');
        return integration?.credentials?.apiKey || null;
    },

    /**
     * Post to connected social networks
     */
    async post(content: string, platforms: string[] = ['twitter', 'linkedin'], mediaUrls?: string[]) {
        const apiKey = this.getApiKey();

        if (!apiKey) {
            console.warn('[Ayrshare] No API Key found. Simulating post.');
            return { status: 'simulated', id: 'mock_' + Date.now() };
        }

        try {
            const body: any = {
                post: content,
                platforms,
                mediaUrls
            };

            const response = await fetch(`${API_URL}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message);
            }

            return data;
        } catch (error) {
            console.error('[Ayrshare] Post Error:', error);
            throw error;
        }
    },

    /**
     * Get User Profile / Quota
     */
    async getUser() {
        const apiKey = this.getApiKey();
        if (!apiKey) return null;

        try {
            const response = await fetch(`${API_URL}/user`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            return await response.json();
        } catch (error) {
            return null;
        }
    }
};
