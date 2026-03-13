import { NextResponse } from 'next/server';
import { Surgeon } from '../../../services/Surgeon';
import { ImmuneSystem } from '../../../services/ImmuneSystem';
import { StateStore } from '../../../../agent/state/StateStore';
import * as path from 'path';
import * as fs from 'fs';

export async function POST(request: Request) {
    console.log('🚑 [Doctor API] Fix request received');
    try {
        const body = await request.json();
        const { diagnosisId, file, action } = body;
        console.log(`🚑 [Doctor API] Target: ${file}, Action: ${action}`);

        if (!file) {
            console.error('🚑 [Doctor API] Error: No file provided');
            return NextResponse.json({ success: false, message: 'Dosya yolu belirtilmedi' }, { status: 400 });
        }

        const targetPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
        console.log(`🚑 [Doctor API] Resolved Path: ${targetPath}`);

        if (!fs.existsSync(targetPath)) {
            console.error('🚑 [Doctor API] Error: File not found');
            return NextResponse.json({ success: false, message: `Dosya bulunamadı: ${targetPath}` }, { status: 404 });
        }

        // Initialize Services
        console.log('🚑 [Doctor API] Initializing Services...');
        const surgeon = new Surgeon();
        const immuneSystem = new ImmuneSystem();
        const store = StateStore.getInstance();
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
            } else if (action === 'optimize_imports') {
                result = await surgeon.optimizeImports(targetPath);
            } else {
                return NextResponse.json({ success: false, message: 'Bilinmeyen işlem' }, { status: 400 });
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

                return NextResponse.json({
                    success: false,
                    message: `Düzeltme geri alındı: ${healthCheck.error}`
                });
            }

            // 🧠 MEMORY: Record Success
            store.addMedicalRecord(targetPath, diagnosisId, action, 'SUCCESS', 'Operation and validation successful');

            return NextResponse.json({
                success: true,
                message: `${result.message} (Doğrulandı ✅)`
            });

        } catch (opError: any) {
            console.error('🚑 [Doctor API] Operation CRITICAL ERROR:', opError);
            immuneSystem.restoreBackup(targetPath, backupPath);
            store.addMedicalRecord(targetPath, diagnosisId, action, 'FAILED', opError.message);

            return NextResponse.json({
                success: false,
                message: `Hata: ${opError.message}`
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('🚑 [Doctor API] UNHANDLED EXCEPTION:', error);
        return NextResponse.json({
            success: false,
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
