/**
 * RuntimeTelemetry gathering system latencies.
 */
export class RuntimeTelemetry {
  private readonly startTimes = new Map<string, number>();
  private readonly endTimes = new Map<string, number>();

  public startTrace(name: string): void {
    this.startTimes.set(name.toLowerCase(), Date.now());
  }

  public endTrace(name: string): void {
    this.endTimes.set(name.toLowerCase(), Date.now());
  }

  public getDurationMs(name: string): number {
    const key = name.toLowerCase();
    const start = this.startTimes.get(key) ?? 0;
    const end = this.endTimes.get(key) ?? 0;
    return Math.max(0, end - start);
  }

  public clear(): void {
    this.startTimes.clear();
    this.endTimes.clear();
  }
}
