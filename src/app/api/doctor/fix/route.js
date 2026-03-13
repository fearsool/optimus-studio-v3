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
const Surgeon_1 = require("../../../services/Surgeon");
const ImmuneSystem_1 = require("../../../services/ImmuneSystem");
const StateStore_1 = require("../../../../agent/state/StateStore");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function POST(request) {
    console.log('🚑 [Doctor API] Fix request received');
    try {
        const body = await request.json();
        const { diagnosisId, file, action } = body;
        console.log(`🚑 [Doctor API] Target: ${file}, Action: ${action}`);
        if (!file) {
            console.error('🚑 [Doctor API] Error: No file provided');
            return server_1.NextResponse.json({ success: false, message: 'Dosya yolu belirtilmedi' }, { status: 400 });
        }
        const targetPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
        console.log(`🚑 [Doctor API] Resolved Path: ${targetPath}`);
        if (!fs.existsSync(targetPath)) {
            console.error('🚑 [Doctor API] Error: File not found');
            return server_1.NextResponse.json({ success: false, message: `Dosya bulunamadı: ${targetPath}` }, { status: 404 });
        }
        // Initialize Services
        console.log('🚑 [Doctor API] Initializing Services...');
        const surgeon = new Surgeon_1.Surgeon();
        const immuneSystem = new ImmuneSystem_1.ImmuneSystem();
        const store = StateStore_1.StateStore.getInstance();
        console.log('🚑 [Doctor API] Services Initialized');
        // 🛡️ IMMUNE SYSTEM: Backup Phase
        console.log('🚑 [Doctor API] Creating Backup...');
        const backupPath = immuneSystem.createBackup(targetPath);
        console.log(`🛡️ [ImmuneSystem] Backup created at: ${backupPath}`);
        let result;
        try {
            // 👨‍⚕️ SURGEON: Operation Phase
            console.log(`🚑 [Doctor API] Starting Surgery (${action})...`);
            if (action === 'refactor') {
                result = await surgeon.splitLongFunctions(targetPath);
            }
            else if (action === 'optimize_imports') {
                result = await surgeon.optimizeImports(targetPath);
            }
            else {
                return server_1.NextResponse.json({ success: false, message: 'Bilinmeyen işlem' }, { status: 400 });
            }
            console.log(`🚑 [Doctor API] Surgery Result:`, result);
            if (!result.success) {
                console.error('🚑 [Doctor API] Surgery Failed');
                store.addMedicalRecord(targetPath, diagnosisId, action, 'FAILED', result.message);
                throw new Error(result.message);
            }
            // 🛡️ IMMUNE SYSTEM: Validation Phase
            console.log('🚑 [Doctor API] Starting Validation (this may take time)...');
            // Timeout logic could be added here
            const healthCheck = await immuneSystem.validateHealth(targetPath);
            console.log('🚑 [Doctor API] Validation Result:', healthCheck);
            if (!healthCheck.healthy) {
                console.warn(`🛡️ Validation failed: ${healthCheck.error}. Rolling back...`);
                immuneSystem.restoreBackup(targetPath, backupPath);
                store.addMedicalRecord(targetPath, diagnosisId, action, 'ROLLEDBACK', `Validation failed: ${healthCheck.error}`);
                return server_1.NextResponse.json({
                    success: false,
                    message: `Düzeltme geri alındı: ${healthCheck.error}`
                });
            }
            // 🧠 MEMORY: Record Success
            store.addMedicalRecord(targetPath, diagnosisId, action, 'SUCCESS', 'Operation and validation successful');
            return server_1.NextResponse.json({
                success: true,
                message: `${result.message} (Doğrulandı ✅)`
            });
        }
        catch (opError) {
            console.error('🚑 [Doctor API] Operation CRITICAL ERROR:', opError);
            immuneSystem.restoreBackup(targetPath, backupPath);
            store.addMedicalRecord(targetPath, diagnosisId, action, 'FAILED', opError.message);
            return server_1.NextResponse.json({
                success: false,
                message: `Hata: ${opError.message}`
            }, { status: 500 });
        }
    }
    catch (error) {
        console.error('🚑 [Doctor API] UNHANDLED EXCEPTION:', error);
        return server_1.NextResponse.json({
            success: false,
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
exports.POST = POST;
