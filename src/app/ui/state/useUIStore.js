"use strict";
/**
 * 🎨 UI STORE - UI state management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUIStore = void 0;
const zustand_1 = require("zustand");
exports.useUIStore = (0, zustand_1.create)((set) => ({
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
