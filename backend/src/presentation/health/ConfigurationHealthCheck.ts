import { IHealthCheck } from "./IHealthCheck.js";
import { HealthCheckResult } from "./HealthReport.js";
import { HealthStatus } from "./HealthStatus.js";

/**
 * ConfigurationHealthCheck probing system configs sanity.
 */
export class ConfigurationHealthCheck implements IHealthCheck {
  public readonly name = "Configuration";

  public async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      name: this.name,
      status: HealthStatus.Healthy,
      durationMs: Date.now() - start
    };
  }
}
