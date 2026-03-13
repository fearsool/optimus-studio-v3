/**
 * 🏭 FACTORY TOOL
 * ===============
 * OVI-4 motorunu kontrol eder.
 * "Optimus, şu konuda video yap" dediğinde bu tool çalışır.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { Tool } from '../core/AgentCore';

const execAsync = promisify(exec);

export class FactoryTool implements Tool {
    name = 'factory_tool';
    description = 'Control the video factory (OVI-4). Can render videos from scripts.';

    private factoryPath: string;

    constructor(projectRoot: string) {
        this.factoryPath = path.join(projectRoot, 'products', 'profit-factory-os-v1', 'core');
    }

    async execute(args: { action: 'render' | 'status' | 'stop', script?: string, channelId?: string }) {
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

    private async startRender(script: string, channelId: string): Promise<string> {
        console.log(`   🎬 Starting render for channel: ${channelId}`);
        console.log(`   📜 Script: ${script.substring(0, 50)}...`);

        // OVI-4 test scriptini çalıştır
        const cmd = `npx tsx test_ovi4.ts`;

        try {
            // Arka planda başlat (async)
            exec(cmd, { cwd: this.factoryPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`   ❌ Render error: ${error.message}`);
                } else {
                    console.log(`   ✅ Render completed`);
                }
            });

            return `Render started for channel "${channelId}". Running in background...`;
        } catch (error: any) {
            return `Failed to start render: ${error.message}`;
        }
    }

    private async getStatus(): Promise<string> {
        // Publish klasöründeki son videoları kontrol et
        const publishPath = path.join(this.factoryPath, '..', 'publish');

        try {
            const { stdout } = await execAsync(`dir /b /od ${publishPath}`, { shell: 'cmd.exe' });
            const folders = stdout.trim().split('\n').slice(-5);
            return `Recent renders:\n${folders.join('\n')}`;
        } catch {
            return 'No recent renders found.';
        }
    }
}
