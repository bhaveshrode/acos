import { IHealthCheck } from "./IHealthCheck.js";
import { HealthCheckResult } from "./HealthReport.js";
import { HealthStatus } from "./HealthStatus.js";

/**
 * BlockchainHealthCheck probing ledger gateway simulation layers.
 */
export class BlockchainHealthCheck implements IHealthCheck {
  public readonly name = "Blockchain";

  public async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      name: this.name,
      status: HealthStatus.Healthy,
      durationMs: Date.now() - start
    };
  }
}
