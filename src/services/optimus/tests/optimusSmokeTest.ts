/**
 * 🧪 OPTIMUS DECISION PIPELINE SMOKE TEST
 * ========================================
 * Akış testi - gerçek test değil, tutarlılık kontrolü
 * 
 * SENARYOLAR:
 * 1. Normal event → Execute
 * 2. Policy block
 * 3. Authority reject
 * 4. FailSafe trigger
 * 5. Fallback activation
 */

import { OPTIMUS, optimusCore, OptimusEvent, OptimusResponse } from '../index';

// ============================================
// TEST UTILITIES
// ============================================

interface TestResult {
    scenario: string;
    passed: boolean;
    expected: string;
    actual: string;
    duration: number;
}

const results: TestResult[] = [];

function logResult(result: TestResult): void {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.scenario}`);
    console.log(`   Expected: ${result.expected}`);
    console.log(`   Actual: ${result.actual}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log('');
    results.push(result);
}

// ============================================
// SMOKE TEST SCENARIOS
// ============================================

async function runSmokeTests(): Promise<void> {
    console.log('🧪 OPTIMUS Decision Pipeline Smoke Test');
    console.log('==========================================\n');

    // Ensure OPTIMUS is started
    await optimusCore.start();
    console.log('');

    // ─────────────────────────────────────────
    // SCENARIO 1: Normal Event → Execute
    // ─────────────────────────────────────────
    await testNormalEvent();

    // ─────────────────────────────────────────
    // SCENARIO 2: Status Check (Low Risk)
    // ─────────────────────────────────────────
    await testStatusCheck();

    // ─────────────────────────────────────────
    // SCENARIO 3: Unknown Intent (Low Confidence)
    // ─────────────────────────────────────────
    await testUnknownIntent();

    // ─────────────────────────────────────────
    // SCENARIO 4: Crisis Activation
    // ─────────────────────────────────────────
    await testCrisisActivation();

    // ─────────────────────────────────────────
    // SCENARIO 5: FailSafe Trigger
    // ─────────────────────────────────────────
    await testFailSafeTrigger();

    // ─────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────
    printSummary();

    // Cleanup
    await optimusCore.stop();
}

// ============================================
// INDIVIDUAL TEST FUNCTIONS
// ============================================

async function testNormalEvent(): Promise<void> {
    const start = Date.now();

    const event = optimusCore.createEvent('USER_COMMAND', 'durum kontrol et');
    const response = await optimusCore.processEvent(event);

    logResult({
        scenario: 'SCENARIO 1: Normal Event Processing',
        passed: response.success === true,
        expected: 'success: true',
        actual: `success: ${response.success}, action: ${response.action}`,
        duration: Date.now() - start
    });
}

async function testStatusCheck(): Promise<void> {
    const start = Date.now();

    const status = optimusCore.getStatus();

    logResult({
        scenario: 'SCENARIO 2: Status Check',
        passed: status.isRunning === true && status.health === 'HEALTHY',
        expected: 'isRunning: true, health: HEALTHY',
        actual: `isRunning: ${status.isRunning}, health: ${status.health}`,
        duration: Date.now() - start
    });
}

async function testUnknownIntent(): Promise<void> {
    const start = Date.now();

    // Gibberish input - should be handled gracefully
    const event = optimusCore.createEvent('USER_COMMAND', 'xyzzy foo bar');
    const response = await optimusCore.processEvent(event);

    // Should not crash, may defer or execute with low confidence
    logResult({
        scenario: 'SCENARIO 3: Unknown Intent Handling',
        passed: response !== undefined && response.timestamp !== undefined,
        expected: 'Response exists (graceful handling)',
        actual: `action: ${response.action}, message: ${response.message?.substring(0, 50)}...`,
        duration: Date.now() - start
    });
}

async function testCrisisActivation(): Promise<void> {
    const start = Date.now();

    // Activate crisis mode
    optimusCore.setMode('CRISIS', 'Smoke test');
    const mode = optimusCore.getMode();

    // Reset to operator
    optimusCore.setMode('OPERATOR', 'Test complete');

    logResult({
        scenario: 'SCENARIO 4: Crisis Mode Activation',
        passed: mode === 'CRISIS',
        expected: 'mode: CRISIS',
        actual: `mode: ${mode}`,
        duration: Date.now() - start
    });
}

async function testFailSafeTrigger(): Promise<void> {
    const start = Date.now();

    // Trigger failsafe
    optimusCore.triggerFailSafe('Smoke test trigger');

    const status = optimusCore.getStatus();
    const failSafeTriggered = status.failSafe.isTriggered;

    // Reset
    optimusCore.resetFailSafe();

    const statusAfterReset = optimusCore.getStatus();

    logResult({
        scenario: 'SCENARIO 5: FailSafe Trigger & Reset',
        passed: failSafeTriggered === true && statusAfterReset.failSafe.isTriggered === false,
        expected: 'triggered: true → false after reset',
        actual: `triggered: ${failSafeTriggered} → ${statusAfterReset.failSafe.isTriggered}`,
        duration: Date.now() - start
    });
}

// ============================================
// SUMMARY
// ============================================

function printSummary(): void {
    console.log('\n==========================================');
    console.log('📊 SMOKE TEST SUMMARY');
    console.log('==========================================\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⏱️ Total Duration: ${totalDuration}ms`);
    console.log('');

    if (failed === 0) {
        console.log('🎉 ALL SMOKE TESTS PASSED!');
        console.log('OPTIMUS Decision Pipeline is operational.');
    } else {
        console.log('⚠️ SOME TESTS FAILED');
        console.log('Review the failures above before proceeding.');
    }
}

// ============================================
// RUN
// ============================================

// Export for use as module
export { runSmokeTests, results };

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runSmokeTests().catch(console.error);
}
