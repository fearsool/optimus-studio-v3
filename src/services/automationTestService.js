"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationTestService = void 0;
const nemotronService_1 = require("./nemotronService");
const uuid_1 = require("uuid");
class AutomationTestService {
    /**
     * AUTONOMOUS SELF-TEST RUNNER
     * Runs all 3 layers of testing before packaging
     */
    async runFullTestSuite(automation) {
        console.log(`[SelfTest] Starting audit for: ${automation.name}`);
        const suiteId = (0, uuid_1.v4)();
        // LAYER 1: Technical Validation (Deterministic)
        const technical = this.runTechnicalValidation(automation);
        if (!technical.passed) {
            return this.compileSuite(suiteId, automation.id, technical, null, null);
        }
        // LAYER 2: Quality & Sellability (AI Audit)
        const quality = await this.runQualityAudit(automation);
        if (!quality.passed) {
            return this.compileSuite(suiteId, automation.id, technical, quality, null);
        }
        // LAYER 3: Scenario Simulation (Mock User)
        const simulation = await this.runScenarioSimulation(automation);
        return this.compileSuite(suiteId, automation.id, technical, quality, simulation);
    }
    // --------------------------------------------------------
    // LAYER 1: TECHNICAL VALIDATION
    // --------------------------------------------------------
    runTechnicalValidation(automation) {
        var _a;
        const errors = [];
        const warnings = [];
        // Check 1: Mandatory Fields
        if (!automation.name)
            errors.push('Missing Name');
        if (!automation.description)
            errors.push('Missing Description');
        if (!automation.workflowData)
            errors.push('Missing Workflow Data');
        // Check 2: Infinite Loop Risk
        const nodes = ((_a = automation.workflowData) === null || _a === void 0 ? void 0 : _a.nodes) || [];
        if (nodes.length > 50)
            warnings.push('High complexity (50+ nodes)');
        // Check 3: Missing Connections
        // (Simplified logic for now)
        const isolatedNodes = nodes.filter((n) => !n.connected);
        if (isolatedNodes.length > 0)
            warnings.push(`${isolatedNodes.length} isolated nodes detected`);
        const passed = errors.length === 0;
        return {
            passed,
            layer: 'TECHNICAL',
            score: passed ? 100 : 0,
            warnings,
            errors,
            timestamp: new Date().toISOString()
        };
    }
    // --------------------------------------------------------
    // LAYER 2: QUALITY & SELLABILITY AUDIT
    // --------------------------------------------------------
    async runQualityAudit(automation) {
        // Use Nemotron QUALITY_AUDIT task
        const audit = await nemotronService_1.nemotronService.executeTask({
            task_type: nemotronService_1.NemotronTaskType.QUALITY_AUDIT,
            input: {
                name: automation.name,
                description: automation.description,
                target_audience: automation.targetAudience
            },
            context_summary: 'Pre-packaging Quality Check'
        });
        const result = audit.result;
        const score = result.sales_score ? result.sales_score * 10 : 0; // Convert 1-10 to 0-100
        const passed = result.is_sellable === true && score >= 70;
        return {
            passed,
            layer: 'QUALITY',
            score,
            warnings: result.whats_weak || [],
            errors: result.what_must_be_fixed || [],
            timestamp: new Date().toISOString()
        };
    }
    // --------------------------------------------------------
    // LAYER 3: SCENARIO SIMULATION
    // --------------------------------------------------------
    async runScenarioSimulation(automation) {
        // Mock execution context
        const errors = [];
        const warnings = [];
        let score = 100;
        // Simulation: "Dry Run"
        // 1. Simulate Trigger
        // 2. Mock API calls (don't spend quota)
        // 3. Check for valid end state
        // TODO: Implement actual mock execution engine integration
        // For now, simulate a check
        if (!automation.hasErrorHandling) {
            score -= 20;
            warnings.push('No error handling path defined');
        }
        const passed = score > 60;
        return {
            passed,
            layer: 'SIMULATION',
            score,
            warnings,
            errors,
            timestamp: new Date().toISOString()
        };
    }
    // --------------------------------------------------------
    // HELPER
    // --------------------------------------------------------
    compileSuite(id, automationId, tech, qual, sim) {
        // Determine Verdict
        let verdict = 'PASS';
        if (!tech.passed)
            verdict = 'FAIL';
        else if (qual && !qual.passed)
            verdict = 'FAIL'; // Quality fail = reject
        else if (sim && !sim.passed)
            verdict = 'WARN'; // Sim fail might be soft
        return {
            id,
            automationId,
            technical: tech,
            quality: qual || this.emptyResult('QUALITY'),
            simulation: sim || this.emptyResult('SIMULATION'),
            finalVerdict: verdict
        };
    }
    emptyResult(layer) {
        return { passed: false, layer, score: 0, warnings: [], errors: ['Skipped'], timestamp: new Date().toISOString() };
    }
}
exports.automationTestService = new AutomationTestService();
exports.default = exports.automationTestService;
