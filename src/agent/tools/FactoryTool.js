"use strict";
/**
 * 🏭 FACTORY TOOL
 * ===============
 * OVI-4 motorunu kontrol eder.
 * "Optimus, şu konuda video yap" dediğinde bu tool çalışır.
 */
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
exports.FactoryTool = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class FactoryTool {
    constructor(projectRoot) {
        this.name = 'factory_tool';
        this.description = 'Control the video factory (OVI-4). Can render videos from scripts.';
        this.factoryPath = path.join(projectRoot, 'products', 'profit-factory-os-v1', 'core');
    }
    async execute(args) {
        console.log(`🏭 [FactoryTool] Action: ${args.action}`);
        switch (args.action) {
            case 'render':
                return this.startRender(args.script || 'Default test script', args.channelId || 'optimus-channel');
            case 'status':
                return this.getStatus();
            case 'stop':
                return 'Stop functionality not yet implemented';
            default:
                throw new Error('Unknown factory action');
        }
    }
    async startRender(script, channelId) {
        console.log(`   🎬 Starting render for channel: ${channelId}`);
        console.log(`   📜 Script: ${script.substring(0, 50)}...`);
        // OVI-4 test scriptini çalıştır
        const cmd = `npx tsx test_ovi4.ts`;
        try {
            // Arka planda başlat (async)
            (0, child_process_1.exec)(cmd, { cwd: this.factoryPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`   ❌ Render error: ${error.message}`);
                }
                else {
                    console.log(`   ✅ Render completed`);
                }
            });
            return `Render started for channel "${channelId}". Running in background...`;
        }
        catch (error) {
            return `Failed to start render: ${error.message}`;
        }
    }
    async getStatus() {
        // Publish klasöründeki son videoları kontrol et
        const publishPath = path.join(this.factoryPath, '..', 'publish');
        try {
            const { stdout } = await execAsync(`dir /b /od ${publishPath}`, { shell: 'cmd.exe' });
            const folders = stdout.trim().split('\n').slice(-5);
            return `Recent renders:\n${folders.join('\n')}`;
        }
        catch (_a) {
            return 'No recent renders found.';
        }
    }
}
exports.FactoryTool = FactoryTool;
