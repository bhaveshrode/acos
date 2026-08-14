import { HealthCheck } from "./HealthCheck.js";
import { HealthReport } from "./HealthReport.js";

/**
 * HealthManager collecting subsystem health details.
 */
export class HealthManager {
  private readonly customChecks = new Map<string, () => Promise<HealthCheck>>();

  public registerCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    this.customChecks.set(name.toLowerCase(), checkFn);
  }

  public async evaluate(): Promise<HealthReport> {
    const checks: HealthCheck[] = [];

    for (const [name, checkFn] of this.customChecks.entries()) {
      try {
        const res = await checkFn();
        checks.push(res);
      } catch (err: any) {
        checks.push(new HealthCheck(name, false, err.message));
      }
    }

    const overallHealthy = checks.every((c) => c.isHealthy);
    return new HealthReport(overallHealthy, checks);
  }
}
