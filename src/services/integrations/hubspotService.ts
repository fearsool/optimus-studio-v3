
import { integrationManager } from '../integrationService';

const BASE_URL = 'https://api.hubapi.com/crm/v3';

export const hubspotService = {
    getApiKey(): string | null {
        if (typeof process !== 'undefined' && process.env?.HUBSPOT_API_KEY) {
            return process.env.HUBSPOT_API_KEY;
        }
        const integration = integrationManager.getIntegrations().find(i => i.type === 'hubspot');
        return integration?.credentials?.apiKey || null;
    },

    /**
     * Create a Contact in CRM
     */
    async createContact(email: string, firstName: string, lastName: string): Promise<string | null> {
        const apiKey = this.getApiKey();

        if (!apiKey) {
            console.warn('[HubSpot] No API Key. Simulating contact creation.');
            return `mock_contact_${Date.now()}`;
        }

        try {
            const res = await fetch(`${BASE_URL}/objects/contacts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: { email, firstname: firstName, lastname: lastName }
                })
            });
            const data = await res.json();
            return data.id || null;
        } catch (e) {
            console.error('[HubSpot] Error creating contact:', e);
            return null;
        }
    }
};
