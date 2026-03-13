/**
 * Execution Core V3 - Deterministic DAG Engine
 * ============================================
 * 
 * Features:
 * - Adjacency List Graph (Nodes + Edges)
 * - Deterministic Execution (Input Hashing + Idempotency)
 * - Event-Driven Loop Logic
 * - Failure Policy DSL (Retry/Backoff)
 */

import supabaseService from './supabaseService';
import { generateHash, generateIdempotencyKey } from './utils/hashUtil';
import { ExecutionState, isValidTransition } from '../types';

// --- Types ---

export interface NodeFailurePolicy {
    retry: {
        maxAttempts: number;
        backoff: 'constant' | 'exponential';
        initialDelay: number;
    };
    onFail: 'continue' | 'abort'; // fallback future implementation
}

export interface ExecutionNode {
    id: string;
    type: string;
    config: any;
    failurePolicy?: NodeFailurePolicy;
}

export interface ExecutionEdge {
    source: string;
    target: string;
    type: 'main' | 'true' | 'false' | string; // Branching support
}

export class ExecutionGraph {
    nodes: Map<string, ExecutionNode> = new Map();
    edges: Map<string, ExecutionEdge[]> = new Map(); // Source -> Edges
    incomingEdges: Map<string, ExecutionEdge[]> = new Map(); // Target -> Edges
    startNodeId: string | null = null;

    constructor(blueprint: any) {
        this.parseBlueprint(blueprint);
    }

    private parseBlueprint(blueprint: any) {
        if (!blueprint.nodes) return;

        // 1. Parse Nodes
        blueprint.nodes.forEach((n: any) => {
            this.nodes.set(n.id, {
                id: n.id,
                type: n.type,
                config: n.config || {},
                failurePolicy: n.failurePolicy || {
                    retry: { maxAttempts: 3, backoff: 'exponential', initialDelay: 1000 },
                    onFail: 'abort'
                }
            });
            // Assume first node is start for now (unless explicit trigger)
            if (!this.startNodeId) this.startNodeId = n.id;
        });

        // 2. Parse Edges (Adjacency)
        // Check for V3 explicit edges
        if (blueprint.edges && blueprint.edges.length > 0) {
            blueprint.edges.forEach((e: any) => {
                this.addEdge(e.source, e.target, e.type || 'main');
            });
        } else {
            // V2 Backward Compatibility: Parse `connections` from nodes
            let foundConnections = false;
            blueprint.nodes.forEach((n: any) => {
                if (n.connections && n.connections.length > 0) {
                    foundConnections = true;
                    n.connections.forEach((c: any) => {
                        // Map condition to edge type (important for branching)
                        // If no condition, assume 'main'.
                        // Note: Logic Gates might use targetId matching in old App.tsx, 
                        // but here we try to support standard branching.
                        // Ideally, we'd enable 'true'/'false' keys.
                        // tailored for existing data:
                        this.addEdge(n.id, c.targetId, c.condition || 'main');
                    });
                }
            });

            if (!foundConnections) {
                // Legacy Linear Fallback (Input Array Order)
                // Only if NO connections exist (e.g. very old templates)
                const nodeIds = Array.from(this.nodes.keys());
                for (let i = 0; i < nodeIds.length - 1; i++) {
                    this.addEdge(nodeIds[i], nodeIds[i + 1], 'main');
                }
            }
        }
    }

    addEdge(source: string, target: string, type: string = 'main') {
        const edge = { source, target, type };

        if (!this.edges.has(source)) this.edges.set(source, []);
        this.edges.get(source)?.push(edge);

        if (!this.incomingEdges.has(target)) this.incomingEdges.set(target, []);
        this.incomingEdges.get(target)?.push(edge);
    }

    getOutgoingEdges(nodeId: string): ExecutionEdge[] {
        return this.edges.get(nodeId) || [];
    }

    getIncomingEdges(nodeId: string): ExecutionEdge[] {
        return this.incomingEdges.get(nodeId) || [];
    }

    getNode(id: string): ExecutionNode | undefined {
        return this.nodes.get(id);
    }
}

// --- Engine ---

export class ExecutionEngine {

    /**
     * Transition execution state with validation
     */
    async transitionState(executionId: string, newState: ExecutionState, reason?: string): Promise<boolean> {
        try {
            const currentState = await supabaseService.getExecutionState(executionId);
            if (!currentState) {
                console.error(`[Engine] Execution ${executionId} not found`);
                return false;
            }

            const fromState = currentState as ExecutionState;

            if (!isValidTransition(fromState, newState)) {
                console.error(`[Engine] Invalid transition: ${fromState} → ${newState}`);
                return false;
            }

            await supabaseService.updateExecutionState(executionId, newState, reason);
            console.log(`[Engine] State transition: ${fromState} → ${newState}${reason ? ` (${reason})` : ''}`);
            return true;
        } catch (error) {
            console.error(`[Engine] State transition error:`, error);
            return false;
        }
    }

    /**
     * Start a new workflow execution
     */
    async startExecution(workflowId: string, blueprint: any, input: any, apiKeys: any = {}): Promise<string | null> {
        // 1. Init
        const executionId = await supabaseService.createExecution(workflowId, input);
        if (!executionId) return null;

        console.log(`[Engine] Starting Execution ${executionId} (V3.1 State Machine)`);

        // 2. Transition to RUNNING state
        await this.transitionState(executionId, ExecutionState.RUNNING, 'Execution started');

        const graph = new ExecutionGraph(blueprint);

        if (graph.startNodeId) {
            // 3. Dispatch Start Node
            await this.dispatchNode(executionId, graph, graph.startNodeId, input, apiKeys);
        } else {
            // No start node = immediate success
            await this.transitionState(executionId, ExecutionState.SUCCESS, 'No nodes to execute');
        }
        return executionId;
    }

    /**
     * The "Event Loop" - Triggered when a step completes
     */
    async processEvent(executionId: string, blueprint: any = null) {
        // 1. Load State & Graph
        const state = await supabaseService.loadExecutionState(executionId);
        if (!state) throw new Error('Execution not found');

        // Fetch blueprint if missing
        if (!blueprint) {
            const bp = await supabaseService.getBlueprintById(state.workflowId);
            if (!bp) throw new Error('Blueprint not found');
            blueprint = bp;
        }

        const graph = new ExecutionGraph(blueprint);

        // Scan for potential next steps based on completed nodes
        const completedNodes = Object.keys(state.steps).filter(id => {
            const s = state.steps[id];
            return s.state === 'SUCCESS' || s.state === 'SKIPPED';
        });

        const candidates = new Set<string>();

        // Find all candidates (children of completed nodes)
        for (const nodeId of completedNodes) {
            const edges = graph.getOutgoingEdges(nodeId);
            for (const edge of edges) {
                const stepState = state.steps[nodeId];

                // Branch Logic Check
                let allowed = false;
                if (edge.type === 'main') allowed = true;
                else if (stepState.output && String(stepState.output._branch) === edge.type) allowed = true;

                if (allowed) candidates.add(edge.target);
            }
        }

        // Process Candidates with Merge Barrier
        for (const candidateId of candidates) {
            // Check existing state to avoid re-dispatch
            const candidateState = state.steps[candidateId];
            if (candidateState && (candidateState.state === 'RUNNING' || candidateState.state === 'SUCCESS' || candidateState.state === 'PENDING')) {
                continue;
            }

            const incoming = graph.getIncomingEdges(candidateId);
            const parentStats = incoming.map(e => ({
                id: e.source,
                state: state.steps[e.source]?.state || 'PENDING',
                output: state.steps[e.source]?.output
            }));

            // Barrier Check
            const anyFailed = parentStats.some(p => p.state === 'FAILED');
            if (anyFailed) {
                // Abort or fail this node
                // await supabaseService.saveStepSnapshot(executionId, candidateId, 'FAILED', null, 'Parent Failed');
                continue;
            }

            const allSuccess = parentStats.every(p => p.state === 'SUCCESS' || p.state === 'SKIPPED');
            if (!allSuccess) {
                // WAIT - Barrier holds
                continue;
            }

            // Merge Inputs
            let mergedInput: any = {};
            if (parentStats.length === 1) {
                mergedInput = parentStats[0].output;
            } else {
                // Named merge strategy: { parentId: output }
                parentStats.forEach(p => mergedInput[p.id] = p.output);
            }

            // Dispatch
            await this.dispatchNode(executionId, graph, candidateId, mergedInput);
        }

        // Check Completion - State Machine Logic
        const allNodes = Array.from(graph.nodes.keys());
        const stepsData = state.steps;

        let runningCount = 0;
        let successCount = 0;
        let failedCount = 0;
        let pendingCount = 0;

        for (const nodeId of allNodes) {
            const stepState = stepsData[nodeId]?.state;
            if (stepState === 'RUNNING' || stepState === 'PENDING') runningCount++;
            else if (stepState === 'SUCCESS' || stepState === 'SKIPPED') successCount++;
            else if (stepState === 'FAILED') failedCount++;
            else pendingCount++;
        }

        // Terminal state decisions
        if (runningCount === 0 && pendingCount === 0) {
            if (failedCount === 0 && successCount > 0) {
                // All done, no failures
                await this.transitionState(executionId, ExecutionState.SUCCESS, `All ${successCount} steps completed`);
            } else if (failedCount > 0 && successCount > 0) {
                // Some failed, some succeeded
                await this.transitionState(executionId, ExecutionState.PARTIAL_SUCCESS, `${successCount} success, ${failedCount} failed`);
            } else if (failedCount > 0 && successCount === 0) {
                // All failed
                await this.transitionState(executionId, ExecutionState.FAILED, `All ${failedCount} steps failed`);
            }
        }
    }

    /**
     * Dispatch logic with Determinism & Idempotency
     */
    private async dispatchNode(executionId: string, graph: ExecutionGraph, nodeId: string, input: any, apiKeys: any = {}) {
        const node = graph.getNode(nodeId);
        if (!node) return;

        // 1. Calculate Input Hash
        const inputHash = generateHash(input);

        // 2. Check Idempotency (Has this run before with this input?)
        const existing = await supabaseService.checkStepIdempotency(executionId, nodeId, inputHash);

        if (existing) {
            console.log(`[Engine] Idempotency Hit: ${nodeId}`);
            // If already done, we ensure it's marked in current state map (it should be)
            // and we rely on next event loop tick to find its children.
            // However, if we just discovered it's done via DB check but our local `state` didn't have it (rare),
            // we might want to ensure consistency. But usually `loadExecutionState` covers it.
            return;
        }

        // 3. Check if already RUNNING or PENDING (avoid double queue)
        // In a real DB, we would use atomic locks. Here, we rely on `checkStepIdempotency` mostly for success.
        // We should also check if it is currently RUNNING/PENDING using `loadExecutionState` ideally.

        // 4. Enqueue (Atomic Lock)
        console.log(`[Engine] Dispatching ${nodeId}`);

        // Try to acquire lock (Insert PENDING)
        // If this fails, it means another worker already dispatched this step.
        const lockAcquired = await supabaseService.tryLockStep(executionId, nodeId, inputHash, 1);

        if (!lockAcquired) {
            console.log(`[Engine] Lock Contention (Skip): ${nodeId}`);
            return;
        }

        const { agentQueue } = await import('./agentQueueService');

        // Wrap context for legacy nodeExecutors compatibility
        const contextWrapper = {
            $input: input,
            $lastOutput: input,
            $apiKeys: apiKeys
        };

        agentQueue.addTask({
            executionId,
            stepId: nodeId,
            type: node.type,
            config: node.config,
            context: contextWrapper,
            priority: 'normal'
        });
    }

    /**
     * Replay execution from a specific step
     * Resets the step and all downstream steps, then re-dispatches
     */
    async replayFromStep(executionId: string, stepId: string, blueprint: any): Promise<boolean> {
        try {
            console.log(`[Engine] Replaying from step ${stepId} in execution ${executionId}`);

            // 1. Reset the step (deletes existing record)
            const resetSuccess = await supabaseService.resetStepForReplay(executionId, stepId);
            if (!resetSuccess) {
                console.error(`[Engine] Failed to reset step ${stepId}`);
                return false;
            }

            // 2. Load current execution state to get context
            const state = await supabaseService.loadExecutionState(executionId);
            if (!state) return false;

            const graph = new ExecutionGraph(blueprint);

            // 3. Find input for this step (from parent outputs)
            const incoming = graph.getIncomingEdges(stepId);
            let mergedInput: any = state.variables?.$input || {};

            if (incoming.length > 0) {
                // Get parent outputs
                const parentOutputs: any = {};
                for (const edge of incoming) {
                    const parentState = state.steps[edge.source];
                    if (parentState?.output) {
                        parentOutputs[edge.source] = parentState.output;
                    }
                }
                // Merge parent outputs as input
                if (Object.keys(parentOutputs).length === 1) {
                    mergedInput = Object.values(parentOutputs)[0];
                } else if (Object.keys(parentOutputs).length > 1) {
                    mergedInput = parentOutputs;
                }
            }

            // 4. Re-dispatch the step
            await this.dispatchNode(executionId, graph, stepId, mergedInput);

            console.log(`[Engine] Successfully replayed from step ${stepId}`);
            return true;
        } catch (error) {
            console.error(`[Engine] Replay error:`, error);
            return false;
        }
    }

    // Alias for compatibility
    async processExecution(executionId: string, blueprint: any = null) {
        return this.processEvent(executionId, blueprint);
    }
}

const executionEngine = new ExecutionEngine();
export default executionEngine;
