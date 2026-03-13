/**
 * Simple Deterministic Hashing Utility
 * Used for generating idempotency keys and input hashes.
 */

export function generateHash(input: any): string {
    try {
        const str = JSON.stringify(input, Object.keys(input || {}).sort());
        let hash = 0, i, chr;
        if (str.length === 0) return hash.toString();
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    } catch (e) {
        return 'hash_error_' + Date.now();
    }
}

export function generateIdempotencyKey(executionId: string, stepId: string, inputHash: string, attempt: number): string {
    return `${executionId}_${stepId}_${inputHash}_${attempt}`;
}
