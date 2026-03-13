"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComfyUIIntegration = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class ComfyUIIntegration {
    constructor(baseUrl = 'http://localhost:8188') {
        this.baseUrl = baseUrl;
    }
    async checkHealth() {
        try {
            const res = await (0, node_fetch_1.default)(`${this.baseUrl}/history`);
            return res.ok;
        }
        catch (_a) {
            return false;
        }
    }
    async queuePrompt(workflow) {
        console.log('[ComfyUI] Queuing visual generation workflow...');
        const res = await (0, node_fetch_1.default)(`${this.baseUrl}/prompt`, {
            method: 'POST',
            body: JSON.stringify({ prompt: workflow })
        });
        const data = await res.json();
        return data.prompt_id;
    }
    async getStatus(promptId) {
        const res = await (0, node_fetch_1.default)(`${this.baseUrl}/history/${promptId}`);
        return await res.json();
    }
}
exports.ComfyUIIntegration = ComfyUIIntegration;
