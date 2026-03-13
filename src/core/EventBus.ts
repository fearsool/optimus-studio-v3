import { EventEmitter } from 'events';

export type EventType =
    | 'agent:started'
    | 'agent:stopped'
    | 'agent:pause'
    | 'agent:resume'
    | 'task:created'
    | 'task:completed'
    | 'task:failed'
    | 'error:occurred'
    | 'learning:cycle:start'
    | 'learning:cycle:complete'
    | 'security:audit:start'
    | 'security:audit:complete'
    | 'factory:product:created'
    | 'factory:sale:completed'
    | 'product:created'
    | 'whatsapp:message:received'
    | 'whatsapp:message:sent'
    | 'system:health:check'
    | 'system:init'
    | 'system:status'
    | 'system:error'
    | 'agent:error'
    | 'emergency:protocol:activated';

export interface EventData {
    type: EventType;
    timestamp: Date;
    data: any;
    source: string;
    correlationId?: string;
}

export class EventBus {
    private static instance: EventBus;
    private emitter = new EventEmitter();
    private eventHistory: EventData[] = [];
    private maxHistory = 1000;

    private constructor() {
        this.setupDefaultListeners();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    emit(eventType: EventType, data: any, source: string, correlationId?: string): void {
        const event: EventData = {
            type: eventType,
            timestamp: new Date(),
            data,
            source,
            correlationId
        };

        // History
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }

        // Emit
        this.emitter.emit(eventType, event);
        this.emitter.emit('*', event); // Wildcard
    }

    on(eventType: EventType | '*', listener: (event: EventData) => void): void {
        this.emitter.on(eventType, listener);
    }

    off(eventType: EventType, listener: (event: EventData) => void): void {
        this.emitter.off(eventType, listener);
    }

    getRecentEvents(limit: number = 50): EventData[] {
        return this.eventHistory.slice(-limit);
    }

    private setupDefaultListeners(): void {
        // Log all events in dev mode
        if (process.env.NODE_ENV === 'development') {
            this.on('*', (event) => {
                // console.log(`📢 [${event.type}]`, event.data); // Too noisy?
            });
        }
    }
}
