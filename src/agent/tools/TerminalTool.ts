/**
 * 💻 TERMINAL TOOL (SANDBOXED)
 * ============================
 * Optimus'un komut çalıştırmasını sağlar.
 * Güvenlik için sadece izin verilen komutları çalıştırır.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Tool } from '../core/AgentCore';

const execAsync = promisify(exec);

// İzin verilen güvenli komutlar
const ALLOWED_COMMANDS = [
    'npm', 'npx', 'node',
    'ls', 'dir', 'echo',
    'python', 'pip'
];

export class TerminalTool implements Tool {
    name = 'terminal';
    description = 'Execute safe terminal commands like npm, node, npx.';

    private cwd: string;

    constructor(cwd: string) {
        this.cwd = cwd;
    }

    async execute(args: { command: string }) {
        const cmd = args.command.trim();
        const mainCmd = cmd.split(' ')[0];

        // GÜVENLİK KONTROLÜ
        if (!ALLOWED_COMMANDS.includes(mainCmd)) {
            throw new Error(`Security Alert: Command '${mainCmd}' is not allowed in Safe Mode.`);
        }

        console.log(`💻 Executing: ${cmd}`);

        try {
            const { stdout, stderr } = await execAsync(cmd, { cwd: this.cwd });
            return stdout || stderr;
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    }
}
