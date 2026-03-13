"use strict";
/**
 * 💬 MESSAGE STORE - Chat messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMessageStore = void 0;
const zustand_1 = require("zustand");
exports.useMessageStore = (0, zustand_1.create)((set) => ({
    messages: [
        { id: 0, role: 'system', content: 'Optimus Agent hazır. Size nasıl yardımcı olabilirim?', timestamp: new Date() }
    ],
    isLoading: false,
    addMessage: (role, content, metadata) => {
        const id = Date.now();
        set((state) => ({
            messages: [...state.messages, { id, role, content, timestamp: new Date(), metadata }]
        }));
        return id;
    },
    updateMessage: (id, content) => set((state) => ({
        messages: state.messages.map(m => m.id === id ? { ...m, content } : m)
    })),
    removeMessage: (id) => set((state) => ({
        messages: state.messages.filter(m => m.id !== id)
    })),
    clearMessages: () => set({
        messages: [{ id: 0, role: 'system', content: 'Optimus Agent hazır. Size nasıl yardımcı olabilirim?', timestamp: new Date() }]
    }),
    setLoading: (loading) => set({ isLoading: loading })
}));
