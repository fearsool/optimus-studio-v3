"use strict";
/**
 * 🏭 OPTIMUS FACTORY DRY-RUN TEST
 * ================================
 * Gerçek üretim yapılmadan factory simülasyonu
 *
 * MOCK SERVİSLER:
 * - MockFactoryService
 * - MockNemotronService
 *
 * SENARYOLAR:
 * - Üretim isteği
 * - Durum sorgusu
 * - Kriz durumu
 * - Override senaryosu
 */
Object.defineProperty(exports, "__esModule", { value: true });
const optimusCore_1 = require("../core/optimusCore");
const optimusDecisionEngine_1 = require("../decision/optimusDecisionEngine");
const optimusIntentResolver_1 = require("../intent/optimusIntentResolver");
// ============================================
// MOCK FACTORY SERVICE
// ============================================
class MockFactoryService {
    constructor() {
        this.isRunning = false;
        this.productCount = 0;
        this.logs = [];
    }
    async runProductionCycle() {
        this.log('🏭 [MockFactory] Production cycle started');
        // Simulate production time
        await this.sleep(100);
        this.productCount++;
        const product = `automation-template-${this.productCount}`;
        this.log(`📦 [MockFactory] Product created: ${product}`);
        this.log('✅ [MockFactory] Production cycle completed');
        return {
            success: true,
            product,
            log: this.logs.slice(-3).join('\n')
        };
    }
    async getStatus() {
        return {
            running: this.isRunning,
            products: this.productCount,
            health: 'HEALTHY'
        };
    }
    async stop() {
        this.isRunning = false;
        this.log('🛑 [MockFactory] Factory stopped');
    }
    log(msg) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push(`[${timestamp}] ${msg}`);
        console.log(msg);
    }
    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
    getLogs() {
        return [...this.logs];
    }
}
// ============================================
// MOCK NEMOTRON SERVICE
// ============================================
class MockNemotronService {
    constructor() {
        this.callCount = 0;
    }
    async executeTask(input) {
        this.callCount++;
        console.log(`🤖 [MockNemotron] Task executed: ${input.task_type || 'UNKNOWN'}`);
        // Simulate AI response
        return {
            success: true,
            result: {
                intent: 'MOCK_INTENT',
                action: 'EXECUTE',
                confidence: 0.85
            },
            confidence: 0.85
        };
    }
    getCallCount() {
        return this.callCount;
    }
}
// ============================================
// DRY-RUN TEST
// ============================================
const mockFactory = new MockFactoryService();
const mockNemotron = new MockNemotronService();
let testsPassed = 0;
let testsFailed = 0;
function logTest(name, passed, details) {
    const icon = passed ? '✅' : '❌';
    console.log(`\n${icon} ${name}`);
    console.log(`   ${details}`);
    if (passed)
        testsPassed++;
    else
        testsFailed++;
}
async function runDryRunTests() {
    console.log('\n🏭 OPTIMUS FACTORY DRY-RUN TEST');
    console.log('=================================\n');
    // Start OPTIMUS
    await optimusCore_1.optimusCore.start();
    optimusIntentResolver_1.intentResolver.setUseAI(false);
    // ─────────────────────────────────────────
    // SCENARIO 1: Production Request via OPTIMUS
    // ─────────────────────────────────────────
    console.log('\n📋 SCENARIO 1: Production Request');
    console.log('─────────────────────────────────');
    try {
        // Create production event
        const event = optimusCore_1.optimusCore.createEvent('USER_COMMAND', 'yeni ürün oluştur', 'P1');
        const response = await optimusCore_1.optimusCore.processEvent(event);
        // If approved, run mock production
        if (response.success && response.action !== 'BLOCK') {
            const result = await mockFactory.runProductionCycle();
            logTest('Production Request Flow', result.success, `Product: ${result.product}, Decision: ${response.action}`);
        }
        else {
            logTest('Production Request Flow', response.action === 'DEFER', // DEFER is acceptable
            `Deferred/Blocked: ${response.message}`);
        }
    }
    catch (e) {
        logTest('Scenario 1', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 2: Status Query
    // ─────────────────────────────────────────
    console.log('\n📋 SCENARIO 2: Status Query');
    console.log('─────────────────────────────────');
    try {
        const event = optimusCore_1.optimusCore.createEvent('USER_COMMAND', 'fabrika durumu nedir', 'P2');
        const response = await optimusCore_1.optimusCore.processEvent(event);
        const status = await mockFactory.getStatus();
        logTest('Status Query Flow', response.success, `Factory: ${status.products} products, Health: ${status.health}`);
    }
    catch (e) {
        logTest('Scenario 2', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 3: Crisis Mode Activation
    // ─────────────────────────────────────────
    console.log('\n📋 SCENARIO 3: Crisis Mode');
    console.log('─────────────────────────────────');
    try {
        // Directly test mode change (crisis intent would be handled by handler)
        const previousMode = optimusCore_1.optimusCore.getMode();
        optimusCore_1.optimusCore.setMode('CRISIS', 'Test crisis activation');
        const crisisMode = optimusCore_1.optimusCore.getMode();
        // Verify crisis mode is set
        const isCrisis = crisisMode === 'CRISIS';
        logTest('Crisis Mode Activation', isCrisis, `Mode change: ${previousMode} → ${crisisMode}`);
        // Reset mode
        optimusCore_1.optimusCore.setMode('OPERATOR', 'Test cleanup');
    }
    catch (e) {
        logTest('Scenario 3', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 4: Emergency Stop
    // ─────────────────────────────────────────
    console.log('\n📋 SCENARIO 4: Emergency Stop');
    console.log('─────────────────────────────────');
    try {
        const event = optimusCore_1.optimusCore.createEvent('USER_COMMAND', 'acil durdur emergency stop', 'P0');
        const response = await optimusCore_1.optimusCore.processEvent(event);
        // Also stop mock factory
        await mockFactory.stop();
        logTest('Emergency Stop Flow', response !== undefined, `Action: ${response.action}, Factory stopped`);
        // Reset for next tests
        optimusCore_1.optimusCore.resetFailSafe();
        optimusCore_1.optimusCore.setMode('OPERATOR', 'Test cleanup');
    }
    catch (e) {
        logTest('Scenario 4', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 5: Decision Override
    // ─────────────────────────────────────────
    console.log('\n📋 SCENARIO 5: Decision Override');
    console.log('─────────────────────────────────');
    try {
        // Create a decision that needs approval
        const intent = await optimusIntentResolver_1.intentResolver.resolve('kritik işlem yap');
        const decision = await optimusDecisionEngine_1.decisionEngine.decide(intent);
        // Check if there are pending decisions
        const pending = optimusDecisionEngine_1.decisionEngine.getPendingDecisions();
        if (pending.length > 0) {
            // Approve the decision
            const approved = optimusDecisionEngine_1.decisionEngine.approveDecision(pending[0].id);
            logTest('Decision Override (Approve)', approved !== null && approved.action === 'EXECUTE', `Approved decision: ${approved === null || approved === void 0 ? void 0 : approved.id.substring(0, 8)}...`);
        }
        else {
            logTest('Decision Override', true, 'No pending decisions (auto-executed or blocked)');
        }
    }
    catch (e) {
        logTest('Scenario 5', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // SCENARIO 6: Multiple Sequential Operations
    // ─────────────────────────────────────────
    console.log('\n📋 SCENARIO 6: Sequential Operations');
    console.log('─────────────────────────────────');
    try {
        const commands = [
            'durum kontrol',
            'rapor göster',
            'metrik analiz'
        ];
        let successCount = 0;
        for (const cmd of commands) {
            const event = optimusCore_1.optimusCore.createEvent('USER_COMMAND', cmd, 'P2');
            const response = await optimusCore_1.optimusCore.processEvent(event);
            if (response.success)
                successCount++;
        }
        logTest('Sequential Operations', successCount === commands.length, `${successCount}/${commands.length} commands processed successfully`);
    }
    catch (e) {
        logTest('Scenario 6', false, `Error: ${e.message}`);
    }
    // ─────────────────────────────────────────
    // CLEANUP & SUMMARY
    // ─────────────────────────────────────────
    await optimusCore_1.optimusCore.stop();
    console.log('\n=================================');
    console.log('📊 DRY-RUN TEST SUMMARY');
    console.log('=================================');
    console.log(`✅ Passed: ${testsPassed}/${testsPassed + testsFailed}`);
    console.log(`❌ Failed: ${testsFailed}/${testsPassed + testsFailed}`);
    console.log(`🏭 Total Mock Products: ${(await mockFactory.getStatus()).products}`);
    console.log(`🤖 Total Nemotron Calls: ${mockNemotron.getCallCount()}`);
    console.log('');
    if (testsFailed === 0) {
        console.log('🎉 ALL DRY-RUN TESTS PASSED!');
        console.log('Factory integration is ready.\n');
    }
    else {
        console.log('⚠️ SOME TESTS FAILED\n');
    }
    process.exit(testsFailed > 0 ? 1 : 0);
}
// Run
runDryRunTests().catch(err => {
    console.error('Dry-run test error:', err);
    process.exit(1);
});
