/**
 * 🚑 DOCTOR DIAGNOSTICS ENGINE
 * =============================
 * Self-healing system that scans for errors and proposes fixes.
 */

export interface Diagnosis {
    id: string;
    type: 'error' | 'warning' | 'optimization';
    message: string;
    source: string;
    fix: {
        action: 'run_command' | 'edit_file' | 'ignore';
        description: string;
        auto: boolean; // Safe to auto-fix?
        command?: string;
    };
}

export class Doctor {

    static async scan(): Promise<Diagnosis[]> {
        // Gerçek sistem taraması için backend API'ye istek at
        try {
            const response = await fetch('/api/doctor/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return data.diagnoses || [];
        } catch (error) {
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
