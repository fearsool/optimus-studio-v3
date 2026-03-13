import { createClient } from '@supabase/supabase-js';
// import { TemplateVersion, VersionState } from '../types/TemplateVersion';

export type VersionState = 'draft' | 'processed' | 'refined';

export interface TemplateVersion {
    id: string;
    template_id: string;
    version: number;
    state: VersionState;
    blueprint: any;
    business_outcome: any;
    signature: any;
    created_at: string;
    created_by: string;
    commit_message: string;
}
import { AutomationTemplate } from './templateService';
import { assertMutable, isTemplateLocked } from './policy/immutabilityPolicy';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- VERSION CONTROL SERVICE ---

/**
 * Creates a new immutable snapshot of the template.
 * Effectively "Commits" the current state to history.
 */
export const createSnapshot = async (
    template: AutomationTemplate,
    commitMessage: string = 'Auto-save'
): Promise<TemplateVersion | null> => {

    console.log(`[VersionService] Creating snapshot for ${template.id}...`);

    // 1. Prepare Version Data
    // In a real scenario, we'd query the MAX(version) first.
    // For now, we simulate or assume the DB trigger handles auto-increment if we don't send it.
    // Or we fetch current version count.

    // FETCH LATEST VERSION NUMBER
    const { count, error: countError } = await supabase
        .from('template_versions')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', template.id);

    const nextVersion = (count || 0) + 1;

    // 2. Construct Version Object
    const versionData: Partial<TemplateVersion> = {
        template_id: template.id,
        version: nextVersion,
        state: (template.refineLevel as VersionState) || 'draft',
        blueprint: template.blueprint,
        business_outcome: template.businessOutcome,
        signature: template.signature,
        created_at: new Date().toISOString(),
        created_by: 'system', // TODO: User ID
        commit_message: commitMessage
    };

    // 3. Insert into Ledger
    const { data, error } = await supabase
        .from('template_versions')
        .insert(versionData)
        .select()
        .single();

    if (error) {
        console.error('[VersionService] Snapshot failed:', error);
        return null;
    }

    return data as TemplateVersion;
};

/**
 * Fetches the full history of a template.
 */
export const getVersionHistory = async (templateId: string): Promise<TemplateVersion[]> => {
    const { data, error } = await supabase
        .from('template_versions')
        .select('*')
        .eq('template_id', templateId)
        .order('version', { ascending: false });

    if (error) {
        console.error('[VersionService] Fetch history failed:', error);
        return [];
    }

    return data as TemplateVersion[];
};

/**
 * CLONE STRATEGY:
 * Takes a REFINED (locked) version and creates a new DRAFT (mutable) template from it.
 * It does NOT overwrite the existing template (Immutability).
 * It creates a new Lifecycle.
 */
export const cloneRefinedAsDraft = async (version: TemplateVersion, newName?: string): Promise<AutomationTemplate | null> => {

    // 1. Verify Source is Refined (Optional, but good policy)
    // if (version.state !== 'refined') console.warn('Cloning a non-refined version.');

    // 2. Prepare New Template Payload
    // Reset signature, refined level, and IDs.
    const newTemplatePayload = {
        name: newName || `${version.blueprint.name} (Clone)`,
        description: `Forked from version ${version.version}`,
        category: version.blueprint.category || 'general',
        blueprint: version.blueprint,
        // Reset Refinery Status
        refine_level: 'draft',
        sellable: false,
        signature: null,
        // Copy Business Outcome as a starting point, but it needs re-verification
        business_outcome: version.business_outcome,
        blocking_reasons: []
    };

    // 3. Insert New Template
    const { data, error } = await supabase
        .from('templates')
        .insert(newTemplatePayload)
        .select()
        .single();

    if (error) {
        console.error('[VersionService] Clone failed:', error);
        return null;
    }

    return data as AutomationTemplate;
};
