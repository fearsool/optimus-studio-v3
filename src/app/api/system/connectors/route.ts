import { NextResponse } from 'next/server';
import { checkConnection as checkSupabase } from '@/services/supabaseService';
import { githubImportService } from '@/services/githubImportService';

export async function GET() {
    try {
        const supabaseStatus = await checkSupabase();

        // Basic check for GitHub (Env presence)
        const githubToken = process.env.GITHUB_TOKEN || '';
        const githubStatus = !!githubToken || false;

        const netlifyStatus = !!process.env.NETLIFY_AUTH_TOKEN || false;

        return NextResponse.json({
            success: true,
            connectors: {
                supabase: { name: 'Supabase', status: supabaseStatus ? 'connected' : 'disconnected' },
                github: { name: 'GitHub', status: githubStatus ? 'connected' : 'disconnected' },
                netlify: { name: 'Netlify', status: netlifyStatus ? 'connected' : 'disconnected' }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
