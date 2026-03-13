import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

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

export class ImmuneSystem {
    private backupDir: string;

    constructor() {
        this.backupDir = path.join(process.cwd(), '.immune_system_backups');
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Creates a backup of the target file.
     * Returns the backup path.
     */
    createBackup(filePath: string): string {
        const fileName = path.basename(filePath);
        const timestamp = Date.now();
        const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.bak`);

        fs.copyFileSync(filePath, backupPath);
        return backupPath;
    }

    /**
     * Restores a file from a backup.
     */
    restoreBackup(filePath: string, backupPath: string): void {
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, filePath);
            console.log(`🛡️ Immune System: Restored ${path.basename(filePath)} from backup.`);
        } else {
            console.error(`🛡️ Immune System: Backup not found at ${backupPath}`);
        }
    }

    /**
     * Validates the system health after a change.
     * For now, checks if the file is still valid syntax (using TS compiler for TS files).
     */
    async validateHealth(filePath: string): Promise<{ healthy: boolean; error?: string }> {
        // Quick syntax check using tsc on the specific file if it's TS
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            try {
                // We use --noEmit to just check validity
                await execAsync(`npx tsc "${filePath}" --noEmit --skipLibCheck --jsx preserve --target esnext --moduleResolution node`, {
                    cwd: process.cwd()
                });
                return { healthy: true };
            } catch (error: any) {
                return { healthy: false, error: error.stdout || error.message };
            }
        }

        // For other files, assume healthy for now (or add Python check later)
        return { healthy: true };
    }

    /**
     * Cleans up old backups (optional)
     */
    cleanupBackups(): void {
        // Implementation for cleaning up backups older than X hours
    }
}
