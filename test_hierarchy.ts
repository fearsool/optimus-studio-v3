import { supervisorAgent } from './src/agent/core/SupervisorAgent';
import { AgentCore } from './src/agent/core/AgentCore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function testHierarchicalSystem() {
    console.log('🚀 Starting Multi-Agent Hierarchy Test...\n');

    const agent = new AgentCore(process.cwd());

    const testQueries = [
        "Bana bir Python scripti yaz, 'hello world' desin.", // Expected: Coding/Supervisor
        "Ali Bey için bir video senaryosu hazırla, konu yapay zeka.", // Expected: Video/Supervisor
        "Nasılsın Optimus?", // Expected: Chat/Supervisor
    ];

    for (const query of testQueries) {
        console.log(`\n--- Testing Query: "${query}" ---`);
        try {
            const response = await agent.processRequest(query);
            console.log(`✅ Response received: ${response.substring(0, 100)}...`);
        } catch (e) {
            console.error(`❌ Test failed for query: "${query}"`, e);
        }
    }

    console.log('\n--- Test Completed ---');
}

testHierarchicalSystem();
