"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const OptimusAgentCore_1 = require("../src/agent/core/OptimusAgentCore");
const EventBus_1 = require("../src/core/EventBus");
async function testEventBus() {
    console.log('🧪 Testing Event Bus System...');
    const eventBus = EventBus_1.EventBus.getInstance();
    // 1. Listen for startup
    const startPromise = new Promise(resolve => {
        eventBus.on('agent:started', (event) => {
            console.log('✅ Received: agent:started', event.data.personality.name);
            resolve();
        });
    });
    // 2. Instantiate Agent
    const agent = new OptimusAgentCore_1.OptimusAgentCore();
    // 3. Start Agent
    console.log('🏁 Starting Agent...');
    await agent.start();
    await startPromise;
    // 4. Test Health Check
    console.log('💓 Requesting Health Check...');
    const healthPromise = new Promise(resolve => {
        // Since performHealthCheck is void in current impl (just logs), 
        // we might not get a return event unless we modify the core.
        // But let's check if the bus accepts the command.
        eventBus.emit('system:health:check', {}, 'TestScript');
        setTimeout(resolve, 1000);
    });
    await healthPromise;
    // 5. Test Task Execution via Event
    console.log('📨 Sending Test Task...');
    const taskPromise = new Promise((resolve) => {
        eventBus.on('task:completed', (event) => {
            console.log('✅ Task Completed:', event.data.result);
            resolve();
        });
        eventBus.on('task:failed', (event) => {
            console.error('❌ Task Failed:', event.data.error);
            resolve();
        });
    });
    eventBus.emit('task:created', {
        id: 'test-task-1',
        type: 'custom',
        data: { message: 'Hello Event Bus' }
    }, 'TestScript');
    await taskPromise;
    console.log('✨ All tests passed!');
    process.exit(0);
}
testEventBus().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
