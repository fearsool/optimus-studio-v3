import { NextResponse } from 'next/server';
import { getTemplates } from '@/services/templates/store';

export async function GET() {
    try {
        const templates = await getTemplates();
        return NextResponse.json({
            success: true,
            count: templates.length,
            templates: templates
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
