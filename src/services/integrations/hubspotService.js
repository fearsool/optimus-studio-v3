"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hubspotService = void 0;
const integrationService_1 = require("../integrationService");
const BASE_URL = 'https://api.hubapi.com/crm/v3';
exports.hubspotService = {
    getApiKey() {
        var _a, _b;
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.HUBSPOT_API_KEY)) {
            return process.env.HUBSPOT_API_KEY;
        }
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'hubspot');
        return ((_b = integration === null || integration === void 0 ? void 0 : integration.credentials) === null || _b === void 0 ? void 0 : _b.apiKey) || null;
    },
    /**
     * Create a Contact in CRM
     */
    async createContact(email, firstName, lastName) {
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
        }
        catch (e) {
            console.error('[HubSpot] Error creating contact:', e);
            return null;
        }
    }
};
