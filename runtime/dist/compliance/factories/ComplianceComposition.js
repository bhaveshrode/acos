import { ComplianceRegistry } from "../governance/ComplianceRegistry.js";
import { ComplianceEvaluator } from "../governance/ComplianceEvaluator.js";
import { AuditStore } from "../audit/AuditStore.js";
import { AuditTrailLogger } from "../audit/AuditTrailLogger.js";
import { AuditQueryService } from "../audit/AuditQueryService.js";
import { LegalHoldManager } from "../privacy/LegalHoldManager.js";
import { DataErasureManager } from "../privacy/DataErasureManager.js";
import { PaymentDataBoundary } from "../pci/PaymentDataBoundary.js";
import { TaxReportGenerator } from "../tax/TaxReportGenerator.js";
import { SecurityEvidenceCollector } from "../security/SecurityEvidenceCollector.js";
import { SecurityEventLogger } from "../security/SecurityEventLogger.js";
import { RetentionManager } from "../retention/RetentionManager.js";
import { PurgeExecutor } from "../retention/PurgeExecutor.js";
import { ComplianceEvidenceStore } from "../evidence/ComplianceEvidenceStore.js";
import { EvidenceCollector } from "../evidence/EvidenceCollector.js";
import { ComplianceCertifier } from "../evidence/ComplianceCertifier.js";
/**
 * ComplianceComposition bundle class.
 */
export class ComplianceComposition {
    governanceRegistry = new ComplianceRegistry();
    governanceEvaluator = new ComplianceEvaluator(this.governanceRegistry);
    auditStore = new AuditStore();
    auditTrailLogger = new AuditTrailLogger(this.auditStore);
    auditQuery = new AuditQueryService(this.auditStore);
    privacyHoldManager = new LegalHoldManager();
    privacyErasureManager = new DataErasureManager(this.privacyHoldManager);
    pciBoundary = new PaymentDataBoundary();
    taxGenerator = new TaxReportGenerator();
    securityEvidence = new SecurityEvidenceCollector();
    securityLogger = new SecurityEventLogger(this.securityEvidence);
    retentionManager = new RetentionManager();
    retentionPurge = new PurgeExecutor(this.retentionManager);
    evidenceStore = new ComplianceEvidenceStore();
    evidenceCollector = new EvidenceCollector(this.evidenceStore);
    certifier = new ComplianceCertifier();
    constructor() {
        Object.freeze(this);
    }
}
