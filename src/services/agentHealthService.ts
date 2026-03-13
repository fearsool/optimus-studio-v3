import {
    WorkflowNode,
    AgentHealthState,
    AgentHealthStatus,
    HealthCheckResult,
    RecoveryAction,
    AgentMetrics,
    StepStatus
} from '../types';

// ============================================
// AGENT HEALTH SERVICE
// Scalable monitoring for 30-40+ agents
// ============================================

export class AgentHealthService {
    // Configuration
    private heartbeatInterval = 5000; // 5 seconds
    private failureThreshold = 5; // Circuit breaker after 5 failures
    private recoveryTimeout = 30000; // 30 seconds circuit breaker reset
    private maxRetries = 3;
    private retryDelay = 1000; // 1 second between retries
    private warningThreshold = 2; // Failures before warning
    private responseTimeWarning = 5000; // 5 seconds
    private responseTimeCritical = 15000; // 15 seconds

    // State
    private healthStates: Map<string, AgentHealthState> = new Map();
    private recoveryHistory: RecoveryAction[] = [];
    private monitoringInterval: ReturnType<typeof setInterval> | null = null;
    private isMonitoring = false;
    private startTime: number = Date.now();

    // Callbacks
    public onHealthChange: ((state: AgentHealthState) => void) | null = null;
    public onRecoveryAction: ((action: RecoveryAction) => void) | null = null;
    public onMetricsUpdate: ((metrics: AgentMetrics) => void) | null = null;
    public onCriticalAlert: ((nodeId: string, message: string) => void) | null = null;

    // ============================================
    // INITIALIZATION
    // ============================================

    initializeAgents(nodes: WorkflowNode[]): void {
        nodes.forEach(node => {
            this.healthStates.set(node.id, this.createInitialHealthState(node));
        });
    }

    private createInitialHealthState(node: WorkflowNode): AgentHealthState {
        return {
            nodeId: node.id,
            nodeName: node.title,
            status: AgentHealthStatus.HEALTHY,
            lastHeartbeat: Date.now(),
            consecutiveFailures: 0,
            totalExecutions: 0,
            successfulExecutions: 0,
            successRate: 100,
            averageResponseTime: 0,
            lastResponseTime: 0,
            circuitBreakerOpen: false,
            circuitBreakerResetTime: null,
            recoveryAttempts: 0,
            maxRecoveryAttempts: this.maxRetries,
            lastError: null,
            fallbackNodeId: null,
            queuedTasks: 0,
            memoryUsage: Math.random() * 30 + 10, // Simulated
            cpuLoad: Math.random() * 40 + 5 // Simulated
        };
    }

    // ============================================
    // MONITORING
    // ============================================

    startMonitoring(nodes: WorkflowNode[]): void {
        if (this.isMonitoring) return;

        this.initializeAgents(nodes);
        this.isMonitoring = true;
        this.startTime = Date.now();

        this.monitoringInterval = setInterval(() => {
            this.performHealthChecks();
            this.checkCircuitBreakers();
            this.updateMetrics();
        }, this.heartbeatInterval);
    }

    stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
    }

    private performHealthChecks(): void {
        this.healthStates.forEach((state, nodeId) => {
            // Update heartbeat
            const newState = { ...state, lastHeartbeat: Date.now() };

            // Simulate resource usage fluctuation
            newState.memoryUsage = Math.max(5, Math.min(95, state.memoryUsage + (Math.random() - 0.5) * 10));
            newState.cpuLoad = Math.max(2, Math.min(90, state.cpuLoad + (Math.random() - 0.5) * 15));

            // Check for warnings based on resource usage
            if (newState.cpuLoad > 80 || newState.memoryUsage > 85) {
                if (newState.status === AgentHealthStatus.HEALTHY) {
                    newState.status = AgentHealthStatus.WARNING;
                }
            }

            this.healthStates.set(nodeId, newState);
            this.onHealthChange?.(newState);
        });
    }

    private checkCircuitBreakers(): void {
        const now = Date.now();
        this.healthStates.forEach((state, nodeId) => {
            if (state.circuitBreakerOpen && state.circuitBreakerResetTime) {
                if (now >= state.circuitBreakerResetTime) {
                    this.resetCircuitBreaker(nodeId);
                }
            }
        });
    }

    // ============================================
    // EXECUTION WITH RETRY & RECOVERY
    // ============================================

    async executeWithRetry<T>(
        node: WorkflowNode,
        executor: () => Promise<T>,
        onRetry?: (attempt: number, error: Error) => void
    ): Promise<{ success: boolean; result?: T; error?: string; attempts: number }> {
        const state = this.healthStates.get(node.id);

        // Check circuit breaker
        if (state?.circuitBreakerOpen) {
            return {
                success: false,
                error: `Circuit breaker açık: ${node.title}. ${Math.ceil((state.circuitBreakerResetTime! - Date.now()) / 1000)}sn sonra tekrar denenecek.`,
                attempts: 0
            };
        }

        let attempts = 0;
        let lastError: Error | null = null;

        while (attempts < this.maxRetries) {
            attempts++;
            const startTime = Date.now();

            try {
                const result = await executor();
                const responseTime = Date.now() - startTime;

                this.recordSuccess(node.id, responseTime);
                return { success: true, result, attempts };

            } catch (error: any) {
                lastError = error;
                const responseTime = Date.now() - startTime;

                this.recordFailure(node.id, error.message, responseTime);
                onRetry?.(attempts, error);

                // Wait before retry (exponential backoff)
                if (attempts < this.maxRetries) {
                    await this.delay(this.retryDelay * Math.pow(2, attempts - 1));
                }
            }
        }

        // All retries failed - attempt recovery
        await this.triggerRecovery(node.id, 'retry');

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
            attempts
        };
    }

    // ============================================
    // SUCCESS/FAILURE RECORDING
    // ============================================

    recordSuccess(nodeId: string, responseTime: number): void {
        const state = this.healthStates.get(nodeId);
        if (!state) return;

        const newState: AgentHealthState = {
            ...state,
            totalExecutions: state.totalExecutions + 1,
            successfulExecutions: state.successfulExecutions + 1,
            consecutiveFailures: 0,
            lastResponseTime: responseTime,
            averageResponseTime: this.calculateAverageResponseTime(state, responseTime),
            successRate: this.calculateSuccessRate(state.successfulExecutions + 1, state.totalExecutions + 1),
            lastHeartbeat: Date.now(),
            lastError: null
        };

        // Update status based on response time
        if (responseTime > this.responseTimeCritical) {
            newState.status = AgentHealthStatus.WARNING;
        } else if (state.status !== AgentHealthStatus.HEALTHY) {
            newState.status = AgentHealthStatus.HEALTHY;
        }

        this.healthStates.set(nodeId, newState);
        this.onHealthChange?.(newState);
    }

    recordFailure(nodeId: string, error: string, responseTime: number): void {
        const state = this.healthStates.get(nodeId);
        if (!state) return;

        const consecutiveFailures = state.consecutiveFailures + 1;
        let newStatus = state.status;

        // Determine new status
        if (consecutiveFailures >= this.failureThreshold) {
            newStatus = AgentHealthStatus.CIRCUIT_OPEN;
        } else if (consecutiveFailures >= this.warningThreshold) {
            newStatus = consecutiveFailures >= 4 ? AgentHealthStatus.CRITICAL : AgentHealthStatus.WARNING;
        }

        const newState: AgentHealthState = {
            ...state,
            totalExecutions: state.totalExecutions + 1,
            consecutiveFailures,
            lastResponseTime: responseTime,
            averageResponseTime: this.calculateAverageResponseTime(state, responseTime),
            successRate: this.calculateSuccessRate(state.successfulExecutions, state.totalExecutions + 1),
            lastHeartbeat: Date.now(),
            lastError: error,
            status: newStatus
        };

        // Open circuit breaker if threshold reached
        if (consecutiveFailures >= this.failureThreshold && !state.circuitBreakerOpen) {
            newState.circuitBreakerOpen = true;
            newState.circuitBreakerResetTime = Date.now() + this.recoveryTimeout;
            newState.status = AgentHealthStatus.CIRCUIT_OPEN;

            this.onCriticalAlert?.(nodeId, `⚠️ ${state.nodeName} için circuit breaker açıldı! ${this.failureThreshold} ardışık hata.`);
        }

        this.healthStates.set(nodeId, newState);
        this.onHealthChange?.(newState);
    }

    // ============================================
    // RECOVERY ACTIONS
    // ============================================

    async triggerRecovery(nodeId: string, type: RecoveryAction['type'] = 'manual'): Promise<RecoveryAction> {
        const state = this.healthStates.get(nodeId);
        const startTime = Date.now();

        if (!state) {
            const action: RecoveryAction = {
                id: crypto.randomUUID(),
                type,
                nodeId,
                nodeName: 'Unknown',
                timestamp: startTime,
                success: false,
                details: 'Agent bulunamadı',
                previousStatus: AgentHealthStatus.OFFLINE,
                newStatus: AgentHealthStatus.OFFLINE,
                duration: 0
            };
            this.recoveryHistory.unshift(action);
            return action;
        }

        const previousStatus = state.status;

        // Update to recovering status
        this.healthStates.set(nodeId, {
            ...state,
            status: AgentHealthStatus.RECOVERING,
            recoveryAttempts: state.recoveryAttempts + 1
        });

        // Simulate recovery process
        await this.delay(500 + Math.random() * 1000);

        // Determine recovery success (higher chance if fewer previous attempts)
        const recoveryChance = Math.max(0.3, 0.9 - (state.recoveryAttempts * 0.15));
        const success = Math.random() < recoveryChance;

        const newStatus = success ? AgentHealthStatus.HEALTHY :
            (state.recoveryAttempts >= state.maxRecoveryAttempts ?
                AgentHealthStatus.OFFLINE : AgentHealthStatus.CRITICAL);

        const action: RecoveryAction = {
            id: crypto.randomUUID(),
            type,
            nodeId,
            nodeName: state.nodeName,
            timestamp: startTime,
            success,
            details: success ?
                `${state.nodeName} başarıyla kurtarıldı` :
                `Kurtarma başarısız (Deneme ${state.recoveryAttempts + 1}/${state.maxRecoveryAttempts})`,
            previousStatus,
            newStatus,
            duration: Date.now() - startTime
        };

        // Update state
        this.healthStates.set(nodeId, {
            ...state,
            status: newStatus,
            consecutiveFailures: success ? 0 : state.consecutiveFailures,
            circuitBreakerOpen: success ? false : state.circuitBreakerOpen,
            circuitBreakerResetTime: success ? null : state.circuitBreakerResetTime,
            lastError: success ? null : state.lastError,
            recoveryAttempts: success ? 0 : state.recoveryAttempts + 1
        });

        this.recoveryHistory.unshift(action);
        if (this.recoveryHistory.length > 50) {
            this.recoveryHistory = this.recoveryHistory.slice(0, 50);
        }

        this.onRecoveryAction?.(action);
        this.onHealthChange?.(this.healthStates.get(nodeId)!);

        return action;
    }

    resetCircuitBreaker(nodeId: string): void {
        const state = this.healthStates.get(nodeId);
        if (!state) return;

        const newState: AgentHealthState = {
            ...state,
            circuitBreakerOpen: false,
            circuitBreakerResetTime: null,
            status: AgentHealthStatus.HEALTHY,
            consecutiveFailures: 0,
            recoveryAttempts: 0
        };

        this.healthStates.set(nodeId, newState);

        const action: RecoveryAction = {
            id: crypto.randomUUID(),
            type: 'circuit_reset',
            nodeId,
            nodeName: state.nodeName,
            timestamp: Date.now(),
            success: true,
            details: `${state.nodeName} circuit breaker sıfırlandı`,
            previousStatus: state.status,
            newStatus: AgentHealthStatus.HEALTHY,
            duration: 0
        };

        this.recoveryHistory.unshift(action);
        this.onRecoveryAction?.(action);
        this.onHealthChange?.(newState);
    }

    async recoverAllCritical(): Promise<RecoveryAction[]> {
        const criticalAgents = Array.from(this.healthStates.values())
            .filter(s => s.status === AgentHealthStatus.CRITICAL ||
                s.status === AgentHealthStatus.CIRCUIT_OPEN ||
                s.status === AgentHealthStatus.OFFLINE);

        const actions: RecoveryAction[] = [];

        for (const agent of criticalAgents) {
            const action = await this.triggerRecovery(agent.nodeId, 'manual');
            actions.push(action);
        }

        return actions;
    }

    resetAllAgents(): void {
        this.healthStates.forEach((state, nodeId) => {
            this.healthStates.set(nodeId, {
                ...state,
                status: AgentHealthStatus.HEALTHY,
                consecutiveFailures: 0,
                circuitBreakerOpen: false,
                circuitBreakerResetTime: null,
                lastError: null,
                recoveryAttempts: 0
            });
        });
        this.recoveryHistory = [];
    }

    // ============================================
    // GETTERS
    // ============================================

    getAgentHealth(nodeId: string): AgentHealthState | undefined {
        return this.healthStates.get(nodeId);
    }

    getAllHealthStates(): AgentHealthState[] {
        return Array.from(this.healthStates.values());
    }

    getRecoveryHistory(): RecoveryAction[] {
        return this.recoveryHistory;
    }

    getMetrics(): AgentMetrics {
        const states = Array.from(this.healthStates.values());
        const total = states.length;

        if (total === 0) {
            return {
                totalAgents: 0,
                healthyAgents: 0,
                warningAgents: 0,
                criticalAgents: 0,
                offlineAgents: 0,
                recoveringAgents: 0,
                averageSuccessRate: 100,
                averageResponseTime: 0,
                totalExecutions: 0,
                totalRecoveries: this.recoveryHistory.length,
                successfulRecoveries: this.recoveryHistory.filter(r => r.success).length,
                uptime: 100,
                lastUpdated: Date.now(),
                systemLoad: 'low'
            };
        }

        const healthy = states.filter(s => s.status === AgentHealthStatus.HEALTHY).length;
        const warning = states.filter(s => s.status === AgentHealthStatus.WARNING).length;
        const critical = states.filter(s => s.status === AgentHealthStatus.CRITICAL || s.status === AgentHealthStatus.CIRCUIT_OPEN).length;
        const offline = states.filter(s => s.status === AgentHealthStatus.OFFLINE).length;
        const recovering = states.filter(s => s.status === AgentHealthStatus.RECOVERING).length;

        const avgSuccessRate = states.reduce((acc, s) => acc + s.successRate, 0) / total;
        const avgResponseTime = states.reduce((acc, s) => acc + s.averageResponseTime, 0) / total;
        const totalExecs = states.reduce((acc, s) => acc + s.totalExecutions, 0);

        const healthRatio = healthy / total;
        let systemLoad: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (healthRatio < 0.5) systemLoad = 'critical';
        else if (healthRatio < 0.7) systemLoad = 'high';
        else if (healthRatio < 0.9) systemLoad = 'medium';

        const uptime = ((total - offline) / total) * 100;

        return {
            totalAgents: total,
            healthyAgents: healthy,
            warningAgents: warning,
            criticalAgents: critical,
            offlineAgents: offline,
            recoveringAgents: recovering,
            averageSuccessRate: avgSuccessRate,
            averageResponseTime: avgResponseTime,
            totalExecutions: totalExecs,
            totalRecoveries: this.recoveryHistory.length,
            successfulRecoveries: this.recoveryHistory.filter(r => r.success).length,
            uptime,
            lastUpdated: Date.now(),
            systemLoad
        };
    }

    private updateMetrics(): void {
        const metrics = this.getMetrics();
        this.onMetricsUpdate?.(metrics);
    }

    // ============================================
    // UTILITIES
    // ============================================

    private calculateSuccessRate(successful: number, total: number): number {
        if (total === 0) return 100;
        return Math.round((successful / total) * 100);
    }

    private calculateAverageResponseTime(state: AgentHealthState, newTime: number): number {
        if (state.totalExecutions === 0) return newTime;
        return Math.round((state.averageResponseTime * state.totalExecutions + newTime) / (state.totalExecutions + 1));
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    getUptimeSeconds(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

// Singleton instance
export const agentHealthService = new AgentHealthService();
