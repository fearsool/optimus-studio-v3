
import { create } from 'zustand';

interface StudioStore {
    agent: {
        status: string;
        currentPlan: any;
        currentStep: number;
        activeTool: string | null;
    };
    messages: any[];
    activeTab: string;
    diagnostics: any[];
    isLoading: boolean;

    setAgentStatus: (status: string) => void;
    setPlan: (plan: any) => void;
    setActiveTab: (tab: string) => void;
    addMessage: (role: string, content: string) => void;
    addLog: (log: any) => void;
    setDiagnostics: (diagnostics: any[]) => void;
    resolveDiagnosis: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useStudioStore = create<StudioStore>((set) => ({
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

    setAgentStatus: (status) =>
        set((state) => ({ agent: { ...state.agent, status } })),

    setPlan: (plan) =>
        set((state) => ({ agent: { ...state.agent, currentPlan: plan } })),

    setActiveTab: (tab) => set({ activeTab: tab }),

    addMessage: (role, content) =>
        set((state) => ({
            messages: [...state.messages, {
                id: Date.now(),
                role: role as any,
                content,
                timestamp: new Date()
            }]
        })),

    addLog: (log) => console.log('Log added:', log),

    setDiagnostics: (diagnostics) => set({ diagnostics }),

    resolveDiagnosis: (id) =>
        set((state) => ({
            diagnostics: state.diagnostics.filter((d: any) => d.id !== id)
        })),

    setLoading: (isLoading) => set({ isLoading }),
}));
