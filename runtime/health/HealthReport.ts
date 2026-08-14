import { HealthCheck } from "./HealthCheck.js";

/**
 * HealthReport detailing overall system statuses.
 */
export class HealthReport {
  public readonly checks: readonly HealthCheck[];

  constructor(
    public readonly overallHealthy: boolean,
    checks: HealthCheck[],
    public readonly timestamp: Date = new Date()
  ) {
    this.checks = Object.freeze([...checks]);
    Object.freeze(this);
  }
}
