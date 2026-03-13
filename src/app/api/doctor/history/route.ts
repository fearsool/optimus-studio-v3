import { NextResponse } from 'next/server';
import { StateStore } from '../../../../agent/state/StateStore';

export async function GET() {
    try {
        const store = StateStore.getInstance();
        const db = store.getDatabase();
        // Force a fresh query
        const stmt = db.prepare('SELECT * FROM medical_records ORDER BY created_at DESC LIMIT 50');
        const history = stmt.all();

        return NextResponse.json({ history });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
