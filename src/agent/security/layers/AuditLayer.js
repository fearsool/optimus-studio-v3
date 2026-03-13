"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLayer = void 0;
class AuditLayer {
    async logAudit(audit) {
        console.log('Audit log recorded:', audit.overallScore);
    }
}
exports.AuditLayer = AuditLayer;
