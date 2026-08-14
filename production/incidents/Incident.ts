/**
 * Incident detailing production failures and severity tiers.
 */
export class Incident {
  constructor(
    public readonly id: string,
    public readonly severity: "P0" | "P1" | "P2" | "P3",
    public readonly description: string,
    public readonly correlationId: string,
    public resolved: boolean = false,
    public readonly timestamp: Date = new Date()
  ) {}
}
