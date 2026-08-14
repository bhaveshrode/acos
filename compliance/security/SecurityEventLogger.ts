import { SecurityAuditRecord } from "./SecurityAuditRecord.js";
import { SecurityEventClassifier } from "./SecurityEventClassifier.js";
import { SecurityEvidenceCollector } from "./SecurityEvidenceCollector.js";

/**
 * SecurityEventLogger logging and routing security exceptions.
 */
export class SecurityEventLogger {
  private readonly classifier = new SecurityEventClassifier();

  constructor(private readonly collector: SecurityEvidenceCollector) {}

  public logEvent(
    eventId: string,
    category: "TOKEN_EXPIRED" | "CROSS_TENANT" | "PRIVILEGE_ESCALATION" | "UNAUTHORIZED_AGENT_TOOL" | "WEBHOOK_FORGERY" | "POLICY_VIOLATION",
    description: string
  ): SecurityAuditRecord {
    const severity = this.classifier.classify(category);
    const record = new SecurityAuditRecord(eventId, category, description, severity);
    this.collector.collect(record);
    return record;
  }
}
