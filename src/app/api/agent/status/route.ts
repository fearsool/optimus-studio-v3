
import { NextResponse } from 'next/server';
import { StateStore } from '../../../../agent/state/StateStore';

// Force dynamic since we read DB
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const store = StateStore.getInstance();
        const db = store.getDatabase();

        // 1. Get latest heartbeat
        const heartbeatStmt = db.prepare(`
            SELECT * FROM agent_heartbeat 
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        const lastBeat = heartbeatStmt.get() as any;

        // 2. Get latest agent state
        // agent_state table check (might be named differently in StateStore logic? 'checkpoints' is the main one)
        // Checking 'checkpoints' which StateStore uses
        let agentState = null;
        try {
            const stateStmt = db.prepare(`
                SELECT * FROM checkpoints 
                ORDER BY version DESC 
                LIMIT 1
            `);
            const checkpoint = stateStmt.get() as any;
            if (checkpoint) {
                agentState = {
                    version: checkpoint.version,
                    message: checkpoint.message,
                    created_at: checkpoint.created_at
                };
            }
        } catch (e) {
            // Table might not exist yet
        }

        const now = new Date();
        const lastBeatTime = lastBeat ? new Date(lastBeat.timestamp + 'Z').getTime() : 0; // Ensure UTC parsing if needed, but standard string diff usually works
        // Sqlite returns string like "2023-01-01 12:00:00", adding Z helps if stored as UTC

        // Actually, simple subtraction works if we are consistent.
        // Let's use checking the difference in seconds.
        const diffMs = now.getTime() - new Date(lastBeat?.timestamp).getTime();
        const diffSeconds = isNaN(diffMs) ? 9999 : diffMs / 1000;

        // Determine status
        // If last heartbeat was < 30 seconds ago, it's RUNNING
        const isRunning = diffSeconds < 30;

        return NextResponse.json({
            status: isRunning ? 'running' : 'stopped',
            lastHeartbeat: lastBeat ? lastBeat.timestamp : null,
            secondsSinceLastBeat: Math.round(diffSeconds),
            details: agentState || { status: 'unknown' }
        });

    } catch (error: any) {
        console.error('Status API Error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
