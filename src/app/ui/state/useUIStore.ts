/**
 * 🎨 UI STORE - UI state management
 */

import { create } from 'zustand';

export type ViewType = 'explorer' | 'search' | 'agent' | 'extensions' | 'settings';
export type TabType = 'chat' | 'plan' | 'code' | 'terminal';

interface UIStore {
    // Views
    activeView: ViewType;
    activeTab: TabType;
    setActiveView: (view: ViewType) => void;
    setActiveTab: (tab: TabType) => void;

    // Panels
    showRightPanel: boolean;
    showBottomPanel: boolean;
    toggleRightPanel: () => void;
    toggleBottomPanel: () => void;

    // Sizes
    sidebarWidth: number;
    rightPanelWidth: number;
    bottomPanelHeight: number;
    setSidebarWidth: (width: number) => void;
    setRightPanelWidth: (width: number) => void;
    setBottomPanelHeight: (height: number) => void;

    // Modals
    showAddProjectModal: boolean;
    showSettingsModal: boolean;
    setShowAddProjectModal: (show: boolean) => void;
    setShowSettingsModal: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    // Views
    activeView: 'explorer',
    activeTab: 'chat',
    setActiveView: (view) => set({ activeView: view }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Panels
    showRightPanel: true,
    showBottomPanel: false,
    toggleRightPanel: () => set((s) => ({ showRightPanel: !s.showRightPanel })),
    toggleBottomPanel: () => set((s) => ({ showBottomPanel: !s.showBottomPanel })),

    // Sizes
    sidebarWidth: 260,
    rightPanelWidth: 320,
    bottomPanelHeight: 200,
    setSidebarWidth: (width) => set({ sidebarWidth: width }),
    setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
    setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),

    // Modals
    showAddProjectModal: false,
    showSettingsModal: false,
    setShowAddProjectModal: (show) => set({ showAddProjectModal: show }),
    setShowSettingsModal: (show) => set({ showSettingsModal: show })
}));
