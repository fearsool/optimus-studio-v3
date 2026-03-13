"use strict";
/**
 * 📝 OPTIMUS CONTEXT TRACKER
 * ==========================
 * Bağlam izleme modülü (Multi-turn conversation tracking)
 *
 * GÖREV:
 * - Aktif konuşma bağlamını yönet
 * - Entity'leri oturumlar arası koru
 * - Intent geçmişini takip et
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextTracker = void 0;
const DEFAULT_CONFIG = {
    maxHistorySize: 20,
    sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
    entityPersistenceMs: 60 * 60 * 1000 // 1 hour
};
// ============================================
// CONTEXT TRACKER CLASS
// ============================================
class OptimusContextTracker {
    constructor(config = {}) {
        this.sessions = new Map();
        this.globalEntities = new Map();
        this.cleanupTimer = null;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startCleanupTimer();
    }
    /**
     * Get or create session context
     */
    getContext(sessionId) {
        const id = sessionId || 'default';
        if (!this.sessions.has(id)) {
            this.sessions.set(id, this.createNewContext(id));
        }
        const context = this.sessions.get(id);
        context.lastActivityAt = new Date();
        return context;
    }
    /**
     * Create new conversation context
     */
    createNewContext(sessionId) {
        return {
            sessionId,
            turnCount: 0,
            lastIntent: null,
            entities: new Map(),
            history: [],
            startedAt: new Date(),
            lastActivityAt: new Date()
        };
    }
    /**
     * Update context with new intent
     */
    updateContext(sessionId, intent) {
        const context = this.getContext(sessionId);
        // Update turn count
        context.turnCount++;
        // Update last intent
        context.lastIntent = intent;
        // Add to history
        context.history.push(intent);
        // Trim history if needed
        if (context.history.length > this.config.maxHistorySize) {
            context.history = context.history.slice(-this.config.maxHistorySize);
        }
        // Merge entities
        for (const [key, value] of Object.entries(intent.entities)) {
            context.entities.set(key, value);
            this.setGlobalEntity(key, value);
        }
        context.lastActivityAt = new Date();
    }
    /**
     * Get entity value (session or global)
     */
    getEntity(sessionId, key) {
        const context = this.getContext(sessionId);
        // Try session entities first
        if (context.entities.has(key)) {
            return context.entities.get(key);
        }
        // Try global entities
        const global = this.globalEntities.get(key);
        if (global && global.expiresAt > new Date()) {
            return global.value;
        }
        return undefined;
    }
    /**
     * Set session entity
     */
    setEntity(sessionId, key, value) {
        const context = this.getContext(sessionId);
        context.entities.set(key, value);
    }
    /**
     * Set global entity
     */
    setGlobalEntity(key, value) {
        this.globalEntities.set(key, {
            value,
            expiresAt: new Date(Date.now() + this.config.entityPersistenceMs)
        });
    }
    /**
     * Check if we're in a multi-turn conversation
     */
    isMultiTurn(sessionId) {
        const context = this.getContext(sessionId);
        return context.turnCount > 1;
    }
    /**
     * Get conversation history
     */
    getHistory(sessionId, limit) {
        const context = this.getContext(sessionId);
        const history = context.history;
        if (limit) {
            return history.slice(-limit);
        }
        return [...history];
    }
    /**
     * Get last N intents
     */
    getLastIntents(sessionId, n = 3) {
        return this.getHistory(sessionId, n);
    }
    /**
     * Check if context has specific intent in history
     */
    hasIntentInHistory(sessionId, intentAction) {
        const history = this.getHistory(sessionId);
        return history.some(intent => intent.action === intentAction);
    }
    /**
     * Get context summary for AI calls
     */
    getSummary(sessionId) {
        const context = this.getContext(sessionId);
        const parts = [];
        // Turn info
        parts.push(`Turn ${context.turnCount}`);
        // Last intent
        if (context.lastIntent) {
            parts.push(`Last: ${context.lastIntent.action}`);
        }
        // Recent entities
        const entities = Array.from(context.entities.entries())
            .slice(-5)
            .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
            .join(', ');
        if (entities) {
            parts.push(`Entities: ${entities}`);
        }
        return parts.join(' | ');
    }
    /**
     * Clear session context
     */
    clearContext(sessionId) {
        this.sessions.delete(sessionId);
    }
    /**
     * Clear all contexts
     */
    clearAll() {
        this.sessions.clear();
        this.globalEntities.clear();
    }
    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    /**
     * Cleanup expired sessions and entities
     */
    cleanup() {
        const now = new Date();
        // Cleanup sessions
        for (const [sessionId, context] of this.sessions.entries()) {
            const age = now.getTime() - context.lastActivityAt.getTime();
            if (age > this.config.sessionTimeoutMs) {
                this.sessions.delete(sessionId);
                console.log(`[ContextTracker] Session expired: ${sessionId}`);
            }
        }
        // Cleanup global entities
        for (const [key, entity] of this.globalEntities.entries()) {
            if (entity.expiresAt < now) {
                this.globalEntities.delete(key);
            }
        }
    }
    /**
     * Get all active session IDs
     */
    getActiveSessions() {
        return Array.from(this.sessions.keys());
    }
    /**
     * Get session stats
     */
    getStats() {
        return {
            sessions: this.sessions.size,
            globalEntities: this.globalEntities.size
        };
    }
    /**
     * Destroy tracker (cleanup)
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.clearAll();
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.contextTracker = new OptimusContextTracker();
exports.default = exports.contextTracker;
