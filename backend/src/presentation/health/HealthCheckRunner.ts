import { IHealthCheck } from "./IHealthCheck.js";
import { HealthCheckResult } from "./HealthReport.js";

/**
 * HealthCheckRunner running all registers async health checks in parallel.
 */
export class HealthCheckRunner {
  constructor(private readonly checks: IHealthCheck[]) {}

  public async run(): Promise<HealthCheckResult[]> {
    const promises = this.checks.map((c) => c.check());
    return Promise.all(promises);
  }
}
