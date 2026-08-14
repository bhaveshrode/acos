/**
 * ComplianceContext capturing the identity and correlation trail of a requested action.
 */
export class ComplianceContext {
  constructor(
    public readonly actorId: string,
    public readonly actorType: "human" | "agent" | "system",
    public readonly tenantId: string,
    public readonly action: string,
    public readonly resource: string,
    public readonly correlationId: string,
    public readonly causationId: string
  ) {
    Object.freeze(this);
  }
}
