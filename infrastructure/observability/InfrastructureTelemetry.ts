/**
 * InfrastructureTelemetry archiving resource logs and times.
 */
export class InfrastructureTelemetry {
  private readonly records = new Map<string, number>();

  public logLatency(metric: string, milliseconds: number): void {
    this.records.set(metric.toLowerCase(), milliseconds);
  }

  public getLatency(metric: string): number {
    return this.records.get(metric.toLowerCase()) ?? 0;
  }

  public clear(): void {
    this.records.clear();
  }
}
