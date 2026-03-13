"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaToolsService = void 0;
const integrationService_1 = require("../integrationService");
exports.mediaToolsService = {
    /**
     * Get Bruzu API Key
     */
    getBruzuKey() {
        var _a, _b;
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.BRUZU_API_KEY)) {
            return process.env.BRUZU_API_KEY;
        }
        const integration = integrationService_1.integrationManager.getIntegrations().find(i => i.type === 'mediatools');
        return ((_b = integration === null || integration === void 0 ? void 0 : integration.credentials) === null || _b === void 0 ? void 0 : _b.bruzuKey) || null;
    },
    /**
     * Generate a social media image using Bruzu
     * @param text Main text for the image
     * @param bgImage Background image URL (optional)
     */
    generateThumbnail(text, bgImage, style = 'modern') {
        const apiKey = this.getBruzuKey();
        // Base Bruzu URL (Demo/Free tier might work without key for simple GET)
        // Format: https://img.bruzu.com/?apiKey=KEY&backgroundImage=URL&...
        const baseUrl = 'https://img.bruzu.com/';
        const params = new URLSearchParams();
        if (apiKey)
            params.append('apiKey', apiKey);
        params.append('h', '600');
        params.append('w', '1200');
        params.append('bc', '#1e1e2e'); // Dark background
        if (bgImage) {
            params.append('backgroundImage', bgImage);
            params.append('backgroundImageOpacity', '0.5');
        }
        // Layer: Text
        params.append('a.type', 'text');
        params.append('a.text', text);
        params.append('a.fontSize', '80');
        params.append('a.fontWeight', '800');
        params.append('a.color', '#ffffff');
        params.append('a.textAlign', 'center');
        // Decoration
        if (style === 'modern') {
            params.append('b.type', 'shape');
            params.append('b.shape', 'rect');
            params.append('b.fill', '#6366f1');
            params.append('b.width', '1200');
            params.append('b.height', '20');
            params.append('b.y', '580');
        }
        return `${baseUrl}?${params.toString()}`;
    },
    /**
     * Extract audio from video (Stub)
     * In future can integrate 'Extract Audio API' or FFmpeg.wasm
     */
    async extractAudio(videoFile) {
        console.log('[MediaTools] Extracting audio from', videoFile.name);
        // Implementing client-side extraction or API call here
        return null;
    }
};
