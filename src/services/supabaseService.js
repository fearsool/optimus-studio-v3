"use strict";
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFromCloud = exports.syncToCloud = exports.getExecutionHistory = exports.logExecutionEnd = exports.logExecutionStart = exports.setSchedule = exports.updateBlueprintStatus = exports.deleteBlueprint = exports.getBlueprintById = exports.getActiveBlueprints = exports.getBlueprint = exports.getBlueprints = exports.saveBlueprint = exports.checkConnection = exports.initSupabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const types_1 = require("../types");
// ============================================
// SUPABASE SERVICE
// Blueprint'leri bulutta sakla, senkronize et
// ============================================
// Browser (Vite) or Server (Node.js - Netlify Functions)
const supabaseUrl = (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.SUPABASE_URL)) ||
    (typeof process !== 'undefined' && ((_b = process.env) === null || _b === void 0 ? void 0 : _b.VITE_SUPABASE_URL)) ||
    ((_c = import.meta.env) === null || _c === void 0 ? void 0 : _c.VITE_SUPABASE_URL) ||
    '';
const supabaseKey = (typeof process !== 'undefined' && ((_d = process.env) === null || _d === void 0 ? void 0 : _d.SUPABASE_ANON_KEY)) ||
    (typeof process !== 'undefined' && ((_e = process.env) === null || _e === void 0 ? void 0 : _e.VITE_SUPABASE_ANON_KEY)) ||
    ((_f = import.meta.env) === null || _f === void 0 ? void 0 : _f.VITE_SUPABASE_ANON_KEY) ||
    '';
let supabase = null;
// Initialize Supabase client
const initSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
        console.warn('[Supabase] URL veya Key bulunamadı. Cloud özellikler devre dışı.');
        return null;
    }
    if (!supabase) {
        supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        console.log('[Supabase] Bağlantı kuruldu ✓');
    }
    return supabase;
};
exports.initSupabase = initSupabase;
// Check connection
const checkConnection = async () => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return false;
        const { error } = await client.from('blueprints').select('count').limit(1);
        return !error;
    }
    catch (_a) {
        return false;
    }
};
exports.checkConnection = checkConnection;
// Convert local blueprint to cloud format
const toCloudFormat = (bp, isActive = true) => ({
    id: bp.id,
    name: bp.name,
    description: bp.description,
    master_goal: bp.masterGoal,
    nodes: bp.nodes,
    base_knowledge: bp.baseKnowledge,
    category: bp.category,
    version: bp.version,
    test_config: bp.testConfig,
    is_active: isActive,
    notify_on: ['error'],
    updated_at: new Date().toISOString()
});
// Convert cloud blueprint to local format
const toLocalFormat = (cloud) => ({
    id: cloud.id,
    name: cloud.name,
    description: cloud.description,
    masterGoal: cloud.master_goal,
    nodes: cloud.nodes.map(n => ({ ...n, status: types_1.StepStatus.IDLE })),
    baseKnowledge: cloud.base_knowledge,
    category: cloud.category,
    version: cloud.version,
    testConfig: cloud.test_config
});
// Save blueprint to cloud
const saveBlueprint = async (blueprint) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return { success: false, error: 'Supabase bağlantısı yok' };
        const { error } = await client
            .from('blueprints')
            .upsert(toCloudFormat(blueprint), { onConflict: 'id' });
        if (error) {
            console.error('[Supabase] Kayıt hatası:', error);
            return { success: false, error: error.message };
        }
        console.log(`[Supabase] "${blueprint.name}" kaydedildi ✓`);
        return { success: true };
    }
    catch (e) {
        return { success: false, error: e.message };
    }
};
exports.saveBlueprint = saveBlueprint;
// Get all blueprints from cloud
const getBlueprints = async () => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return [];
        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) {
            console.error('[Supabase] Okuma hatası:', error);
            return [];
        }
        return (data || []).map(toLocalFormat);
    }
    catch (_a) {
        return [];
    }
};
exports.getBlueprints = getBlueprints;
// Get single blueprint by ID
const getBlueprint = async (id) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return null;
        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            return null;
        return toLocalFormat(data);
    }
    catch (_a) {
        return null;
    }
};
exports.getBlueprint = getBlueprint;
// Get active blueprints for scheduled execution
const getActiveBlueprints = async () => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return [];
        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .eq('is_active', true);
        if (error)
            return [];
        return (data || []).map(toLocalFormat);
    }
    catch (_a) {
        return [];
    }
};
exports.getActiveBlueprints = getActiveBlueprints;
// Get single blueprint
const getBlueprintById = async (id) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return null;
        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            return null;
        return toLocalFormat(data);
    }
    catch (_a) {
        return null;
    }
};
exports.getBlueprintById = getBlueprintById;
// Delete blueprint
const deleteBlueprint = async (id) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return false;
        const { error } = await client
            .from('blueprints')
            .delete()
            .eq('id', id);
        return !error;
    }
    catch (_a) {
        return false;
    }
};
exports.deleteBlueprint = deleteBlueprint;
// Update blueprint status
const updateBlueprintStatus = async (id, updates) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return false;
        const { error } = await client
            .from('blueprints')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);
        return !error;
    }
    catch (_a) {
        return false;
    }
};
exports.updateBlueprintStatus = updateBlueprintStatus;
// Set schedule for blueprint
const setSchedule = async (id, cron) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return false;
        const { error } = await client
            .from('blueprints')
            .update({ schedule_cron: cron, updated_at: new Date().toISOString() })
            .eq('id', id);
        return !error;
    }
    catch (_a) {
        return false;
    }
};
exports.setSchedule = setSchedule;
/**
 * Execution durumunu yükle (Resume için)
 */
async function loadExecutionState(executionId) {
    const supabase = (0, exports.initSupabase)(); // Initialize Supabase client
    if (!supabase)
        return null;
    // 1. Execution ana kaydını çek
    const { data: exec, error: execError } = await supabase
        .from('executions')
        .select('*')
        .eq('id', executionId)
        .single();
    if (execError || !exec)
        return null;
    // 2. Step history'yi çek
    const { data: steps, error: stepsError } = await supabase
        .from('execution_steps')
        .select('*')
        .eq('execution_id', executionId);
    // 3. Variables/Context çek
    const { data: context, error: ctxError } = await supabase
        .from('execution_context')
        .select('variables')
        .eq('execution_id', executionId)
        .single();
    const stepMap = {};
    steps === null || steps === void 0 ? void 0 : steps.forEach((s) => {
        stepMap[s.step_id] = {
            state: s.status,
            output: s.output,
            error: s.error,
            startedAt: s.started_at,
            completedAt: s.completed_at,
            retryCount: s.retry_count || 0
        };
    });
    return {
        executionId: exec.id,
        workflowId: exec.workflow_id,
        status: exec.status,
        startedAt: exec.started_at,
        completedAt: exec.finished_at,
        variables: (context === null || context === void 0 ? void 0 : context.variables) || {},
        steps: stepMap
    };
}
/**
 * Step sonucunu kaydet (Snapshot) - V3 Deterministic
 */
async function saveStepSnapshot(executionId, stepId, status, output = null, error = null, inputHash = null, attempt = 1) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase)
        return false;
    // Execution Step tablosuna upsert
    const { error: stepError } = await supabase
        .from('execution_steps')
        .upsert({
        execution_id: executionId,
        step_id: stepId,
        status: status,
        output: output,
        error: error,
        input_hash: inputHash,
        attempt: attempt,
        updated_at: new Date().toISOString(),
        // Eğer yeni başladıysa started_at set et, bittiyse completed_at
        ...(status === 'RUNNING' ? { started_at: new Date().toISOString() } : {}),
        ...(status === 'SUCCESS' || status === 'FAILED' ? { completed_at: new Date().toISOString() } : {})
    }, { onConflict: 'execution_id, step_id, attempt' }); // V3: attempt history
    if (stepError) {
        console.error('Snapshot save error:', stepError);
        return false;
    }
    return true;
}
/**
 * Check for existing execution of this step with same input (Idempotency)
 */
async function checkStepIdempotency(executionId, stepId, inputHash) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase)
        return null;
    const { data } = await supabase
        .from('execution_steps')
        .select('*')
        .eq('execution_id', executionId)
        .eq('step_id', stepId)
        .eq('input_hash', inputHash)
        .eq('status', 'SUCCESS')
        .single();
    return data; // Returns prior successful result if exists
}
/**
 * Try to lock a step for execution (Atomic Insert)
 * Returns true if lock acquired (row inserted), false if already exists.
 */
async function tryLockStep(executionId, stepId, inputHash, attempt = 1) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase)
        return false;
    // Try to INSERT 'PENDING'. If row exists (even PENDING/RUNNING/SUCCESS), it fails.
    const { error } = await supabase
        .from('execution_steps')
        .insert({
        execution_id: executionId,
        step_id: stepId,
        status: 'PENDING',
        input_hash: inputHash,
        attempt: attempt,
        updated_at: new Date().toISOString(),
        started_at: new Date().toISOString()
    }); // No onConflict -> Fail on duplicate
    if (error) {
        // console.log('Lock contention:', error.message);
        return false;
    }
    return true;
}
/**
 * Context değişkenlerini güncelle
 */
async function updateContext(executionId, variables) {
    const supabase = (0, exports.initSupabase)(); // Initialize Supabase client
    if (!supabase)
        return false;
    const { error } = await supabase
        .from('execution_context')
        .upsert({
        execution_id: executionId,
        variables: variables,
        updated_at: new Date().toISOString()
    }, { onConflict: 'execution_id' });
    return !error;
}
/**
 * Yeni Execution oluştur
 */
async function createExecution(workflowId, initialInput) {
    const supabase = (0, exports.initSupabase)(); // Initialize Supabase client
    // MOCK MODE: Supabase yoksa yerel ID döndür
    if (!supabase) {
        console.warn('[Execution] Mock Mode - Supabase bağlantısı yok, yerel ID kullanılıyor.');
        const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return mockId;
    }
    const { data, error } = await supabase
        .from('executions')
        .insert({
        workflow_id: workflowId,
        status: 'RUNNING',
        started_at: new Date().toISOString()
    })
        .select()
        .single();
    if (error || !data) {
        console.error('Create execution error:', error);
        return null;
    }
    // Initial context
    await updateContext(data.id, { $input: initialInput });
    return data.id;
}
// Log execution start
const logExecutionStart = async (blueprintId) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return null;
        const { data, error } = await client
            .from('execution_logs')
            .insert({
            blueprint_id: blueprintId,
            started_at: new Date().toISOString(),
            status: 'running'
        })
            .select('id')
            .single();
        if (error || !data)
            return null;
        return data.id;
    }
    catch (_a) {
        return null;
    }
};
exports.logExecutionStart = logExecutionStart;
// Log execution end
const logExecutionEnd = async (logId, status, nodeResults, errorMessage) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return false;
        const { error } = await client
            .from('execution_logs')
            .update({
            finished_at: new Date().toISOString(),
            status,
            node_results: nodeResults,
            error_message: errorMessage
        })
            .eq('id', logId);
        return !error;
    }
    catch (_a) {
        return false;
    }
};
exports.logExecutionEnd = logExecutionEnd;
// Get execution history
const getExecutionHistory = async (blueprintId, limit = 10) => {
    try {
        const client = (0, exports.initSupabase)();
        if (!client)
            return [];
        const { data, error } = await client
            .from('execution_logs')
            .select('*')
            .eq('blueprint_id', blueprintId)
            .order('started_at', { ascending: false })
            .limit(limit);
        if (error)
            return [];
        return data || [];
    }
    catch (_a) {
        return [];
    }
};
exports.getExecutionHistory = getExecutionHistory;
// ============================================
// SYNC UTILITIES
// ============================================
// Sync all local blueprints to cloud
const syncToCloud = async (localBlueprints) => {
    const errors = [];
    let synced = 0;
    for (const bp of localBlueprints) {
        const result = await (0, exports.saveBlueprint)(bp);
        if (result.success) {
            synced++;
        }
        else {
            errors.push(`${bp.name}: ${result.error}`);
        }
    }
    return { synced, errors };
};
exports.syncToCloud = syncToCloud;
// Download all from cloud
const downloadFromCloud = async () => {
    return (0, exports.getBlueprints)();
};
exports.downloadFromCloud = downloadFromCloud;
// ============================================
// EXECUTION STATE MANAGEMENT (V3.1)
// ============================================
async function getExecutionState(executionId) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase) {
        // Mock mode
        return 'RUNNING';
    }
    const { data, error } = await supabase
        .from('executions')
        .select('status')
        .eq('id', executionId)
        .single();
    if (error || !data) {
        console.error('Get execution state error:', error);
        return null;
    }
    return data.status;
}
async function updateExecutionState(executionId, newState, reason) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase) {
        // Mock mode - just log
        console.log(`[Mock] State update: ${executionId} → ${newState}`);
        return true;
    }
    const updateData = {
        status: newState,
        updated_at: new Date().toISOString()
    };
    if (reason) {
        updateData.state_reason = reason;
    }
    // If terminal state, set completed_at
    if (newState === 'SUCCESS' || newState === 'FAILED' || newState === 'CANCELLED') {
        updateData.completed_at = new Date().toISOString();
    }
    const { error } = await supabase
        .from('executions')
        .update(updateData)
        .eq('id', executionId);
    if (error) {
        console.error('Update execution state error:', error);
        return false;
    }
    return true;
}
// ============================================
// DETERMINISTIC REPLAY (V3.1)
// ============================================
/**
 * Get full step history with all attempts (for debugging)
 */
async function getStepHistory(executionId, stepId) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase)
        return [];
    let query = supabase
        .from('execution_steps')
        .select('*')
        .eq('execution_id', executionId)
        .order('attempt', { ascending: true });
    if (stepId) {
        query = query.eq('step_id', stepId);
    }
    const { data, error } = await query;
    if (error) {
        console.error('Get step history error:', error);
        return [];
    }
    return data || [];
}
/**
 * Reset a step (and its descendants) for replay
 * Deletes existing step data so it can be re-executed
 */
async function resetStepForReplay(executionId, stepId) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase)
        return false;
    // Delete the step record (allows re-dispatch)
    const { error } = await supabase
        .from('execution_steps')
        .delete()
        .eq('execution_id', executionId)
        .eq('step_id', stepId);
    if (error) {
        console.error('Reset step for replay error:', error);
        return false;
    }
    // Also reset execution state back to RUNNING
    await updateExecutionState(executionId, 'RUNNING', `Replay from step ${stepId}`);
    return true;
}
/**
 * Get execution summary for debug panel
 */
async function getExecutionDebugInfo(executionId) {
    const supabase = (0, exports.initSupabase)();
    if (!supabase)
        return null;
    const state = await loadExecutionState(executionId);
    if (!state)
        return null;
    const steps = await getStepHistory(executionId);
    return {
        ...state,
        stepDetails: steps.map(s => ({
            stepId: s.step_id,
            status: s.status,
            inputHash: s.input_hash,
            output: s.output,
            error: s.error,
            attempt: s.attempt,
            startedAt: s.started_at,
            completedAt: s.completed_at,
            duration: s.completed_at && s.started_at
                ? new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()
                : null
        }))
    };
}
exports.default = {
    initSupabase: exports.initSupabase,
    checkConnection: exports.checkConnection,
    saveBlueprint: exports.saveBlueprint,
    getBlueprints: exports.getBlueprints,
    getBlueprintById: exports.getBlueprintById,
    deleteBlueprint: exports.deleteBlueprint,
    updateBlueprintStatus: exports.updateBlueprintStatus,
    setSchedule: exports.setSchedule,
    getActiveBlueprints: exports.getActiveBlueprints,
    // Legacy logging (UI compatibility)
    logExecutionStart: exports.logExecutionStart,
    logExecutionEnd: exports.logExecutionEnd,
    getExecutionHistory: exports.getExecutionHistory,
    syncToCloud: exports.syncToCloud,
    downloadFromCloud: exports.downloadFromCloud,
    // Execution Core Methods
    loadExecutionState,
    saveStepSnapshot,
    updateContext,
    createExecution,
    checkStepIdempotency,
    tryLockStep,
    // State Machine Methods (V3.1)
    getExecutionState,
    updateExecutionState,
    // Replay Methods (V3.1)
    getStepHistory,
    resetStepForReplay,
    getExecutionDebugInfo
};
