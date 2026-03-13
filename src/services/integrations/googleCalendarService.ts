
import { integrationManager } from '../integrationService';

// Note: For full production use, this requires OAuth2 or Service Account setup.
// This service assumes a valid Access Token or API Key (for reading public calendars).

const BASE_URL = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
    summary: string;
    description: string;
    start: { dateTime: string };
    end: { dateTime: string };
    attendees?: { email: string }[];
}

export const googleCalendarService = {
    getToken(): string | null {
        if (typeof process !== 'undefined' && process.env?.GOOGLE_CALENDAR_TOKEN) {
            return process.env.GOOGLE_CALENDAR_TOKEN;
        }
        const integration = integrationManager.getIntegrations().find(i => i.type === 'googlecalendar');
        return integration?.credentials?.accessToken || null;
    },

    /**
     * Check if a time slot is free
     */
    async isSlotFree(calendarId: string, start: string, end: string): Promise<boolean> {
        const token = this.getToken();
        if (!token) return true; // Mock: Everything is free if no calendar connected

        try {
            const url = `${BASE_URL}/calendars/${calendarId}/events?timeMin=${start}&timeMax=${end}&singleEvents=true`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return !data.items || data.items.length === 0;
        } catch (e) {
            console.error('[GCalendar] Error checking slot:', e);
            return true; // Fail open
        }
    },

    /**
     * Create an Appointment
     */
    async createEvent(calendarId: string, event: CalendarEvent): Promise<string | null> {
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
        } catch (e) {
            console.error('[GCalendar] Error creating event:', e);
            return null;
        }
    }
};
