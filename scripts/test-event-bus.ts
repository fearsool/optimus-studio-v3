
import { EventBus, EventData } from '../src/core/EventBus';

async function testEventBusIsolated() {
    console.log('🧪 Testing Event Bus (Isolated)...');

    // 1. Get Instance
    const eventBus = EventBus.getInstance();
    if (!eventBus) {
        throw new Error('Could not get EventBus instance');
    }
    console.log('✅ EventBus Instance retrieved');

    // 2. Test Emission and Listening
    const testEventName = 'test:event';
    const testPayload = { foo: 'bar' };

    const promise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject('Event timeout'), 2000);

        eventBus.on(testEventName as any, (event: EventData) => {
            clearTimeout(timeout);
            try {
                if (event.data.foo === 'bar') {
                    console.log('✅ Event received correctly');
                    resolve();
                } else {
                    reject('Payload mismatch');
                }
            } catch (e) {
                reject(e);
            }
        });
    });

    console.log('📨 Emitting event...');
    eventBus.emit(testEventName as any, testPayload, 'TestScript');

    await promise;
    console.log('✨ EventBus works correctly!');
}

testEventBusIsolated().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
