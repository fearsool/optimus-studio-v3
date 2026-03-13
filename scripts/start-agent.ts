// scripts/start-agent.ts
// Force DB Isolation for Agent Process
process.env.SQLITE_PATH = process.env.SQLITE_PATH || './data/agent_memory.db';
process.env.STATE_DB_NAME = process.env.STATE_DB_NAME || 'agent_state.db';

import { OptimusAgentCore } from '../src/agent/core/OptimusAgentCore';

// Load env vars if needed
// require('dotenv').config();

console.log('🤖 Starting Optimus Personal Agent (Headless Mode)...');
console.log('PID:', process.pid);
console.log(`📂 DB Config: State=${process.env.STATE_DB_NAME}, Memory=${process.env.SQLITE_PATH}`);

// Global Error Handlers
process.on('unhandledRejection', (reason, p) => {
    console.error('❌ Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

async function main() {
    try {
        // Set environment flag to enable the infinite loop
        process.env.RUN_AGENT_LOOP = 'true';

        const agent = new OptimusAgentCore();

        console.log('✅ Agent Core Initialized');
        console.log('🚀 Starting Autonomy Loop...');

        await agent.start();

        // Keep process alive for Event-Driven architecture
        console.log('ℹ️ Agent loop initialized. Listening for events...');

        // Prevent process exit
        setInterval(() => {
            // Heartbeat or background check
        }, 1000 * 60); // Check every minute to keep Node event loop active

    } catch (error) {
        console.error('❌ FATAL AGENT ERROR:', error);
        process.exit(1);
    }
}

// Handle termination signals for graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down agent...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received. Shutting down agent...');
    process.exit(0);
});

// Run
main();
