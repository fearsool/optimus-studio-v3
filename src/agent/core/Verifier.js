"use strict";
/**
 * ✅ VERIFIER (SELF-HEALING TEMELİ)
 * =================================
 * Her tool çağrısından sonra sonucu doğrular.
 * Başarısızlıkta düzeltme önerisi üretir.
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
exports.Verifier = void 0;
class Verifier {
    /**
     * Bir adımın sonucunu doğrula
     */
    verify(step) {
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
    suggestFix(step) {
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
    async verifyFileExists(path) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        return fs.existsSync(path);
    }
    /**
     * Komut başarılı mı (exit code 0)
     */
    verifyExitCode(result) {
        return !result.toLowerCase().includes('error') &&
            !result.toLowerCase().includes('failed');
    }
}
exports.Verifier = Verifier;
