
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export async function POST() {
    try {
        console.log('🔭 Manual Scout Triggered via API...');

        // Path to the TrendScout script we just created
        const projectRoot = process.cwd().split('apps')[0]; // Go up from apps/optimus-studio
        const scoutScript = path.join(projectRoot, 'products/profit-factory-os-v1/scout/TrendScout.ts');

        // Execute via tsx
        const command = `npx tsx "${scoutScript}"`;

        console.log(`   Running: ${command}`);
        const { stdout, stderr } = await execAsync(command);

        console.log('   ✅ Scout Run Complete');
        console.log(stdout);

        return NextResponse.json({
            success: true,
            logs: stdout,
            error: stderr
        });

    } catch (error: any) {
        console.error('❌ Scout API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
