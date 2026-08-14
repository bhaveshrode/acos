import { SecurityAuditRecord } from "./SecurityAuditRecord.js";

/**
 * SecurityEvidenceCollector archiving security logs.
 */
export class SecurityEvidenceCollector {
  private readonly records: SecurityAuditRecord[] = [];

  public collect(record: SecurityAuditRecord): void {
    this.records.push(record);
  }

  public getCollected(): readonly SecurityAuditRecord[] {
    return Object.freeze([...this.records]);
  }

  public clear(): void {
    this.records.length = 0;
  }
}
