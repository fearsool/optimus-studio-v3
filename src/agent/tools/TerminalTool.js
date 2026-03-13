"use strict";
/**
 * 💻 TERMINAL TOOL (SANDBOXED)
 * ============================
 * Optimus'un komut çalıştırmasını sağlar.
 * Güvenlik için sadece izin verilen komutları çalıştırır.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalTool = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// İzin verilen güvenli komutlar
const ALLOWED_COMMANDS = [
    'npm', 'npx', 'node',
    'ls', 'dir', 'echo',
    'python', 'pip'
];
class TerminalTool {
    constructor(cwd) {
        this.name = 'terminal';
        this.description = 'Execute safe terminal commands like npm, node, npx.';
        this.cwd = cwd;
    }
    async execute(args) {
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
        }
        catch (error) {
            return `Error: ${error.message}`;
        }
    }
}
exports.TerminalTool = TerminalTool;
