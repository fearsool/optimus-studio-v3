"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.priorityResolver = void 0;
const PRIORITY_RULES = [
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
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    priorityValue(p) {
        const values = {
            'P0': 0,
            'P1': 1,
            'P2': 2,
            'P3': 3
        };
        return values[p];
    }
    enqueue(item, priority) {
        const queuedItem = { item, priority, addedAt: new Date() };
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
    dequeue() {
        return this.items.shift();
    }
    peek() {
        return this.items[0];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    clear() {
        this.items = [];
    }
    getByPriority(priority) {
        return this.items.filter(i => i.priority === priority);
    }
}
// ============================================
// PRIORITY RESOLVER CLASS
// ============================================
class OptimusPriorityResolver {
    constructor() {
        this.queue = new PriorityQueue();
    }
    /**
     * Resolve priority for an intent
     */
    resolve(intent, risk) {
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
    adjustPriority(basePriority, factors) {
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
        const priorities = ['P0', 'P1', 'P2', 'P3'];
        const currentIndex = priorities.indexOf(basePriority);
        const newIndex = Math.max(0, Math.min(3, currentIndex + adjustment));
        return priorities[newIndex];
    }
    /**
     * Queue intent for processing
     */
    queueIntent(intent, priority) {
        this.queue.enqueue(intent, priority);
    }
    /**
     * Get next intent from queue
     */
    getNext() {
        return this.queue.dequeue();
    }
    /**
     * Peek next intent without removing
     */
    peekNext() {
        return this.queue.peek();
    }
    /**
     * Get queue stats
     */
    getQueueStats() {
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
    hasUrgent() {
        const next = this.queue.peek();
        return (next === null || next === void 0 ? void 0 : next.priority) === 'P0';
    }
    /**
     * Get queue size
     */
    queueSize() {
        return this.queue.size();
    }
    /**
     * Clear queue
     */
    clearQueue() {
        this.queue.clear();
    }
    /**
     * Get priority display string
     */
    getPriorityDisplay(priority) {
        const displays = {
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
exports.priorityResolver = new OptimusPriorityResolver();
exports.default = exports.priorityResolver;
