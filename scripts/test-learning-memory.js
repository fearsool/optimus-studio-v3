"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LearningMemory_1 = require("../src/agent/evolution/LearningMemory");
async function testLearningMemory() {
    console.log('🧪 Starting Learning Memory Test...');
    try {
        const memory = new LearningMemory_1.LearningMemory();
        // Explicitly initialize DB
        console.log('🔌 Connecting to DB...');
        await memory.init();
        // 1. Record a test error
        const testError = new Error('Test validation failure in module X');
        const context = { module: 'X', input: 'test_data', timestamp: Date.now() };
        console.log('📝 Recording error...');
        await memory.recordError(testError, context);
        // 2. Retrieve similar errors
        console.log('🔍 Searching for similar errors...');
        const similar = await memory.getSimilarErrors(testError);
        if (similar.length > 0) {
            console.log(`✅ Found ${similar.length} similar errors.`);
            console.log('First match:', similar[0].errorMessage);
        }
        else {
            console.error('❌ No similar errors found (should have found the one just added).');
        }
        // 3. Learn from success
        console.log('💡 Learning from success...');
        await memory.learnFromSuccess(testError, 'Fix input validation regex', 0.95);
        // 4. Verify learning
        const updatedSimilar = await memory.getSimilarErrors(testError);
        const learnedRecord = updatedSimilar.find(r => r.errorMessage === testError.message);
        if (learnedRecord && learnedRecord.fixed && learnedRecord.learnedSolution) {
            console.log('✅ Solution successfully learned:', learnedRecord.learnedSolution);
        }
        else {
            console.error('❌ Learned solution not found in DB.');
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
    console.log('✨ Test completed successfully.');
    process.exit(0);
}
testLearningMemory();
