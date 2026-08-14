/**
 * RuntimeMetrics storing counts.
 */
export class RuntimeMetrics {
  private readonly counters = new Map<string, number>();

  public increment(counter: string): void {
    const key = counter.toLowerCase();
    const cur = this.counters.get(key) ?? 0;
    this.counters.set(key, cur + 1);
  }

  public get(counter: string): number {
    return this.counters.get(counter.toLowerCase()) ?? 0;
  }

  public clear(): void {
    this.counters.clear();
  }
}
