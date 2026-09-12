import { NextRequest, NextResponse } from 'next/server';

const JARVIS_BASE_URL = process.env.JARVIS_URL || 'http://127.0.0.1:8765';

type RouteContext = {
    params: Promise<{ action: string[] }> | { action: string[] };
};

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const resolvedParams = await context.params;
        const actionPath = (resolvedParams?.action || []).join('/');
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

export async function POST(req: NextRequest, context: RouteContext) {
    try {
        const resolvedParams = await context.params;
        const actionPath = (resolvedParams?.action || []).join('/');
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

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Allow': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Jarvis-Token'
        }
    });
}
