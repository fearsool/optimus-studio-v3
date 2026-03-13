/**
 * 🧪 OPTIMUS STUDIO TEST
 * ======================
 * Agent Core'u test eder.
 */

import { AgentCore } from './src/agent/core/AgentCore.js';
import * as path from 'path';

async function testOptimus() {
    console.log('\n🧠 OPTIMUS STUDIO - TEST MODE');
    console.log('==============================\n');

    const projectRoot = path.resolve(__dirname, '..', '..');
    const agent = new AgentCore(projectRoot);

    console.log('\n📋 Available Tools:', agent.getAvailableTools());

    // Test 1: Basit sohbet
    console.log('\n--- TEST 1: Basic Chat ---');
    const response1 = await agent.processRequest('Merhaba Optimus, çalışıyor musun?');
    console.log('Response:', response1);

    // Test 2: Dosya listeleme
    console.log('\n--- TEST 2: List Files ---');
    const response2 = await agent.processRequest('Proje dosyalarını listele');
    console.log('Response:', response2);

    // Test 3: Factory durumu
    console.log('\n--- TEST 3: Factory Status ---');
    const response3 = await agent.processRequest('Video factory durumunu kontrol et');
    console.log('Response:', response3);

    console.log('\n✅ All tests completed!');
    console.log('Agent State:', agent.getState());
}

testOptimus().catch(console.error);
