/**
 * PerformanceTracker recording rendering durations and network latencies.
 */
export class PerformanceTracker {
  private readonly metrics = new Map<string, number>();

  public recordMetric(metricName: string, durationMs: number): void {
    this.metrics.set(metricName, durationMs);
  }

  public getMetric(metricName: string): number | undefined {
    return this.metrics.get(metricName);
  }
}
