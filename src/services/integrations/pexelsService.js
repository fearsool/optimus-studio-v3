"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pexelsService = void 0;
const integrationService_1 = require("../integrationService");
const BASE_URL = 'https://api.pexels.com/v1';
const VIDEO_URL = 'https://api.pexels.com/videos';
exports.pexelsService = {
    getApiKey() {
        var _a, _b;
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.PEXELS_API_KEY)) {
            return process.env.PEXELS_API_KEY;
        }
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'pexels');
        return ((_b = integration === null || integration === void 0 ? void 0 : integration.credentials) === null || _b === void 0 ? void 0 : _b.apiKey) || null;
    },
    async searchPhotos(query, count = 1) {
        const apiKey = this.getApiKey();
        if (!apiKey)
            return this.getMockMedia('photo');
        try {
            const res = await fetch(`${BASE_URL}/search?query=${query}&per_page=${count}`, {
                headers: { Authorization: apiKey }
            });
            const data = await res.json();
            return data.photos || [];
        }
        catch (e) {
            console.error('[Pexels] Error:', e);
            return this.getMockMedia('photo');
        }
    },
    async searchVideos(query, count = 1) {
        const apiKey = this.getApiKey();
        if (!apiKey)
            return this.getMockMedia('video');
        try {
            const res = await fetch(`${VIDEO_URL}/search?query=${query}&per_page=${count}`, {
                headers: { Authorization: apiKey }
            });
            const data = await res.json();
            return data.videos || [];
        }
        catch (e) {
            console.error('[Pexels] Error:', e);
            return this.getMockMedia('video');
        }
    },
    getMockMedia(type) {
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
