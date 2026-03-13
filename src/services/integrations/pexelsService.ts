
import { integrationManager } from '../integrationService';

const BASE_URL = 'https://api.pexels.com/v1';
const VIDEO_URL = 'https://api.pexels.com/videos';

export interface PexelsMedia {
    id: number;
    url: string;
    photographer: string;
    src: {
        original: string;
        large: string;
        medium: string;
        portrait: string;
    };
    video_files?: {
        quality: string;
        link: string;
    }[];
}

export const pexelsService = {
    getApiKey(): string | null {
        if (typeof process !== 'undefined' && process.env?.PEXELS_API_KEY) {
            return process.env.PEXELS_API_KEY;
        }
        const integration = integrationManager.getIntegrations().find(i => i.type === 'pexels');
        return integration?.credentials?.apiKey || null;
    },

    async searchPhotos(query: string, count: number = 1): Promise<PexelsMedia[]> {
        const apiKey = this.getApiKey();
        if (!apiKey) return this.getMockMedia('photo');

        try {
            const res = await fetch(`${BASE_URL}/search?query=${query}&per_page=${count}`, {
                headers: { Authorization: apiKey }
            });
            const data = await res.json();
            return data.photos || [];
        } catch (e) {
            console.error('[Pexels] Error:', e);
            return this.getMockMedia('photo');
        }
    },

    async searchVideos(query: string, count: number = 1): Promise<PexelsMedia[]> {
        const apiKey = this.getApiKey();
        if (!apiKey) return this.getMockMedia('video');

        try {
            const res = await fetch(`${VIDEO_URL}/search?query=${query}&per_page=${count}`, {
                headers: { Authorization: apiKey }
            });
            const data = await res.json();
            return data.videos || [];
        } catch (e) {
            console.error('[Pexels] Error:', e);
            return this.getMockMedia('video');
        }
    },

    getMockMedia(type: 'photo' | 'video'): PexelsMedia[] {
        return [{
            id: 123456,
            url: 'https://pexels.com/mock',
            photographer: 'Mock Artist',
            src: {
                original: 'https://via.placeholder.com/1920x1080?text=Mock+Pexels+' + type,
                large: 'https://via.placeholder.com/1200x800',
                medium: 'https://via.placeholder.com/800x600',
                portrait: 'https://via.placeholder.com/800x1200'
            },
            video_files: type === 'video' ? [{ quality: 'hd', link: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' }] : undefined
        }];
    }
};
