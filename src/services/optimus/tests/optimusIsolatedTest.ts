/**
 * 🧪 OPTIMUS ISOLATED SMOKE TEST
 * ===============================
 * Bağımsız test - Nemotron/Factory bağımlılığı YOK
 */

// Direct imports (no full index)
import { optimusCore } from '../core/optimusCore';
import { fallbackBrain } from '../core/optimusFallbackBrain';
import { optimusPersonality } from '../core/optimusPersonality';

// ============================================
// TEST RUNNER
// ============================================

async function runIsolatedTests(): Promise<void> {
    console.log('\n🧪 OPTIMUS ISOLATED SMOKE TEST');
    console.log('================================\n');

    let passed = 0;
    let failed = 0;

    // ─────────────────────────────────────────
    // TEST 1: Core Lifecycle
    // ─────────────────────────────────────────
    try {
        console.log('Test 1: Core Lifecycle');
        await optimusCore.start();
        const status1 = optimusCore.getStatus();

        if (status1.isRunning && status1.health === 'HEALTHY') {
            console.log('  ✅ PASS: Core started successfully');
            passed++;
        } else {
            console.log('  ❌ FAIL: Core not healthy');
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // TEST 2: Mode Changes
    // ─────────────────────────────────────────
    try {
        console.log('Test 2: Mode Changes');

        optimusCore.setMode('SILENT', 'Test');
        const mode1 = optimusCore.getMode();

        optimusCore.setMode('CRISIS', 'Test');
        const mode2 = optimusCore.getMode();

        optimusCore.setMode('OPERATOR', 'Test complete');
        const mode3 = optimusCore.getMode();

        if (mode1 === 'SILENT' && mode2 === 'CRISIS' && mode3 === 'OPERATOR') {
            console.log('  ✅ PASS: All mode changes successful');
            passed++;
        } else {
            console.log(`  ❌ FAIL: Modes were ${mode1}, ${mode2}, ${mode3}`);
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // TEST 3: FailSafe Trigger & Reset
    // ─────────────────────────────────────────
    try {
        console.log('Test 3: FailSafe Trigger & Reset');

        optimusCore.triggerFailSafe('Test trigger');
        await new Promise(r => setTimeout(r, 20)); // Timing guard
        const status2 = optimusCore.getStatus();

        optimusCore.resetFailSafe();
        await new Promise(r => setTimeout(r, 20)); // Timing guard
        const status3 = optimusCore.getStatus();

        if (status2.failSafe.isTriggered && !status3.failSafe.isTriggered) {
            console.log('  ✅ PASS: FailSafe trigger/reset works');
            passed++;
        } else {
            console.log('  ❌ FAIL: FailSafe state incorrect');
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // TEST 4: Fallback Brain
    // ─────────────────────────────────────────
    try {
        console.log('Test 4: Fallback Brain');

        fallbackBrain.activate('API_DOWN');
        const fbStatus = fallbackBrain.getStatus();

        const response = fallbackBrain.process('durum');

        fallbackBrain.deactivate();
        const fbStatus2 = fallbackBrain.getStatus();

        // Stronger assertion: check action type
        const actionCorrect = response.action === 'EXECUTE';

        if (fbStatus.isActive && !fbStatus2.isActive && response.success && actionCorrect) {
            console.log('  ✅ PASS: Fallback brain works (action: EXECUTE)');
            passed++;
        } else {
            console.log(`  ❌ FAIL: Fallback state/action incorrect (action: ${response.action})`);
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // TEST 5: Personality Engine
    // ─────────────────────────────────────────
    try {
        console.log('Test 5: Personality Engine');

        const greet = optimusPersonality.greet();
        const success = optimusPersonality.reportSuccess('Test completed');
        const failure = optimusPersonality.reportFailure('Error', 'Try again');

        if (greet && success && failure) {
            console.log('  ✅ PASS: Personality engine works');
            passed++;
        } else {
            console.log('  ❌ FAIL: Personality output missing');
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // TEST 6: Event Creation
    // ─────────────────────────────────────────
    try {
        console.log('Test 6: Event Creation');

        const event = optimusCore.createEvent('USER_COMMAND', { test: true }, 'P1');

        if (event.id && event.type === 'USER_COMMAND' && event.priority === 'P1') {
            console.log('  ✅ PASS: Event creation works');
            passed++;
        } else {
            console.log('  ❌ FAIL: Event properties incorrect');
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // TEST 7: Emergency Stop
    // ─────────────────────────────────────────
    try {
        console.log('Test 7: Emergency Stop');

        const response = optimusCore.emergencyStop();
        const status = optimusCore.getStatus();

        // Reset for cleanup
        optimusCore.resetFailSafe();
        optimusCore.setMode('OPERATOR', 'Test cleanup');

        if (response.success && status.mode === 'SILENT') {
            console.log('  ✅ PASS: Emergency stop works');
            passed++;
        } else {
            console.log('  ❌ FAIL: Emergency stop did not set mode to SILENT');
            failed++;
        }
    } catch (e: any) {
        console.log(`  ❌ FAIL: ${e.message}`);
        failed++;
    }

    // ─────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────
    await optimusCore.stop();

    // ─────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────
    console.log('\n================================');
    console.log('📊 SMOKE TEST SUMMARY');
    console.log('================================');
    console.log(`✅ Passed: ${passed}/7`);
    console.log(`❌ Failed: ${failed}/7`);
    console.log('');

    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('OPTIMUS Core is operational.\n');
        process.exit(0);
    } else {
        console.log('⚠️ SOME TESTS FAILED\n');
        process.exit(1);
    }
}

// Run
runIsolatedTests().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
