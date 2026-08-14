/**
 * AuditRecord documenting a transaction, command, or security action.
 */
export class AuditRecord {
  constructor(
    public readonly actorId: string,
    public readonly actorType: "human" | "agent" | "system",
    public readonly tenantId: string,
    public readonly action: string,
    public readonly resource: string,
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly causationId: string,
    public readonly policy: string,
    public readonly authorization: string,
    public readonly result: string,
    public readonly timestamp: Date = new Date(),
    public signature?: string
  ) {
    Object.freeze(this);
  }
}
