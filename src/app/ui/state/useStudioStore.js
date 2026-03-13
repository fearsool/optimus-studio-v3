"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStudioStore = void 0;
const zustand_1 = require("zustand");
exports.useStudioStore = (0, zustand_1.create)((set) => ({
    agent: {
        status: 'idle',
        currentPlan: null,
        currentStep: 0,
        activeTool: null,
    },
    messages: [],
    activeTab: 'code',
    diagnostics: [],
    isLoading: false,
    setAgentStatus: (status) => set((state) => ({ agent: { ...state.agent, status } })),
    setPlan: (plan) => set((state) => ({ agent: { ...state.agent, currentPlan: plan } })),
    setActiveTab: (tab) => set({ activeTab: tab }),
    addMessage: (role, content) => set((state) => ({
        messages: [...state.messages, {
                id: Date.now(),
                role: role,
                content,
                timestamp: new Date()
            }]
    })),
    addLog: (log) => console.log('Log added:', log),
    setDiagnostics: (diagnostics) => set({ diagnostics }),
    resolveDiagnosis: (id) => set((state) => ({
        diagnostics: state.diagnostics.filter((d) => d.id !== id)
    })),
    setLoading: (isLoading) => set({ isLoading }),
}));
