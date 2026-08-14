/**
 * SecurityAuditRecord carrying security event details.
 */
export class SecurityAuditRecord {
  constructor(
    public readonly eventId: string,
    public readonly category: "TOKEN_EXPIRED" | "CROSS_TENANT" | "PRIVILEGE_ESCALATION" | "UNAUTHORIZED_AGENT_TOOL" | "WEBHOOK_FORGERY" | "POLICY_VIOLATION",
    public readonly description: string,
    public readonly severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
