"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyController = void 0;
class EmergencyController {
    constructor() {
        this.isEmergency = false;
    }
    triggerKillSwitch(reason) {
        console.error(`🚨 EMERGENCY KILL SWITCH TRIGGERED: ${reason}`);
        this.isEmergency = true;
        // In a real system, this would kill active playwright sessions and ollama processes
        process.emit('SIGTERM');
    }
    isSystemSafe() {
        return !this.isEmergency;
    }
}
exports.EmergencyController = EmergencyController;
