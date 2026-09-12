import { NextRequest, NextResponse } from 'next/server';

const JARVIS_BASE_URL = process.env.JARVIS_URL || 'http://127.0.0.1:8765';

export async function GET(req: NextRequest, { params }: { params: { action: string[] } }) {
    const actionPath = (params.action || []).join('/');
    try {
        const targetUrl = `${JARVIS_BASE_URL}/${actionPath}`;
        const res = await fetch(targetUrl, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!res.ok) {
            return NextResponse.json({ active: false, error: `Jarvis status: ${res.status}` }, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json({ active: true, data });
    } catch (e: any) {
        return NextResponse.json({ active: false, message: 'Jarvis backend offline or unreachable' }, { status: 200 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { action: string[] } }) {
    const actionPath = (params.action || []).join('/');
    try {
        const body = await req.json().catch(() => ({}));
        const targetUrl = `${JARVIS_BASE_URL}/${actionPath}`;
        
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json().catch(() => ({ ok: res.ok }));
        return NextResponse.json(data, { status: res.status });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message || 'Jarvis request failed' }, { status: 502 });
    }
}
