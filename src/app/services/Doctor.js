"use strict";
/**
 * 🚑 DOCTOR DIAGNOSTICS ENGINE
 * =============================
 * Self-healing system that scans for errors and proposes fixes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
class Doctor {
    static async scan() {
        // Gerçek sistem taraması için backend API'ye istek at
        try {
            const response = await fetch('/api/doctor/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return data.diagnoses || [];
        }
        catch (error) {
            console.error('Doctor scan error:', error);
            return [{
                    id: 'sys-err',
                    type: 'error',
                    message: 'Tarama servisine ulaşılamadı.',
                    source: 'System',
                    fix: { action: 'ignore', description: 'Tekrar dene', auto: false }
                }];
        }
    }
}
exports.Doctor = Doctor;
