/**
 * UsageMetricsCollector aggregating click and interaction counts.
 */
export class UsageMetricsCollector {
  private clickCount: number = 0;

  public recordClick(): void {
    this.clickCount++;
  }

  public getClickCount(): number {
    return this.clickCount;
  }
}
