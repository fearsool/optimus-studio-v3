"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentHealthStatus = exports.validateSellableTemplate = exports.generateTemplateFingerprint = exports.checkSLABreach = exports.validateTransition = exports.getAllowedTransitions = exports.WAITING_TIMEOUT_MS = exports.EXECUTION_TIMEOUT_MS = exports.MAX_RETRIES = exports.STATE_TRANSITION_POLICIES = exports.isValidTransition = exports.VALID_STATE_TRANSITIONS = exports.ExecutionState = exports.StepStatus = exports.NodeType = void 0;
var NodeType;
(function (NodeType) {
    NodeType["AGENT_PLANNER"] = "planner";
    NodeType["RESEARCH_WEB"] = "research";
    NodeType["CONTENT_CREATOR"] = "creator";
    NodeType["MEDIA_ENGINEER"] = "media";
    NodeType["VIDEO_ARCHITECT"] = "video";
    NodeType["TRADING_DESK"] = "trader";
    NodeType["SOCIAL_MANAGER"] = "social";
    NodeType["ANALYST_CRITIC"] = "analyst";
    NodeType["LOGIC_GATE"] = "logic_gate";
    NodeType["EXTERNAL_CONNECTOR"] = "webhook";
    NodeType["STATE_MANAGER"] = "vault_node";
    NodeType["HUMAN_APPROVAL"] = "approval";
    NodeType["HTTP_REQUEST"] = "http_request";
})(NodeType || (exports.NodeType = NodeType = {}));
var StepStatus;
(function (StepStatus) {
    StepStatus["IDLE"] = "idle";
    StepStatus["RUNNING"] = "running";
    StepStatus["SUCCESS"] = "success";
    StepStatus["REJECTED"] = "rejected";
    StepStatus["REPAIRING"] = "repairing";
    StepStatus["WAITING_APPROVAL"] = "waiting";
})(StepStatus || (exports.StepStatus = StepStatus = {}));
// ============================================
// EXECUTION STATE MACHINE (V3.1)
// Production-grade state tracking for sellable automations
// ============================================
var ExecutionState;
(function (ExecutionState) {
    ExecutionState["IDLE"] = "IDLE";
    ExecutionState["RUNNING"] = "RUNNING";
    ExecutionState["WAITING"] = "WAITING";
    ExecutionState["RETRYING"] = "RETRYING";
    ExecutionState["PARTIAL_SUCCESS"] = "PARTIAL_SUCCESS";
    ExecutionState["SUCCESS"] = "SUCCESS";
    ExecutionState["FAILED"] = "FAILED";
    ExecutionState["CANCELLED"] = "CANCELLED"; // Kullanıcı veya sistem tarafından iptal edildi
})(ExecutionState || (exports.ExecutionState = ExecutionState = {}));
// Valid state transitions (State Machine rules)
exports.VALID_STATE_TRANSITIONS = {
    [ExecutionState.IDLE]: [ExecutionState.RUNNING, ExecutionState.CANCELLED],
    [ExecutionState.RUNNING]: [ExecutionState.WAITING, ExecutionState.RETRYING, ExecutionState.SUCCESS, ExecutionState.FAILED, ExecutionState.PARTIAL_SUCCESS, ExecutionState.CANCELLED],
    [ExecutionState.WAITING]: [ExecutionState.RUNNING, ExecutionState.FAILED, ExecutionState.CANCELLED],
    [ExecutionState.RETRYING]: [ExecutionState.RUNNING, ExecutionState.FAILED, ExecutionState.CANCELLED],
    [ExecutionState.PARTIAL_SUCCESS]: [ExecutionState.RUNNING, ExecutionState.SUCCESS, ExecutionState.FAILED, ExecutionState.CANCELLED],
    [ExecutionState.SUCCESS]: [], // Terminal state
    [ExecutionState.FAILED]: [ExecutionState.RETRYING], // Can retry from failed
    [ExecutionState.CANCELLED]: [] // Terminal state
};
// Helper: Check if transition is valid
function isValidTransition(from, to) {
    var _a, _b;
    return (_b = (_a = exports.VALID_STATE_TRANSITIONS[from]) === null || _a === void 0 ? void 0 : _a.includes(to)) !== null && _b !== void 0 ? _b : false;
}
exports.isValidTransition = isValidTransition;
// FORMAL STATE TRANSITION TABLE
exports.STATE_TRANSITION_POLICIES = [
    // IDLE transitions
    { from: ExecutionState.IDLE, to: ExecutionState.RUNNING, trigger: 'ENGINE_START' },
    { from: ExecutionState.IDLE, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },
    // RUNNING transitions
    { from: ExecutionState.RUNNING, to: ExecutionState.SUCCESS, trigger: 'ALL_STEPS_DONE', condition: 'all steps SUCCESS' },
    { from: ExecutionState.RUNNING, to: ExecutionState.FAILED, trigger: 'STEP_FAILED', condition: 'critical step failed' },
    { from: ExecutionState.RUNNING, to: ExecutionState.PARTIAL_SUCCESS, trigger: 'PARTIAL_COMPLETE', condition: 'some success, some failed' },
    { from: ExecutionState.RUNNING, to: ExecutionState.WAITING, trigger: 'WEBHOOK_RECEIVED', condition: 'step requires external input' },
    { from: ExecutionState.RUNNING, to: ExecutionState.RETRYING, trigger: 'STEP_FAILED', condition: 'retries remaining', maxRetries: 3 },
    { from: ExecutionState.RUNNING, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },
    { from: ExecutionState.RUNNING, to: ExecutionState.FAILED, trigger: 'TIMEOUT', timeoutMs: 300000 }, // 5 min
    // WAITING transitions
    { from: ExecutionState.WAITING, to: ExecutionState.RUNNING, trigger: 'WEBHOOK_RECEIVED', condition: 'webhook data received' },
    { from: ExecutionState.WAITING, to: ExecutionState.FAILED, trigger: 'TIMEOUT', timeoutMs: 86400000 }, // 24h max wait
    { from: ExecutionState.WAITING, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },
    // RETRYING transitions
    { from: ExecutionState.RETRYING, to: ExecutionState.RUNNING, trigger: 'RETRY_TRIGGER', condition: 'retry attempt started' },
    { from: ExecutionState.RETRYING, to: ExecutionState.FAILED, trigger: 'RETRY_EXHAUSTED', condition: 'retries > maxRetries', maxRetries: 3 },
    { from: ExecutionState.RETRYING, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },
    // PARTIAL_SUCCESS transitions
    { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.RUNNING, trigger: 'RETRY_TRIGGER', condition: 'user chose to retry failed steps' },
    { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.SUCCESS, trigger: 'ALL_STEPS_DONE', condition: 'all retries succeeded' },
    { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.FAILED, trigger: 'RETRY_EXHAUSTED' },
    { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },
    // FAILED can retry
    { from: ExecutionState.FAILED, to: ExecutionState.RETRYING, trigger: 'RETRY_TRIGGER', condition: 'user manual retry' },
    // Terminal states (SUCCESS, CANCELLED) have no outgoing transitions
];
// Constants
exports.MAX_RETRIES = 3;
exports.EXECUTION_TIMEOUT_MS = 300000; // 5 minutes
exports.WAITING_TIMEOUT_MS = 86400000; // 24 hours
// Helper: Get allowed transitions for a state
function getAllowedTransitions(from) {
    return exports.STATE_TRANSITION_POLICIES.filter(p => p.from === from);
}
exports.getAllowedTransitions = getAllowedTransitions;
// Helper: Validate transition with reason
function validateTransition(from, to, trigger) {
    const policy = exports.STATE_TRANSITION_POLICIES.find(p => p.from === from && p.to === to && p.trigger === trigger);
    if (!policy) {
        return { valid: false, reason: `No policy for ${from} → ${to} via ${trigger}` };
    }
    return { valid: true };
}
exports.validateTransition = validateTransition;
function checkSLABreach(executionTime, sla, avgExecutionTime) {
    const warningThreshold = avgExecutionTime * 2;
    const breachThreshold = sla.maxLatency;
    if (executionTime > breachThreshold) {
        return {
            status: 'SLA_BREACH',
            actualLatency: executionTime,
            maxLatency: breachThreshold,
            breachReason: `Execution exceeded SLA: ${executionTime}ms > ${breachThreshold}ms`,
            refundEligible: sla.refundCondition.onSLABreach
        };
    }
    if (executionTime > warningThreshold) {
        return {
            status: 'SLA_WARNING',
            actualLatency: executionTime,
            maxLatency: breachThreshold,
            breachReason: `Execution slow: ${executionTime}ms > ${warningThreshold}ms (2x avg)`,
            refundEligible: false
        };
    }
    return {
        status: 'OK',
        actualLatency: executionTime,
        maxLatency: breachThreshold,
        refundEligible: false
    };
}
exports.checkSLABreach = checkSLABreach;
// ============================================
// TEMPLATE FINGERPRINT GENERATOR
// ============================================
function generateTemplateFingerprint(blueprint, creatorId) {
    var _a;
    // Create structural hash from nodes
    const nodeSignatures = blueprint.nodes.map(n => { var _a; return `${n.id}:${n.type}:${(_a = n.connections) === null || _a === void 0 ? void 0 : _a.map(c => c.targetId).join(',')}`; }).sort().join('|');
    const structuralHash = simpleHash(nodeSignatures);
    // Create policy hash from config
    const policyData = JSON.stringify({
        version: blueprint.version,
        category: blueprint.category,
        requiredApis: (_a = blueprint.requiredApis) === null || _a === void 0 ? void 0 : _a.map(a => a.name)
    });
    const policyHash = simpleHash(policyData);
    // Combined fingerprint
    const combinedFingerprint = simpleHash(structuralHash + policyHash + creatorId);
    return {
        structuralHash,
        policyHash,
        combinedFingerprint,
        createdAt: new Date().toISOString(),
        creatorId
    };
}
exports.generateTemplateFingerprint = generateTemplateFingerprint;
// Simple hash function for fingerprinting
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}
// Validation helper (V1.1)
function validateSellableTemplate(template) {
    var _a;
    const errors = [];
    const warnings = [];
    // Core validations
    if (!template.name || template.name.length < 3) {
        errors.push('Template name must be at least 3 characters');
    }
    if (!template.version || !/^\d+\.\d+\.\d+$/.test(template.version)) {
        errors.push('Version must be semantic (e.g., 1.0.0)');
    }
    if (!template.inputSchema || template.inputSchema.length === 0) {
        errors.push('Input schema is required');
    }
    if (!template.testBadge || !template.testBadge.passed) {
        errors.push('Template must pass tests before sale');
    }
    if (!template.verified) {
        errors.push('Template must be verified');
    }
    // V1.1 Safety validations
    if (!template.engineCompatibility) {
        errors.push('Engine compatibility version is required (e.g., ">=3.1")');
    }
    if (template.avgExecutionTime <= 0) {
        warnings.push('Average execution time should be measured');
    }
    if (template.avgExecutionTime > 300000) { // 5 min
        warnings.push('Long execution time may cause timeout issues');
    }
    if (!template.refundSafe && !((_a = template.knownFailureScenarios) === null || _a === void 0 ? void 0 : _a.length)) {
        warnings.push('Non-refund-safe templates should document failure scenarios');
    }
    if (!template.externalCostEstimate) {
        warnings.push('External API cost estimate helps buyers make decisions');
    }
    return { valid: errors.length === 0, errors, warnings };
}
exports.validateSellableTemplate = validateSellableTemplate;
// ============================================
// AGENT HEALTH & RECOVERY SYSTEM
// Scalable for 30-40+ agents
// ============================================
var AgentHealthStatus;
(function (AgentHealthStatus) {
    AgentHealthStatus["HEALTHY"] = "healthy";
    AgentHealthStatus["WARNING"] = "warning";
    AgentHealthStatus["CRITICAL"] = "critical";
    AgentHealthStatus["RECOVERING"] = "recovering";
    AgentHealthStatus["OFFLINE"] = "offline";
    AgentHealthStatus["CIRCUIT_OPEN"] = "circuit_open";
})(AgentHealthStatus || (exports.AgentHealthStatus = AgentHealthStatus = {}));
