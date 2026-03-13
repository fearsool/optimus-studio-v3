
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'agent_state.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`🤖 Generating demo data in: ${dbPath}`);
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS agent_heartbeat (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metrics TEXT
    );

    CREATE TABLE IF NOT EXISTS system_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component TEXT NOT NULL,
        status TEXT NOT NULL,
        metric_name TEXT,
        metric_value REAL,
        threshold REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        error_stack TEXT,
        context TEXT NOT NULL,
        solution_applied TEXT,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        last_occurred TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// Generate Heartbeat Data (Past 24 hours)
console.log('❤️ proper Heartbeat data...');
const heartbeatStmt = db.prepare('INSERT INTO agent_heartbeat (agent_id, status, timestamp, metrics) VALUES (?, ?, ?, ?)');
const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;

for (let i = 0; i < 100; i++) {
    const time = new Date(now - (Math.random() * oneDay)).toISOString();
    const metrics = JSON.stringify({
        memoryUsage: {
            heapUsed: 50 + Math.random() * 50,
            heapTotal: 200,
            rss: 300
        },
        uptime: Math.random() * 10000,
        learningStats: { errors: Math.floor(Math.random() * 10), solved: Math.floor(Math.random() * 10) }
    });
    heartbeatStmt.run('optimus_agent', 'alive', time, metrics);
}

// Generate Errors (Solved and Unsolved)
console.log('🐛 Injecting synthetic errors...');
const errorStmt = db.prepare(`
    INSERT INTO learning_errors 
    (error_type, error_message, context, solution_applied, success_count, failure_count, last_occurred) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

errorStmt.run('TimeoutError', 'API request timed out after 5000ms', '{}', JSON.stringify({ action: 'retry' }), 15, 2, new Date().toISOString());
errorStmt.run('DatabaseLock', 'SQLite database is locked', '{}', null, 0, 5, new Date(now - 1000 * 60 * 10).toISOString()); // Recent unsolved
errorStmt.run('MemoryLeak', 'Heap usage exceeded 90%', '{}', JSON.stringify({ action: 'gc' }), 42, 1, new Date(now - 1000 * 60 * 60).toISOString());

console.log('✅ Demo data generation complete!');
console.log('📊 Dashboard will now show rich historical data.');
