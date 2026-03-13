"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStateTransition = exports.assertMutable = exports.isTemplateLocked = exports.STATE_HIERARCHY = void 0;
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
exports.STATE_HIERARCHY = Object.freeze({
    ore: 0,
    processed: 1,
    refined: 2,
    draft: 0 // Alias for ore
});
// --- POLICY: IMMUTABILITY ---
/**
 * Checks if a template is in a locked state where updates are FORBIDDEN.
 * @param template The template object or version state
 */
const isTemplateLocked = (template) => {
    // REFINED templates are READ-ONLY.
    // They cannot be updated. They must be cloned to a new version.
    return template.refineLevel === 'refined';
};
exports.isTemplateLocked = isTemplateLocked;
/**
 * Validates if an action can be performed on the given version state.
 * @throws Error if the action violates immutability laws.
 */
const assertMutable = (state, action) => {
    if (state === 'refined') {
        throw new Error(`IMMUTABILITY VIOLATION: Cannot perform '${action}' on a REFINED version. Clone it first.`);
    }
};
exports.assertMutable = assertMutable;
/**
 * Enforces strict transitions.
 * draft -> processed (OK)
 * processed -> refined (OK, if valid)
 * refined -> draft (NO, must clone)
 *
 * V2: Added logging for all attempts
 */
const validateStateTransition = (from, to) => {
    console.log(`[IMMUTABILITY] Transition attempt: ${from} -> ${to}`);
    if (from === 'refined' && to !== 'refined') {
        const error = 'IMMUTABILITY VIOLATION: Once refined, a version cannot go back. You must create a NEW version.';
        console.error(`[IMMUTABILITY] BLOCKED: ${error}`);
        throw new Error(error);
    }
};
exports.validateStateTransition = validateStateTransition;
