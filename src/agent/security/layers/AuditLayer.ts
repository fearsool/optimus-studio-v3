export class AuditLayer {
    async logAudit(audit: any): Promise<void> {
        console.log('Audit log recorded:', audit.overallScore);
    }
}
