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
  public readonly governanceRegistry = new ComplianceRegistry();
  public readonly governanceEvaluator = new ComplianceEvaluator(this.governanceRegistry);

  public readonly auditStore = new AuditStore();
  public readonly auditTrailLogger = new AuditTrailLogger(this.auditStore);
  public readonly auditQuery = new AuditQueryService(this.auditStore);

  public readonly privacyHoldManager = new LegalHoldManager();
  public readonly privacyErasureManager = new DataErasureManager(this.privacyHoldManager);

  public readonly pciBoundary = new PaymentDataBoundary();
  public readonly taxGenerator = new TaxReportGenerator();

  public readonly securityEvidence = new SecurityEvidenceCollector();
  public readonly securityLogger = new SecurityEventLogger(this.securityEvidence);

  public readonly retentionManager = new RetentionManager();
  public readonly retentionPurge = new PurgeExecutor(this.retentionManager);

  public readonly evidenceStore = new ComplianceEvidenceStore();
  public readonly evidenceCollector = new EvidenceCollector(this.evidenceStore);
  public readonly certifier = new ComplianceCertifier();

  constructor() {
    Object.freeze(this);
  }
}
