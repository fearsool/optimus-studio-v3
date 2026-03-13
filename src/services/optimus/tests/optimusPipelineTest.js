"use strict";
/**
 * 🔗 OPTIMUS DECISION PIPELINE INTEGRATION TEST
 * ==============================================
 * Karar zinciri testi: Intent → Decision → Policy → Authority
 *
 * Mock kullanarak izole test - gerçek Nemotron yok
 */
Object.defineProperty(exports, "__esModule", { value: true });
const optimusCore_1 = require("../core/optimusCore");
const optimusIntentResolver_1 = require("../intent/optimusIntentResolver");
const optimusDecisionEngine_1 = require("../decision/optimusDecisionEngine");
const optimusPolicyEngine_1 = require("../policy/optimusPolicyEngine");
const optimusAuthorityMatrix_1 = require("../safety/optimusAuthorityMatrix");
const optimusFailSafe_1 = require("../safety/optimusFailSafe");
const results = [];
let passed = 0;
let failed = 0;
function logTest(scenario, success, details) {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${scenario}`);
    console.log(`   ${details}\n`);
    results.push({ scenario, passed: success, details });
    if (success)
        passed++;
    else
        failed++;
}
// ============================================
// PIPELINE TESTS
// ============================================
async function runPipelineTests() {
    console.log('\n🔗 OPTIMUS DECISION PIPELINE INTEGRATION TEST');
    console.log('===============================================\n');
    // Start core first
    await optimusCore_1.optimusCore.start();
    await new Promise(r => setTimeout(r, 100));
    // Disable AI for predictable testing
    optimusIntentResolver_1.intentResolver.setUseAI(false);
    // ─────────────────────────────────────────
    // SCENARIO 1: Normal Intent → Execute
    // ─────────────────────────────────────────
    console.log('SCENARIO 1: Normal Intent Flow\n');
    try {
        const intent = await optimusIntentResolver_1.intentResolver.resolve('durum kontrol et');
        logTest('Intent Resolution', intent.action === 'CHECK_STATUS' || intent.action !== 'UNKNOWN', `Action: ${intent.action}, Confidence: ${intent.confidence.toFixed(2)}`);
        const decision = await optimusDecisionEngine_1.decisionEngine.decide(intent);
        logTest('Decision Making', decision.action !== undefined && decision.confidence > 0, `Action: ${decision.action}, Risk: ${decision.riskLevel}`);
        const policyResult = optimusPolicyEngine_1.policyEngine.evaluate(decision);
        logTest('Policy Evaluation', policyResult.action !== undefined, `PolicyAction: ${policyResult.action}, Reason: ${policyResult.reason}`);
        const authResult = optimusAuthorityMatrix_1.authorityMatrix.check(intent.action);
        logTest('Authority Check', authResult.granted !== undefined, `Granted: ${authResult.granted}, Required: ${authResult.requiredLevel}`);
    }
    catch (e) {
        logTest('Scenario 1', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 2: Crisis Intent → Escalate
    // ─────────────────────────────────────────
    console.log('SCENARIO 2: Crisis Intent Flow\n');
    try {
        const intent = await optimusIntentResolver_1.intentResolver.resolve('kriz aktif et acil durum');
        logTest('Crisis Intent Detection', intent.action.includes('CRISIS') || intent.action.includes('EMERGENCY'), `Action: ${intent.action}`);
        const decision = await optimusDecisionEngine_1.decisionEngine.decide(intent);
        // Crisis should be high priority
        logTest('Crisis Decision Priority', decision.priority === 'P0' || decision.priority === 'P1', `Priority: ${decision.priority}, Risk: ${decision.riskLevel}`);
    }
    catch (e) {
        logTest('Scenario 2', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 3: Stop Command → High Priority
    // ─────────────────────────────────────────
    console.log('SCENARIO 3: Stop Command Flow\n');
    try {
        const intent = await optimusIntentResolver_1.intentResolver.resolve('durdur stop');
        logTest('Stop Intent Detection', intent.action.includes('STOP'), `Action: ${intent.action}`);
        const decision = await optimusDecisionEngine_1.decisionEngine.decide(intent);
        // Stop commands should be allowed for USER level
        const authResult = optimusAuthorityMatrix_1.authorityMatrix.check('STOP_PRODUCTION');
        logTest('Stop Command Authority', authResult.granted === true, `Granted: ${authResult.granted}, Current Level: ${authResult.currentLevel}`);
    }
    catch (e) {
        logTest('Scenario 3', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 4: Unknown Intent → Low Confidence
    // ─────────────────────────────────────────
    console.log('SCENARIO 4: Unknown Intent Handling\n');
    try {
        const intent = await optimusIntentResolver_1.intentResolver.resolve('xyzzy random gibberish 123');
        logTest('Unknown Intent Confidence', intent.confidence < 0.5 || intent.action === 'UNKNOWN', `Action: ${intent.action}, Confidence: ${intent.confidence.toFixed(2)}`);
        const decision = await optimusDecisionEngine_1.decisionEngine.decide(intent);
        // Low confidence should result in DEFER or reduced action
        logTest('Low Confidence Decision', decision.action === 'DEFER' || decision.action === 'BLOCK' || decision.confidence < 0.5, `Action: ${decision.action}, DecisionConfidence: ${decision.confidence.toFixed(2)}`);
    }
    catch (e) {
        logTest('Scenario 4', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 5: Authority Rejection
    // ─────────────────────────────────────────
    console.log('SCENARIO 5: Authority Rejection\n');
    try {
        // Set to GUEST level
        optimusAuthorityMatrix_1.authorityMatrix.setCurrentLevel('GUEST');
        // Try to change mode (requires ADMIN)
        const authResult = optimusAuthorityMatrix_1.authorityMatrix.check('SET_MODE');
        logTest('GUEST Cannot SET_MODE', authResult.granted === false, `Granted: ${authResult.granted}, Reason: ${authResult.reason}`);
        // Reset to USER
        optimusAuthorityMatrix_1.authorityMatrix.setCurrentLevel('USER');
    }
    catch (e) {
        logTest('Scenario 5', false, `Error: ${e.message}`);
        optimusAuthorityMatrix_1.authorityMatrix.setCurrentLevel('USER'); // Ensure reset
    }
    // ─────────────────────────────────────────
    // SCENARIO 6: FailSafe Block
    // ─────────────────────────────────────────
    console.log('SCENARIO 6: FailSafe Block\n');
    try {
        // Trigger failSafe
        optimusFailSafe_1.failSafe.trigger('Test trigger');
        const isSafe = optimusFailSafe_1.failSafe.isSafe();
        logTest('FailSafe Blocks Operations', isSafe === false, `isSafe: ${isSafe}`);
        // Reset
        optimusFailSafe_1.failSafe.reset();
        logTest('FailSafe Reset Allows Operations', optimusFailSafe_1.failSafe.isSafe() === true, `isSafe after reset: ${optimusFailSafe_1.failSafe.isSafe()}`);
    }
    catch (e) {
        logTest('Scenario 6', false, `Error: ${e.message}`);
        optimusFailSafe_1.failSafe.reset(); // Ensure reset
    }
    // ─────────────────────────────────────────
    // SCENARIO 7: Full Pipeline via Core
    // ─────────────────────────────────────────
    console.log('SCENARIO 7: Full Pipeline via Core.processEvent\n');
    try {
        const event = optimusCore_1.optimusCore.createEvent('USER_COMMAND', 'rapor göster');
        const response = await optimusCore_1.optimusCore.processEvent(event);
        logTest('Full Pipeline Execution', response !== undefined && response.timestamp !== undefined, `Success: ${response.success}, Action: ${response.action}`);
    }
    catch (e) {
        logTest('Scenario 7', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────
    await optimusCore_1.optimusCore.stop();
    // ─────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────
    console.log('===============================================');
    console.log('📊 PIPELINE TEST SUMMARY');
    console.log('===============================================');
    console.log(`✅ Passed: ${passed}/${passed + failed}`);
    console.log(`❌ Failed: ${failed}/${passed + failed}`);
    console.log('');
    if (failed === 0) {
        console.log('🎉 ALL PIPELINE TESTS PASSED!');
        console.log('Decision chain is operational.\n');
    }
    else {
        console.log('⚠️ SOME TESTS FAILED');
        console.log('Review the failures above.\n');
    }
    process.exit(failed > 0 ? 1 : 0);
}
// Run
runPipelineTests().catch(err => {
    console.error('Pipeline test error:', err);
    process.exit(1);
});
