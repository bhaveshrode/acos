/**
 * AnalyticsScheduler triggering periodic telemetry flushes.
 */
export class AnalyticsScheduler {
  private intervalId?: any;

  public startFlushLoop(flushFn: () => void, intervalMs: number): void {
    this.intervalId = setInterval(flushFn, intervalMs);
  }

  public stopFlushLoop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
