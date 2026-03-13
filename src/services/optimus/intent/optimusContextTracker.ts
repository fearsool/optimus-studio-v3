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

import { v4 as uuidv4 } from 'uuid';
import {
    ConversationContext,
    ResolvedIntent,
    MemoryEntry
} from '../core/optimusTypes';

// ============================================
// CONTEXT CONFIGURATION
// ============================================

interface ContextConfig {
    maxHistorySize: number;
    sessionTimeoutMs: number;
    entityPersistenceMs: number;
}

const DEFAULT_CONFIG: ContextConfig = {
    maxHistorySize: 20,
    sessionTimeoutMs: 30 * 60 * 1000,  // 30 minutes
    entityPersistenceMs: 60 * 60 * 1000 // 1 hour
};

// ============================================
// CONTEXT TRACKER CLASS
// ============================================

class OptimusContextTracker {
    private config: ContextConfig;
    private sessions: Map<string, ConversationContext> = new Map();
    private globalEntities: Map<string, { value: any; expiresAt: Date }> = new Map();
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor(config: Partial<ContextConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startCleanupTimer();
    }

    /**
     * Get or create session context
     */
    getContext(sessionId?: string): ConversationContext {
        const id = sessionId || 'default';

        if (!this.sessions.has(id)) {
            this.sessions.set(id, this.createNewContext(id));
        }

        const context = this.sessions.get(id)!;
        context.lastActivityAt = new Date();

        return context;
    }

    /**
     * Create new conversation context
     */
    private createNewContext(sessionId: string): ConversationContext {
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
    updateContext(sessionId: string, intent: ResolvedIntent): void {
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
    getEntity(sessionId: string, key: string): any {
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
    setEntity(sessionId: string, key: string, value: any): void {
        const context = this.getContext(sessionId);
        context.entities.set(key, value);
    }

    /**
     * Set global entity
     */
    setGlobalEntity(key: string, value: any): void {
        this.globalEntities.set(key, {
            value,
            expiresAt: new Date(Date.now() + this.config.entityPersistenceMs)
        });
    }

    /**
     * Check if we're in a multi-turn conversation
     */
    isMultiTurn(sessionId: string): boolean {
        const context = this.getContext(sessionId);
        return context.turnCount > 1;
    }

    /**
     * Get conversation history
     */
    getHistory(sessionId: string, limit?: number): ResolvedIntent[] {
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
    getLastIntents(sessionId: string, n: number = 3): ResolvedIntent[] {
        return this.getHistory(sessionId, n);
    }

    /**
     * Check if context has specific intent in history
     */
    hasIntentInHistory(sessionId: string, intentAction: string): boolean {
        const history = this.getHistory(sessionId);
        return history.some(intent => intent.action === intentAction);
    }

    /**
     * Get context summary for AI calls
     */
    getSummary(sessionId: string): string {
        const context = this.getContext(sessionId);

        const parts: string[] = [];

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
    clearContext(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    /**
     * Clear all contexts
     */
    clearAll(): void {
        this.sessions.clear();
        this.globalEntities.clear();
    }

    /**
     * Start cleanup timer
     */
    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Cleanup expired sessions and entities
     */
    private cleanup(): void {
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
    getActiveSessions(): string[] {
        return Array.from(this.sessions.keys());
    }

    /**
     * Get session stats
     */
    getStats(): { sessions: number; globalEntities: number } {
        return {
            sessions: this.sessions.size,
            globalEntities: this.globalEntities.size
        };
    }

    /**
     * Destroy tracker (cleanup)
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.clearAll();
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const contextTracker = new OptimusContextTracker();
export default contextTracker;
