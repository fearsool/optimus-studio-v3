import { AutomationTemplate } from '../templateService';


/**
 * 🛡️ IMMUTABILITY POLICY - V2 STANDARD
 * 
 * ⚠️ WARNING: This file is LOCKED.
 * 
 * These policies enforce OmniFlow Factory standards.
 * Modifications that weaken protections are FORBIDDEN.
 * Only additive security enhancements are allowed.
 * 
 * Violations will be logged and rejected at runtime.
 * 
 * @version 2.0.0
 * @since 2026-01-07
 */

// --- POLICY: STATE HIERARCHY (IMMUTABLE) ---
export const STATE_HIERARCHY = Object.freeze({
    ore: 0,
    processed: 1,
    refined: 2,
    draft: 0 // Alias for ore
} as const);

// --- POLICY: IMMUTABILITY ---

/**
 * Checks if a template is in a locked state where updates are FORBIDDEN.
 * @param template The template object or version state
 */
export const isTemplateLocked = (template: AutomationTemplate | { refineLevel: string }): boolean => {
    // REFINED templates are READ-ONLY.
    // They cannot be updated. They must be cloned to a new version.
    return template.refineLevel === 'refined';
};

/**
 * Validates if an action can be performed on the given version state.
 * @throws Error if the action violates immutability laws.
 */
export const assertMutable = (state: 'draft' | 'processed' | 'refined', action: string) => {
    if (state === 'refined') {
        throw new Error(`IMMUTABILITY VIOLATION: Cannot perform '${action}' on a REFINED version. Clone it first.`);
    }
};

/**
 * Enforces strict transitions.
 * draft -> processed (OK)
 * processed -> refined (OK, if valid)
 * refined -> draft (NO, must clone)
 * 
 * V2: Added logging for all attempts
 */
export const validateStateTransition = (from: 'draft' | 'processed' | 'refined', to: 'draft' | 'processed' | 'refined') => {
    console.log(`[IMMUTABILITY] Transition attempt: ${from} -> ${to}`);

    if (from === 'refined' && to !== 'refined') {
        const error = 'IMMUTABILITY VIOLATION: Once refined, a version cannot go back. You must create a NEW version.';
        console.error(`[IMMUTABILITY] BLOCKED: ${error}`);
        throw new Error(error);
    }
};

