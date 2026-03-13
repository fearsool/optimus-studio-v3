"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const server_1 = require("next/server");
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Critic_1 = require("../../../services/Critic"); // Import at top level
const execAsync = util_1.default.promisify(child_process_1.exec);
/**
 *  TODO: Refactor this function (Length: 161 lines).
 *  Consider breaking it down.
 */
async function POST() {
    const diagnoses = [];
    // 1. REAL: TypeScript Check (tsc)
    try {
        await execAsync('npx tsc --noEmit --skipLibCheck', {
            cwd: process.cwd(),
            maxBuffer: 1024 * 1024
        });
    }
    catch (tscError) {
        const output = tscError.stdout || '';
        const lines = output.split('\n');
        let count = 0;
        for (const line of lines) {
            if (count >= 10)
                break;
            const match = line.match(/^([^(]+)\((\d+),(\d+)\): (error TS\d+): (.+)$/);
            if (match) {
                const [_, filePath, lineNo, colNo, code, message] = match;
                const fileName = path_1.default.basename(filePath);
                diagnoses.push({
                    id: `tsc-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'error',
                    message: `${fileName} (${lineNo}:${colNo}): ${message}`,
                    source: 'TypeScript Derleyicisi',
                    fix: { action: 'edit_file', description: 'Dosyayı aç ve hatayı düzelt', auto: false }
                });
                count++;
            }
        }
    }
    // 2. REAL: Python Syntax Check (py_compile)
    try {
        // Scan the entire 'automations' directory (../../automations)
        const rootDir = path_1.default.resolve(process.cwd(), '../../');
        const searchPath = path_1.default.join(rootDir, 'automations');
        // Python script to recursively check syntax
        const pythonCheckScript = `
import os
import py_compile
import sys

# Ensure stdout uses utf-8
sys.stdout.reconfigure(encoding='utf-8')

target_dir = r"${searchPath.replace(/\\/g, '\\\\')}"
if not os.path.exists(target_dir):
    print(f"Error::Directory not found: {target_dir}")
    exit(0)

# Walk user automations
for root, dirs, files in os.walk(target_dir):
    # Skip node_modules or hidden folders if any
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
        
    for file in files:
        if file.endswith(".py"):
            full_path = os.path.join(root, file)
            try:
                py_compile.compile(full_path, doraise=True)
            except py_compile.PyCompileError as e:
                # Format: filename::error_message
                msg = str(e).replace("\\n", " ").replace("\\r", "")
                print(f"{file}::{msg}")
            except Exception as e:
                msg = str(e).replace("\\n", " ").replace("\\r", "")
                print(f"{file}::{msg}")
`;
        // Execute python script
        const { stdout } = await execAsync(`python -c "${pythonCheckScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
        const lines = stdout.split('\n');
        for (const line of lines) {
            if (line.trim() && line.includes('::')) {
                const parts = line.split('::');
                const file = parts[0];
                const msg = parts.slice(1).join('::'); // Rejoin rest in case message had ::
                diagnoses.push({
                    id: `py-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'error',
                    message: `Python Hatası (${file}): ${msg ? msg.substring(0, 150) + '...' : 'Sözdizimi hatası'}`,
                    source: 'Python Derleyicisi',
                    fix: { action: 'edit_file', description: 'Dosyayı düzelt', auto: false }
                });
            }
        }
    }
    catch (pyError) {
        console.error('Python scan error', pyError);
    }
    // 3. REAL: NPM Audit
    try {
        const { stdout } = await execAsync('npm audit --json');
        const auditResult = JSON.parse(stdout);
        if (auditResult.metadata && auditResult.metadata.vulnerabilities.high > 0) {
            diagnoses.push({
                id: 'npm-audit-high',
                type: 'error',
                message: `${auditResult.metadata.vulnerabilities.high} adet YÜKSEK riskli güvenlik açığı bulundu.`,
                source: 'NPM Security',
                fix: { action: 'run_command', description: 'npm audit fix', auto: true, command: 'npm audit fix' }
            });
        }
    }
    catch (e) { }
    // 4. REAL: Critic (Code Complexity & Quality Analysis)
    try {
        const critic = new Critic_1.Critic();
        // Limit analysis to src/app to avoid scanning node_modules or .next
        // In a real scenario, we would walk the directory. For now, let's scan key files.
        const filesToScan = [
            path_1.default.join(process.cwd(), 'src/app/page.tsx'),
            path_1.default.join(process.cwd(), 'src/app/ui/dashboard/SelfHealer.tsx'),
            path_1.default.join(process.cwd(), 'src/app/services/Doctor.ts'),
            path_1.default.join(process.cwd(), 'src/app/api/doctor/scan/route.ts'),
            path_1.default.join(process.cwd(), 'src/app/patient.ts') // Added test file
        ];
        for (const filePath of filesToScan) {
            if (fs_1.default.existsSync(filePath)) {
                const content = fs_1.default.readFileSync(filePath, 'utf-8');
                const metrics = critic.analyze(path_1.default.basename(filePath), content);
                // Thresholds: Complexity > 10 is warning, > 20 is error
                if (metrics.cyclomaticComplexity > 15) {
                    const relativeName = path_1.default.relative(process.cwd(), filePath); // FIX: Use relative path
                    diagnoses.push({
                        id: `critic-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'warning', // 'optimization' or 'warning'
                        message: `Yüksek Karmaşıklık: ${relativeName} (Skor: ${metrics.cyclomaticComplexity}). Bakım indeksi: ${metrics.maintainabilityIndex}/100.`,
                        source: 'The Critic (Eleştirmen)',
                        fix: {
                            action: 'refactor',
                            description: 'Fonksiyonları böl veya basitleştir (Refactoring önerilir)', // Fixed typo
                            auto: true
                        }
                    });
                }
            }
        }
    }
    catch (criticError) {
        console.error('Critic scan error', criticError);
    }
    if (diagnoses.length === 0) {
        diagnoses.push({
            id: 'clean-slate',
            type: 'optimization',
            message: 'Taranan dosyalarda (TS ve Python) kritik hata bulunamadı.',
            source: 'Sistem',
            fix: { action: 'ignore', description: 'Harika!', auto: false }
        });
    }
    return server_1.NextResponse.json({ diagnoses });
}
exports.POST = POST;
