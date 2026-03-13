export class EmergencyController {
    private isEmergency: boolean = false;

    triggerKillSwitch(reason: string) {
        console.error(`🚨 EMERGENCY KILL SWITCH TRIGGERED: ${reason}`);
        this.isEmergency = true;
        // In a real system, this would kill active playwright sessions and ollama processes
        process.emit('SIGTERM');
    }

    isSystemSafe(): boolean {
        return !this.isEmergency;
    }
}
