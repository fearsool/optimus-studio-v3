"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const server_1 = require("next/server");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function POST() {
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
        return server_1.NextResponse.json({
            success: true,
            logs: stdout,
            error: stderr
        });
    }
    catch (error) {
        console.error('❌ Scout API Error:', error);
        return server_1.NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
exports.POST = POST;
