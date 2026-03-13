"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmuneSystem = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
/**
 * 🛡️ IMMUNE SYSTEM
 * ==============
 * Protects the codebase from bad "surgery".
 *
 * Capabilities:
 * 1. Create temporary backups of files before modification.
 * 2. Restore backups if verification fails.
 * 3. Run validation checks (Build, Lint, Test).
 */
class ImmuneSystem {
    constructor() {
        this.backupDir = path_1.default.join(process.cwd(), '.immune_system_backups');
        if (!fs_1.default.existsSync(this.backupDir)) {
            fs_1.default.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    /**
     * Creates a backup of the target file.
     * Returns the backup path.
     */
    createBackup(filePath) {
        const fileName = path_1.default.basename(filePath);
        const timestamp = Date.now();
        const backupPath = path_1.default.join(this.backupDir, `${fileName}.${timestamp}.bak`);
        fs_1.default.copyFileSync(filePath, backupPath);
        return backupPath;
    }
    /**
     * Restores a file from a backup.
     */
    restoreBackup(filePath, backupPath) {
        if (fs_1.default.existsSync(backupPath)) {
            fs_1.default.copyFileSync(backupPath, filePath);
            console.log(`🛡️ Immune System: Restored ${path_1.default.basename(filePath)} from backup.`);
        }
        else {
            console.error(`🛡️ Immune System: Backup not found at ${backupPath}`);
        }
    }
    /**
     * Validates the system health after a change.
     * For now, checks if the file is still valid syntax (using TS compiler for TS files).
     */
    async validateHealth(filePath) {
        // Quick syntax check using tsc on the specific file if it's TS
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            try {
                // We use --noEmit to just check validity
                await execAsync(`npx tsc "${filePath}" --noEmit --skipLibCheck --jsx preserve --target esnext --moduleResolution node`, {
                    cwd: process.cwd()
                });
                return { healthy: true };
            }
            catch (error) {
                return { healthy: false, error: error.stdout || error.message };
            }
        }
        // For other files, assume healthy for now (or add Python check later)
        return { healthy: true };
    }
    /**
     * Cleans up old backups (optional)
     */
    cleanupBackups() {
        // Implementation for cleaning up backups older than X hours
    }
}
exports.ImmuneSystem = ImmuneSystem;
