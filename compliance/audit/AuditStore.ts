import { AuditRecord } from "./AuditRecord.js";

/**
 * AuditStore managing in-memory storage of audit records.
 */
export class AuditStore {
  private readonly records: AuditRecord[] = [];

  public save(record: AuditRecord): void {
    this.records.push(record);
  }

  public getAll(): readonly AuditRecord[] {
    return Object.freeze([...this.records]);
  }

  public clear(): void {
    this.records.length = 0;
  }
}
