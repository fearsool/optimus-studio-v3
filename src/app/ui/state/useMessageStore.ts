/**
 * 💬 MESSAGE STORE - Chat messages
 */

import { create } from 'zustand';

export interface Message {
    id: number;
    role: 'user' | 'assistant' | 'system' | 'thought';
    content: string;
    timestamp: Date;
    metadata?: {
        tool?: string;
        tokens?: number;
        duration?: number;
    };
}

interface MessageStore {
    messages: Message[];
    isLoading: boolean;

    addMessage: (role: Message['role'], content: string, metadata?: Message['metadata']) => number;
    updateMessage: (id: number, content: string) => void;
    removeMessage: (id: number) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
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
