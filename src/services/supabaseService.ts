import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SystemBlueprint, WorkflowNode, StepStatus } from '../types';

// ============================================
// SUPABASE SERVICE
// Blueprint'leri bulutta sakla, senkronize et
// ============================================

// Browser (Vite) or Server (Node.js - Netlify Functions)
const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    '';

const supabaseKey =
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    '';

let supabase: SupabaseClient | null = null;

// Initialize Supabase client
export const initSupabase = (): SupabaseClient | null => {
    if (!supabaseUrl || !supabaseKey) {
        console.warn('[Supabase] URL veya Key bulunamadı. Cloud özellikler devre dışı.');
        return null;
    }

    if (!supabase) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[Supabase] Bağlantı kuruldu ✓');
    }

    return supabase;
};

// Check connection
export const checkConnection = async (): Promise<boolean> => {
    try {
        const client = initSupabase();
        if (!client) return false;

        const { error } = await client.from('blueprints').select('count').limit(1);
        return !error;
    } catch {
        return false;
    }
};

// ============================================
// BLUEPRINT CRUD
// ============================================

export interface CloudBlueprint {
    id: string;
    name: string;
    description: string;
    master_goal: string;
    nodes: WorkflowNode[];
    base_knowledge: string;
    category: string;
    version: number;
    test_config: any;
    is_active: boolean;
    schedule_cron: string | null;
    notify_on: string[];
    last_run: string | null;
    last_result: string | null;
    run_count: number;
    created_at: string;
    updated_at: string;
}

// Convert local blueprint to cloud format
const toCloudFormat = (bp: SystemBlueprint, isActive = true): Partial<CloudBlueprint> => ({
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
const toLocalFormat = (cloud: CloudBlueprint): SystemBlueprint => ({
    id: cloud.id,
    name: cloud.name,
    description: cloud.description,
    masterGoal: cloud.master_goal,
    nodes: cloud.nodes.map(n => ({ ...n, status: StepStatus.IDLE })),
    baseKnowledge: cloud.base_knowledge,
    category: cloud.category,
    version: cloud.version,
    testConfig: cloud.test_config
});

// Save blueprint to cloud
export const saveBlueprint = async (blueprint: SystemBlueprint): Promise<{ success: boolean; error?: string }> => {
    try {
        const client = initSupabase();
        if (!client) return { success: false, error: 'Supabase bağlantısı yok' };

        const { error } = await client
            .from('blueprints')
            .upsert(toCloudFormat(blueprint), { onConflict: 'id' });

        if (error) {
            console.error('[Supabase] Kayıt hatası:', error);
            return { success: false, error: error.message };
        }

        console.log(`[Supabase] "${blueprint.name}" kaydedildi ✓`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

// Get all blueprints from cloud
export const getBlueprints = async (): Promise<SystemBlueprint[]> => {
    try {
        const client = initSupabase();
        if (!client) return [];

        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[Supabase] Okuma hatası:', error);
            return [];
        }

        return (data || []).map(toLocalFormat);
    } catch {
        return [];
    }
};

// Get single blueprint by ID
export const getBlueprint = async (id: string): Promise<SystemBlueprint | null> => {
    try {
        const client = initSupabase();
        if (!client) return null;

        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return toLocalFormat(data);
    } catch {
        return null;
    }
};

// Get active blueprints for scheduled execution
export const getActiveBlueprints = async (): Promise<SystemBlueprint[]> => {
    try {
        const client = initSupabase();
        if (!client) return [];

        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .eq('is_active', true);

        if (error) return [];

        return (data || []).map(toLocalFormat);
    } catch {
        return [];
    }
};


// Get single blueprint
export const getBlueprintById = async (id: string): Promise<SystemBlueprint | null> => {
    try {
        const client = initSupabase();
        if (!client) return null;

        const { data, error } = await client
            .from('blueprints')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return toLocalFormat(data);
    } catch {
        return null;
    }
};

// Delete blueprint
export const deleteBlueprint = async (id: string): Promise<boolean> => {
    try {
        const client = initSupabase();
        if (!client) return false;

        const { error } = await client
            .from('blueprints')
            .delete()
            .eq('id', id);

        return !error;
    } catch {
        return false;
    }
};

// Update blueprint status
export const updateBlueprintStatus = async (
    id: string,
    updates: { is_active?: boolean; last_run?: string; last_result?: string; run_count?: number }
): Promise<boolean> => {
    try {
        const client = initSupabase();
        if (!client) return false;

        const { error } = await client
            .from('blueprints')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        return !error;
    } catch {
        return false;
    }
};

// Set schedule for blueprint
export const setSchedule = async (id: string, cron: string | null): Promise<boolean> => {
    try {
        const client = initSupabase();
        if (!client) return false;

        const { error } = await client
            .from('blueprints')
            .update({ schedule_cron: cron, updated_at: new Date().toISOString() })
            .eq('id', id);

        return !error;
    } catch {
        return false;
    }
};

// ============================================
// EXECUTION CORE PERSISTENCE
// ============================================

export interface ExecutionContext {
    executionId: string;
    workflowId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
    startedAt?: string;
    completedAt?: string;
    currentStepId?: string;
    variables: Record<string, any>;
    steps: Record<string, {
        state: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
        output?: any;
        error?: string;
        startedAt?: string;
        completedAt?: string;
        retryCount: number;
    }>;
}

/**
 * Execution durumunu yükle (Resume için)
 */
async function loadExecutionState(executionId: string): Promise<ExecutionContext | null> {
    const supabase = initSupabase(); // Initialize Supabase client
    if (!supabase) return null;

    // 1. Execution ana kaydını çek
    const { data: exec, error: execError } = await supabase
        .from('executions')
        .select('*')
        .eq('id', executionId)
        .single();

    if (execError || !exec) return null;

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

    const stepMap: any = {};
    steps?.forEach((s: any) => {
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
        variables: context?.variables || {},
        steps: stepMap
    };
}

/**
 * Step sonucunu kaydet (Snapshot) - V3 Deterministic
 */
async function saveStepSnapshot(
    executionId: string,
    stepId: string,
    status: string,
    output: any = null,
    error: string | null = null,
    inputHash: string | null = null,
    attempt: number = 1
): Promise<boolean> {
    const supabase = initSupabase();
    if (!supabase) return false;

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
async function checkStepIdempotency(executionId: string, stepId: string, inputHash: string): Promise<any | null> {
    const supabase = initSupabase();
    if (!supabase) return null;

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
async function tryLockStep(
    executionId: string,
    stepId: string,
    inputHash: string,
    attempt: number = 1
): Promise<boolean> {
    const supabase = initSupabase();
    if (!supabase) return false;

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
async function updateContext(executionId: string, variables: Record<string, any>): Promise<boolean> {
    const supabase = initSupabase(); // Initialize Supabase client
    if (!supabase) return false;

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
async function createExecution(workflowId: string, initialInput: any): Promise<string | null> {
    const supabase = initSupabase(); // Initialize Supabase client

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

// ============================================
// EXECUTION LOGS
// ============================================

export interface ExecutionLog {
    id?: string;
    blueprint_id: string;
    started_at: string;
    finished_at?: string;
    status: 'running' | 'success' | 'error';
    node_results?: any;
    error_message?: string;
}

// Log execution start
export const logExecutionStart = async (blueprintId: string): Promise<string | null> => {
    try {
        const client = initSupabase();
        if (!client) return null;

        const { data, error } = await client
            .from('execution_logs')
            .insert({
                blueprint_id: blueprintId,
                started_at: new Date().toISOString(),
                status: 'running'
            })
            .select('id')
            .single();

        if (error || !data) return null;
        return data.id;
    } catch {
        return null;
    }
};

// Log execution end
export const logExecutionEnd = async (
    logId: string,
    status: 'success' | 'error',
    nodeResults?: any,
    errorMessage?: string
): Promise<boolean> => {
    try {
        const client = initSupabase();
        if (!client) return false;

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
    } catch {
        return false;
    }
};

// Get execution history
export const getExecutionHistory = async (blueprintId: string, limit = 10): Promise<ExecutionLog[]> => {
    try {
        const client = initSupabase();
        if (!client) return [];

        const { data, error } = await client
            .from('execution_logs')
            .select('*')
            .eq('blueprint_id', blueprintId)
            .order('started_at', { ascending: false })
            .limit(limit);

        if (error) return [];
        return data || [];
    } catch {
        return [];
    }
};

// ============================================
// SYNC UTILITIES
// ============================================

// Sync all local blueprints to cloud
export const syncToCloud = async (localBlueprints: SystemBlueprint[]): Promise<{ synced: number; errors: string[] }> => {
    const errors: string[] = [];
    let synced = 0;

    for (const bp of localBlueprints) {
        const result = await saveBlueprint(bp);
        if (result.success) {
            synced++;
        } else {
            errors.push(`${bp.name}: ${result.error}`);
        }
    }

    return { synced, errors };
};

// Download all from cloud
export const downloadFromCloud = async (): Promise<SystemBlueprint[]> => {
    return getBlueprints();
};

// ============================================
// EXECUTION STATE MANAGEMENT (V3.1)
// ============================================

async function getExecutionState(executionId: string): Promise<string | null> {
    const supabase = initSupabase();
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

async function updateExecutionState(executionId: string, newState: string, reason?: string): Promise<boolean> {
    const supabase = initSupabase();
    if (!supabase) {
        // Mock mode - just log
        console.log(`[Mock] State update: ${executionId} → ${newState}`);
        return true;
    }

    const updateData: any = {
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
async function getStepHistory(executionId: string, stepId?: string): Promise<any[]> {
    const supabase = initSupabase();
    if (!supabase) return [];

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
async function resetStepForReplay(executionId: string, stepId: string): Promise<boolean> {
    const supabase = initSupabase();
    if (!supabase) return false;

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
async function getExecutionDebugInfo(executionId: string): Promise<any> {
    const supabase = initSupabase();
    if (!supabase) return null;

    const state = await loadExecutionState(executionId);
    if (!state) return null;

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

export default {
    initSupabase,
    checkConnection,
    saveBlueprint,
    getBlueprints,
    getBlueprintById,
    deleteBlueprint,
    updateBlueprintStatus,
    setSchedule,
    getActiveBlueprints,
    // Legacy logging (UI compatibility)
    logExecutionStart,
    logExecutionEnd,
    getExecutionHistory,
    syncToCloud,
    downloadFromCloud,
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
