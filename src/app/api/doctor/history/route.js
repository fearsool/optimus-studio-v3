"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const server_1 = require("next/server");
const StateStore_1 = require("../../../../agent/state/StateStore");
async function GET() {
    try {
        const store = StateStore_1.StateStore.getInstance();
        const db = store.getDatabase();
        // Force a fresh query
        const stmt = db.prepare('SELECT * FROM medical_records ORDER BY created_at DESC LIMIT 50');
        const history = stmt.all();
        return server_1.NextResponse.json({ history });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
}
exports.GET = GET;
