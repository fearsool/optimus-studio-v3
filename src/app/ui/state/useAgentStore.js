"use strict";
/**
 * 🤖 AGENT STORE - Agent state management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusConfig = exports.useAgentStore = void 0;
const zustand_1 = require("zustand");
exports.useAgentStore = (0, zustand_1.create)((set) => ({
    status: 'idle',
    currentPlan: null,
    currentStep: 0,
    activeTool: null,
    logs: [
        { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), type: 'info', message: 'Agent başlatıldı' },
        { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), type: 'success', message: 'LLM bağlantısı hazır' }
    ],
    setStatus: (status) => set({ status }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setPlan: (plan) => set({ currentPlan: plan, currentStep: 0 }),
    setCurrentStep: (step) => set({ currentStep: step }),
    updateStepStatus: (stepId, status, result) => set((state) => {
        if (!state.currentPlan)
            return state;
        return {
            currentPlan: {
                ...state.currentPlan,
                steps: state.currentPlan.steps.map(s => s.id === stepId ? { ...s, status, result } : s)
            }
        };
    }),
    addLog: (type, message) => {
        const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        set((state) => ({
            logs: [...state.logs.slice(-30), { time, type, message }]
        }));
    },
    clearLogs: () => set({ logs: [] })
}));
// Helper
const getStatusConfig = (status) => ({
    idle: { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', label: 'HAZIR' },
    thinking: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', label: 'DÜŞÜNÜYOR' },
    planning: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', label: 'PLANLAMA' },
    executing: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', label: 'ÇALIŞTIRMA' },
    verifying: { color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', label: 'DOĞRULAMA' },
    error: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', label: 'HATA' }
}[status]);
exports.getStatusConfig = getStatusConfig;
