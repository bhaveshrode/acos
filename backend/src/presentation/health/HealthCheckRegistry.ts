import { IHealthCheck } from "./IHealthCheck.js";

/**
 * HealthCheckRegistry catalog ledger mapping check names to concrete IHealthCheck instances.
 */
export class HealthCheckRegistry {
  private static checks = new Map<string, IHealthCheck>();

  public static register(check: IHealthCheck): void {
    this.checks.set(check.name, check);
  }

  public static getChecks(): IHealthCheck[] {
    return Array.from(this.checks.values());
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.checks.clear();
  }
}
