"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
class EventBus {
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.eventHistory = [];
        this.maxHistory = 1000;
        this.setupDefaultListeners();
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    emit(eventType, data, source, correlationId) {
        const event = {
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
    on(eventType, listener) {
        this.emitter.on(eventType, listener);
    }
    off(eventType, listener) {
        this.emitter.off(eventType, listener);
    }
    getRecentEvents(limit = 50) {
        return this.eventHistory.slice(-limit);
    }
    setupDefaultListeners() {
        // Log all events in dev mode
        if (process.env.NODE_ENV === 'development') {
            this.on('*', (event) => {
                // console.log(`📢 [${event.type}]`, event.data); // Too noisy?
            });
        }
    }
}
exports.EventBus = EventBus;
