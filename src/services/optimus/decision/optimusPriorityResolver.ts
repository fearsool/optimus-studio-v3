/**
 * 📊 OPTIMUS PRIORITY RESOLVER
 * ============================
 * Öncelik belirleme modülü
 * 
 * PRİORİTE SEVİYELERİ:
 * - P0: Acil (anında işle)
 * - P1: Önemli (öncelikli işle)
 * - P2: Normal (sıraya al)
 * - P3: Düşük (boşta işle)
 */

import {
    PriorityLevel,
    ResolvedIntent,
    RiskAssessment,
    RiskLevel,
    IntentType
} from '../core/optimusTypes';
import { optimusCore } from '../core/optimusCore';

// ============================================
// PRIORITY RULES
// ============================================

interface PriorityRule {
    name: string;
    condition: (intent: ResolvedIntent, risk: RiskAssessment) => boolean;
    priority: PriorityLevel;
    reason: string;
}

const PRIORITY_RULES: PriorityRule[] = [
    // P0 Rules (Immediate)
    {
        name: 'crisis_intent',
        condition: (intent) => intent.action.includes('CRISIS') || intent.action.includes('EMERGENCY'),
        priority: 'P0',
        reason: 'Crisis/Emergency intent'
    },
    {
        name: 'critical_risk',
        condition: (_, risk) => risk.level === 'CRITICAL',
        priority: 'P0',
        reason: 'Critical risk level'
    },
    {
        name: 'stop_command',
        condition: (intent) => intent.action.includes('STOP') || intent.action.includes('KILL'),
        priority: 'P0',
        reason: 'Stop/Kill command requires immediate attention'
    },

    // P1 Rules (Important)
    {
        name: 'high_risk',
        condition: (_, risk) => risk.level === 'HIGH',
        priority: 'P1',
        reason: 'High risk level'
    },
    {
        name: 'system_intent',
        condition: (intent) => intent.type === 'SYSTEM',
        priority: 'P1',
        reason: 'System-level intent'
    },
    {
        name: 'financial_action',
        condition: (intent) => ['CREATE_PRODUCT', 'SET_PRICING', 'REFUND'].includes(intent.action),
        priority: 'P1',
        reason: 'Financial action'
    },

    // P2 Rules (Normal)
    {
        name: 'strategic_intent',
        condition: (intent) => intent.type === 'STRATEGIC',
        priority: 'P2',
        reason: 'Strategic intent'
    },
    {
        name: 'medium_risk',
        condition: (_, risk) => risk.level === 'MEDIUM',
        priority: 'P2',
        reason: 'Medium risk level'
    },

    // P3 Rules (Low)
    {
        name: 'info_request',
        condition: (intent) => intent.action.startsWith('GET_') || intent.action.startsWith('CHECK_'),
        priority: 'P3',
        reason: 'Information request'
    },
    {
        name: 'help_request',
        condition: (intent) => intent.action === 'GET_HELP' || intent.action === 'EXPLAIN',
        priority: 'P3',
        reason: 'Help/explanation request'
    }
];

// ============================================
// PRIORITY QUEUE
// ============================================

interface QueuedItem<T> {
    item: T;
    priority: PriorityLevel;
    addedAt: Date;
}

class PriorityQueue<T> {
    private items: QueuedItem<T>[] = [];

    private priorityValue(p: PriorityLevel): number {
        const values: Record<PriorityLevel, number> = {
            'P0': 0,
            'P1': 1,
            'P2': 2,
            'P3': 3
        };
        return values[p];
    }

    enqueue(item: T, priority: PriorityLevel): void {
        const queuedItem: QueuedItem<T> = { item, priority, addedAt: new Date() };

        // Find insertion point
        let insertIndex = this.items.length;
        for (let i = 0; i < this.items.length; i++) {
            if (this.priorityValue(priority) < this.priorityValue(this.items[i].priority)) {
                insertIndex = i;
                break;
            }
        }

        this.items.splice(insertIndex, 0, queuedItem);
    }

    dequeue(): QueuedItem<T> | undefined {
        return this.items.shift();
    }

    peek(): QueuedItem<T> | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    clear(): void {
        this.items = [];
    }

    getByPriority(priority: PriorityLevel): QueuedItem<T>[] {
        return this.items.filter(i => i.priority === priority);
    }
}

// ============================================
// PRIORITY RESOLVER CLASS
// ============================================

class OptimusPriorityResolver {
    private queue: PriorityQueue<ResolvedIntent> = new PriorityQueue();

    /**
     * Resolve priority for an intent
     */
    resolve(intent: ResolvedIntent, risk: RiskAssessment): PriorityLevel {
        // Check rules in order (first match wins)
        for (const rule of PRIORITY_RULES) {
            if (rule.condition(intent, risk)) {
                console.log(`[PriorityResolver] Matched rule: ${rule.name} -> ${rule.priority}`);
                return rule.priority;
            }
        }

        // Default to P2
        return 'P2';
    }

    /**
     * Adjust priority based on context
     */
    adjustPriority(
        basePriority: PriorityLevel,
        factors: {
            waitTime?: number;      // ms waiting in queue
            retryCount?: number;    // number of retries
            userVIP?: boolean;      // VIP user
        }
    ): PriorityLevel {
        let adjustment = 0;

        // Increase priority if waiting too long
        if (factors.waitTime && factors.waitTime > 30000) {
            adjustment--;
        }

        // Increase priority on retries
        if (factors.retryCount && factors.retryCount > 0) {
            adjustment--;
        }

        // VIP users get priority bump
        if (factors.userVIP) {
            adjustment--;
        }

        const priorities: PriorityLevel[] = ['P0', 'P1', 'P2', 'P3'];
        const currentIndex = priorities.indexOf(basePriority);
        const newIndex = Math.max(0, Math.min(3, currentIndex + adjustment));

        return priorities[newIndex];
    }

    /**
     * Queue intent for processing
     */
    queueIntent(intent: ResolvedIntent, priority: PriorityLevel): void {
        this.queue.enqueue(intent, priority);
    }

    /**
     * Get next intent from queue
     */
    getNext(): QueuedItem<ResolvedIntent> | undefined {
        return this.queue.dequeue();
    }

    /**
     * Peek next intent without removing
     */
    peekNext(): QueuedItem<ResolvedIntent> | undefined {
        return this.queue.peek();
    }

    /**
     * Get queue stats
     */
    getQueueStats(): Record<PriorityLevel, number> {
        return {
            'P0': this.queue.getByPriority('P0').length,
            'P1': this.queue.getByPriority('P1').length,
            'P2': this.queue.getByPriority('P2').length,
            'P3': this.queue.getByPriority('P3').length
        };
    }

    /**
     * Check if queue has urgent items
     */
    hasUrgent(): boolean {
        const next = this.queue.peek();
        return next?.priority === 'P0';
    }

    /**
     * Get queue size
     */
    queueSize(): number {
        return this.queue.size();
    }

    /**
     * Clear queue
     */
    clearQueue(): void {
        this.queue.clear();
    }

    /**
     * Get priority display string
     */
    getPriorityDisplay(priority: PriorityLevel): string {
        const displays: Record<PriorityLevel, string> = {
            'P0': '🚨 URGENT',
            'P1': '⚡ IMPORTANT',
            'P2': '📌 NORMAL',
            'P3': 'ℹ️ LOW'
        };
        return displays[priority];
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const priorityResolver = new OptimusPriorityResolver();
export default priorityResolver;
