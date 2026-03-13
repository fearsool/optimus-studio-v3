"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const server_1 = require("next/server");
const supabaseService_1 = require("@/services/supabaseService");
async function GET() {
    try {
        const supabaseStatus = await (0, supabaseService_1.checkConnection)();
        // Basic check for GitHub (Env presence)
        const githubToken = process.env.GITHUB_TOKEN || '';
        const githubStatus = !!githubToken || false;
        const netlifyStatus = !!process.env.NETLIFY_AUTH_TOKEN || false;
        return server_1.NextResponse.json({
            success: true,
            connectors: {
                supabase: { name: 'Supabase', status: supabaseStatus ? 'connected' : 'disconnected' },
                github: { name: 'GitHub', status: githubStatus ? 'connected' : 'disconnected' },
                netlify: { name: 'Netlify', status: netlifyStatus ? 'connected' : 'disconnected' }
            }
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
exports.GET = GET;
