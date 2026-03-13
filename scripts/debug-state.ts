
console.log("Starting StateStore debug...");
try {
    process.env.STATE_DB_NAME = 'debug_state.db';
    const { StateStore } = require('../src/agent/state/StateStore');
    console.log("StateStore imported.");
    const store = StateStore.getInstance();
    console.log("StateStore instance created.");
    console.log("Database:", store.getDatabase().name);
} catch (e) {
    console.error("Crash:", e);
}
