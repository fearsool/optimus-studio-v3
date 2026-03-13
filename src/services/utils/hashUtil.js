"use strict";
/**
 * Simple Deterministic Hashing Utility
 * Used for generating idempotency keys and input hashes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIdempotencyKey = exports.generateHash = void 0;
function generateHash(input) {
    try {
        const str = JSON.stringify(input, Object.keys(input || {}).sort());
        let hash = 0, i, chr;
        if (str.length === 0)
            return hash.toString();
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }
    catch (e) {
        return 'hash_error_' + Date.now();
    }
}
exports.generateHash = generateHash;
function generateIdempotencyKey(executionId, stepId, inputHash, attempt) {
    return `${executionId}_${stepId}_${inputHash}_${attempt}`;
}
exports.generateIdempotencyKey = generateIdempotencyKey;
