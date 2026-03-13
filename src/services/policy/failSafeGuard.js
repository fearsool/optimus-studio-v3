"use strict";
/**
 * 🛡️ FAIL-SAFE GUARD SYSTEM
 *
 * This module enforces OmniFlow Factory V2 standards.
 *
 * ⚠️ IMMUTABLE: This code CANNOT be modified to weaken protections.
 *    Only additive security enhancements are allowed.
 *
 * @version 2.0.0
 * @since 2026-01-07
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.failSafeGuard = exports.logPolicyDecision = exports.autoRecoverTemplate = exports.preventStateDowngrade = exports.enforceCommercialGate = exports.validateTemplateIntegrity = exports.FACTORY_STANDARDS = void 0;
const templateService_1 = require("../templateService");
// ============================================
// CONSTANTS - IMMUTABLE
// ============================================
/**
 * These values are LOCKED and cannot be changed.
 * Any attempt to modify will be logged and rejected.
 */
exports.FACTORY_STANDARDS = Object.freeze({
    VERSION: '2.0.0',
    SELLABLE_STATES: Object.freeze(['refined']),
    BLOCKED_STATES: Object.freeze(['ore', 'processed']),
    SIGNATURE_ALGORITHM: 'SHA-256',
    MIN_BUSINESS_OUTCOME_FIELDS: 3, // problem, solution, value
});
// ============================================
// FAIL-SAFE VALIDATORS
// ============================================
/**
 * Validates that a template meets V2 standards before ANY operation.
 * This is called before execution, export, and sale.
 */
const validateTemplateIntegrity = (template) => {
    const violations = [];
    // 1. State Check - CRITICAL
    if (!template.refineLevel) {
        violations.push('CRITICAL: refineLevel is undefined');
    }
    else if (!['ore', 'processed', 'refined'].includes(template.refineLevel)) {
        violations.push(`CRITICAL: Invalid refineLevel "${template.refineLevel}"`);
    }
    // 2. Signature Check for Refined Templates
    if (template.refineLevel === 'refined') {
        if (!template.signature) {
            violations.push('CRITICAL: Refined template has no signature');
        }
        if (!template.businessOutcome) {
            violations.push('CRITICAL: Refined template has no businessOutcome');
        }
        if (!template.monetizationType) {
            violations.push('CRITICAL: Refined template has no monetizationType');
        }
    }
    // 3. Sellability Logic Enforcement
    if (template.sellable === true && template.refineLevel !== 'refined') {
        violations.push(`SECURITY: sellable=true on ${template.refineLevel} state is FORBIDDEN`);
    }
    // 4. Blueprint Integrity
    if (!template.blueprint || !template.blueprint.nodes) {
        violations.push('CRITICAL: Blueprint is missing or corrupted');
    }
    // Determine if recovery is possible
    const canRecover = violations.length > 0 && !violations.some(v => v.includes('SECURITY'));
    const recoveryAction = canRecover
        ? 'Demote to ORE state and re-enter Refinery pipeline'
        : undefined;
    return {
        valid: violations.length === 0,
        violations,
        canRecover,
        recoveryAction
    };
};
exports.validateTemplateIntegrity = validateTemplateIntegrity;
/**
 * Enforces that ore/processed templates can NEVER be sold.
 * This is the final gate before any commercial operation.
 */
const enforceCommercialGate = (template) => {
    // Double-check with policy engine
    if (!(0, templateService_1.isTemplateSellable)(template)) {
        const blockingReasons = (0, templateService_1.getBlockingReasons)(template);
        return {
            allowed: false,
            reason: blockingReasons.map(r => r.reason).join('; ') || 'Template does not meet sellability criteria'
        };
    }
    // Verify signature exists and is non-empty
    if (!template.signature || template.signature.length < 20) {
        return {
            allowed: false,
            reason: 'Invalid or missing signature'
        };
    }
    return {
        allowed: true,
        reason: 'Template passed all commercial gates'
    };
};
exports.enforceCommercialGate = enforceCommercialGate;
/**
 * Prevents downgrade of refined templates.
 * Once refined, a template is IMMUTABLE.
 */
const preventStateDowngrade = (currentState, newState) => {
    const stateHierarchy = { ore: 0, processed: 1, refined: 2 };
    if (stateHierarchy[newState] < stateHierarchy[currentState]) {
        return {
            allowed: false,
            error: `IMMUTABILITY VIOLATION: Cannot downgrade from ${currentState} to ${newState}. Create a new version instead.`
        };
    }
    return { allowed: true };
};
exports.preventStateDowngrade = preventStateDowngrade;
// ============================================
// RECOVERY MECHANISMS
// ============================================
/**
 * Automatic recovery for templates that fail validation.
 * Instead of crashing, the system demotes to safe state.
 */
const autoRecoverTemplate = (template) => {
    const validation = (0, exports.validateTemplateIntegrity)(template);
    if (validation.valid) {
        return template; // No recovery needed
    }
    console.warn('[FAIL-SAFE] Template failed validation, auto-recovering:', validation.violations);
    // Demote to ORE state (safest)
    return {
        ...template,
        refineLevel: 'ore',
        sellable: false,
        signature: undefined,
        blockingReasons: [
            ...(template.blockingReasons || []),
            {
                reason: 'Auto-demoted by Fail-Safe Guard due to validation failure',
                source: 'system',
                resolved: false
            }
        ]
    };
};
exports.autoRecoverTemplate = autoRecoverTemplate;
// ============================================
// LOGGING & AUDIT
// ============================================
/**
 * Logs all policy decisions for audit trail.
 */
const logPolicyDecision = (templateId, action, result, details) => {
    const entry = {
        timestamp: new Date().toISOString(),
        templateId,
        action,
        result,
        details,
        version: exports.FACTORY_STANDARDS.VERSION
    };
    console.log('[FAIL-SAFE AUDIT]', JSON.stringify(entry));
    // In production, this would write to Supabase audit table
    // await supabase.from('policy_audit_log').insert(entry);
};
exports.logPolicyDecision = logPolicyDecision;
// ============================================
// EXPORTS
// ============================================
exports.failSafeGuard = {
    validateTemplateIntegrity: exports.validateTemplateIntegrity,
    enforceCommercialGate: exports.enforceCommercialGate,
    preventStateDowngrade: exports.preventStateDowngrade,
    autoRecoverTemplate: exports.autoRecoverTemplate,
    logPolicyDecision: exports.logPolicyDecision,
    FACTORY_STANDARDS: exports.FACTORY_STANDARDS
};
