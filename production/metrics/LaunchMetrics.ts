import { ProductionSLO } from "./ProductionSLO.js";

/**
 * LaunchMetrics measuring live transaction ratios.
 */
export class LaunchMetrics {
  private readonly counters = new Map<string, { total: number; success: number }>();

  public recordAttempt(metric: string, isSuccess: boolean): void {
    const key = metric.toLowerCase();
    const cur = this.counters.get(key) ?? { total: 0, success: 0 };
    this.counters.set(key, {
      total: cur.total + 1,
      success: cur.success + (isSuccess ? 1 : 0)
    });
  }

  public getSuccessRate(metric: string): number {
    const cur = this.counters.get(metric.toLowerCase());
    if (!cur || cur.total === 0) return 100.0;
    return (cur.success / cur.total) * 100.0;
  }

  public isSLOSatisfied(metric: string, slo: ProductionSLO): boolean {
    const rate = this.getSuccessRate(metric);
    return rate >= slo.targetPercentage;
  }

  public clear(): void {
    this.counters.clear();
  }
}
