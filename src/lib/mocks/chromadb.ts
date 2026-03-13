export class ChromaClient {
    constructor(params?: any) { }

    async getCollection(params: any) {
        return {
            add: async () => { },
            query: async () => ({ ids: [], documents: [], metadatas: [] }),
            count: async () => 0,
            delete: async () => { },
            upsert: async () => { },
            get: async () => ({})
        };
    }

    async createCollection(params: any) {
        return this.getCollection(params);
    }

    async listCollections() {
        return [];
    }
}
