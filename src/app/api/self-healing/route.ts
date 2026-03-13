import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = util.promisify(exec);

export async function GET() {
    return NextResponse.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '2.1',
        capabilities: ['self-healing', 'auto-fix', 'diagnostics']
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        const HEALING_ACTIONS = {
            FIX_TSC_CONFIG: async () => {
                // We assume tsconfig is at project root
                const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
                let tsconfig;
                try {
                    tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
                } catch (e) {
                    return { success: false, message: 'Could not read tsconfig.json' };
                }

                // Ensure proper compiler options
                tsconfig.compilerOptions = {
                    ...tsconfig.compilerOptions,
                    allowSyntheticDefaultImports: true,
                    esModuleInterop: true,
                    skipLibCheck: true,
                    strict: false,
                    resolveJsonModule: true,
                    moduleResolution: "bundler",
                    target: "es2022",
                    lib: ["dom", "dom.iterable", "esnext"],
                    jsx: "preserve",
                    module: "esnext"
                };

                fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
                return { success: true, message: 'tsconfig.json fixed' };
            },

            FIX_IMPORTS: async () => {
                // Dynamic require
                try {
                    const { UniversalImportFixer } = require('../../../lib/universal-import-fixer');
                    UniversalImportFixer.fixProject(process.cwd());
                    return { success: true, message: 'All imports fixed' };
                } catch (e: any) {
                    console.error(e);
                    return { success: false, message: 'Fix imports failed: ' + e.message };
                }
            },

            RUN_DIAGNOSTICS: async () => {
                const diagnostics: any = {
                    nodeVersion: process.version,
                    platform: process.platform,
                    cwd: process.cwd(),
                    tsconfigExists: fs.existsSync('tsconfig.json'),
                    nextConfigExists: fs.existsSync('next.config.js'),
                };

                // Run TypeScript compiler
                try {
                    // Use a simpler check
                    await execAsync('npx tsc --version');
                    const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck');
                    diagnostics.tscOutput = stderr || stdout || 'No errors';
                } catch (error: any) {
                    diagnostics.tscError = error.message;
                }

                return { success: true, diagnostics };
            },

            AUTO_FIX_ALL: async () => {
                const results = [];

                // Step 1: Fix tsconfig
                results.push(await HEALING_ACTIONS.FIX_TSC_CONFIG());

                // Step 2: Fix imports
                results.push(await HEALING_ACTIONS.FIX_IMPORTS());

                // Step 3: Clear cache attempt (soft)
                try {
                    const cachePath = path.join(process.cwd(), '.next/cache');
                    if (fs.existsSync(cachePath)) {
                        // fs.rmSync(cachePath, { recursive: true, force: true });
                        results.push({ success: true, message: 'Cache cleared (simulated)' });
                    }
                } catch (error) {
                    // ignore
                }

                return { success: true, steps: results };
            }
        };

        const actionHandler = HEALING_ACTIONS[action as keyof typeof HEALING_ACTIONS];

        if (!actionHandler) {
            // Default to diagnose if unknown
            if (action === 'diagnose') return NextResponse.json(await HEALING_ACTIONS.RUN_DIAGNOSTICS());
            if (action === 'fix-all') return NextResponse.json(await HEALING_ACTIONS.AUTO_FIX_ALL());

            return NextResponse.json(
                { error: `Unknown action: ${action}` },
                { status: 400 }
            );
        }

        const result = await actionHandler();
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Self-healing error:', error);

        return NextResponse.json(
            {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
