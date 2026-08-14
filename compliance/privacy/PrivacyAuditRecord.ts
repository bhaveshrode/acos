/**
 * PrivacyAuditRecord tracking privacy actions.
 */
export class PrivacyAuditRecord {
  constructor(
    public readonly userId: string,
    public readonly action: "DISCOVERY" | "ERASURE" | "LEGAL_HOLD",
    public readonly status: "SUCCESS" | "BLOCKED_BY_HOLD" | "BLOCKED_BY_RETENTION",
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
