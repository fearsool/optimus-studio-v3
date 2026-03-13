"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaClient = void 0;
class ChromaClient {
    constructor(params) { }
    async getCollection(params) {
        return {
            add: async () => { },
            query: async () => ({ ids: [], documents: [], metadatas: [] }),
            count: async () => 0,
            delete: async () => { },
            upsert: async () => { },
            get: async () => ({})
        };
    }
    async createCollection(params) {
        return this.getCollection(params);
    }
    async listCollections() {
        return [];
    }
}
exports.ChromaClient = ChromaClient;
