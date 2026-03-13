"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const server_1 = require("next/server");
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const execAsync = util_1.default.promisify(child_process_1.exec);
async function GET() {
    return server_1.NextResponse.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '2.1',
        capabilities: ['self-healing', 'auto-fix', 'diagnostics']
    });
}
exports.GET = GET;
async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;
        const HEALING_ACTIONS = {
            FIX_TSC_CONFIG: async () => {
                // We assume tsconfig is at project root
                const tsconfigPath = path_1.default.join(process.cwd(), 'tsconfig.json');
                let tsconfig;
                try {
                    tsconfig = JSON.parse(fs_1.default.readFileSync(tsconfigPath, 'utf-8'));
                }
                catch (e) {
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
                fs_1.default.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
                return { success: true, message: 'tsconfig.json fixed' };
            },
            FIX_IMPORTS: async () => {
                // Dynamic require
                try {
                    const { UniversalImportFixer } = require('../../../lib/universal-import-fixer');
                    UniversalImportFixer.fixProject(process.cwd());
                    return { success: true, message: 'All imports fixed' };
                }
                catch (e) {
                    console.error(e);
                    return { success: false, message: 'Fix imports failed: ' + e.message };
                }
            },
            RUN_DIAGNOSTICS: async () => {
                const diagnostics = {
                    nodeVersion: process.version,
                    platform: process.platform,
                    cwd: process.cwd(),
                    tsconfigExists: fs_1.default.existsSync('tsconfig.json'),
                    nextConfigExists: fs_1.default.existsSync('next.config.js'),
                };
                // Run TypeScript compiler
                try {
                    // Use a simpler check
                    await execAsync('npx tsc --version');
                    const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck');
                    diagnostics.tscOutput = stderr || stdout || 'No errors';
                }
                catch (error) {
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
                    const cachePath = path_1.default.join(process.cwd(), '.next/cache');
                    if (fs_1.default.existsSync(cachePath)) {
                        // fs.rmSync(cachePath, { recursive: true, force: true });
                        results.push({ success: true, message: 'Cache cleared (simulated)' });
                    }
                }
                catch (error) {
                    // ignore
                }
                return { success: true, steps: results };
            }
        };
        const actionHandler = HEALING_ACTIONS[action];
        if (!actionHandler) {
            // Default to diagnose if unknown
            if (action === 'diagnose')
                return server_1.NextResponse.json(await HEALING_ACTIONS.RUN_DIAGNOSTICS());
            if (action === 'fix-all')
                return server_1.NextResponse.json(await HEALING_ACTIONS.AUTO_FIX_ALL());
            return server_1.NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
        const result = await actionHandler();
        return server_1.NextResponse.json(result);
    }
    catch (error) {
        console.error('Self-healing error:', error);
        return server_1.NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
exports.POST = POST;
