"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCalendarService = void 0;
const integrationService_1 = require("../integrationService");
// Note: For full production use, this requires OAuth2 or Service Account setup.
// This service assumes a valid Access Token or API Key (for reading public calendars).
const BASE_URL = 'https://www.googleapis.com/calendar/v3';
exports.googleCalendarService = {
    getToken() {
        var _a, _b;
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.GOOGLE_CALENDAR_TOKEN)) {
            return process.env.GOOGLE_CALENDAR_TOKEN;
        }
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'googlecalendar');
        return ((_b = integration === null || integration === void 0 ? void 0 : integration.credentials) === null || _b === void 0 ? void 0 : _b.accessToken) || null;
    },
    /**
     * Check if a time slot is free
     */
    async isSlotFree(calendarId, start, end) {
        const token = this.getToken();
        if (!token)
            return true; // Mock: Everything is free if no calendar connected
        try {
            const url = `${BASE_URL}/calendars/${calendarId}/events?timeMin=${start}&timeMax=${end}&singleEvents=true`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return !data.items || data.items.length === 0;
        }
        catch (e) {
            console.error('[GCalendar] Error checking slot:', e);
            return true; // Fail open
        }
    },
    /**
     * Create an Appointment
     */
    async createEvent(calendarId, event) {
        const token = this.getToken();
        if (!token) {
            console.warn('[GCalendar] No Token. Simulating event creation.');
            return `mock_event_${Date.now()}`;
        }
        try {
            const res = await fetch(`${BASE_URL}/calendars/${calendarId}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
            const data = await res.json();
            return data.id || null;
        }
        catch (e) {
            console.error('[GCalendar] Error creating event:', e);
            return null;
        }
    }
};
