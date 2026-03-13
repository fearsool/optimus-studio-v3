/**
 * ✅ VERIFIER (SELF-HEALING TEMELİ)
 * =================================
 * Her tool çağrısından sonra sonucu doğrular.
 * Başarısızlıkta düzeltme önerisi üretir.
 */

import { PlanStep } from '../planner/Planner';

export interface VerificationResult {
    passed: boolean;
    reason?: string;
    suggestedFix?: string;
}

export class Verifier {

    /**
     * Bir adımın sonucunu doğrula
     */
    verify(step: PlanStep): VerificationResult {
        console.log(`   🔍 [Verifier] Checking step ${step.id}...`);

        // Adım başarısız olduysa
        if (step.status === 'failed') {
            return {
                passed: false,
                reason: step.error || 'Unknown error',
                suggestedFix: this.suggestFix(step)
            };
        }

        // Sonuç boş mu?
        if (!step.result || step.result === '') {
            return {
                passed: false,
                reason: 'Empty result',
                suggestedFix: 'Try with different parameters'
            };
        }

        // Hata mesajı içeriyor mu?
        const resultStr = String(step.result).toLowerCase();
        if (resultStr.includes('error') || resultStr.includes('failed') || resultStr.includes('not found')) {
            return {
                passed: false,
                reason: 'Result contains error message',
                suggestedFix: this.suggestFix(step)
            };
        }

        // Her şey yolunda
        return { passed: true };
    }

    /**
     * Hata tipine göre düzeltme öner
     */
    private suggestFix(step: PlanStep): string {
        const error = (step.error || '').toLowerCase();

        if (error.includes('not found') || error.includes('no such file')) {
            return 'File path may be incorrect. Try listing directory first.';
        }

        if (error.includes('permission') || error.includes('access denied')) {
            return 'Permission issue. Check if the path is within workspace.';
        }

        if (error.includes('timeout')) {
            return 'Operation timed out. Try again or check network.';
        }

        if (error.includes('syntax') || error.includes('parse')) {
            return 'Code syntax error. Review the generated code.';
        }

        return 'Retry with modified parameters or ask user for clarification.';
    }

    /**
     * Dosya gerçekten oluştu mu kontrol et
     */
    async verifyFileExists(path: string): Promise<boolean> {
        const fs = await import('fs');
        return fs.existsSync(path);
    }

    /**
     * Komut başarılı mı (exit code 0)
     */
    verifyExitCode(result: string): boolean {
        return !result.toLowerCase().includes('error') &&
            !result.toLowerCase().includes('failed');
    }
}
