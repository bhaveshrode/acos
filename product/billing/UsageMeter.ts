/**
 * UsageMeter tracking customer monthly invoice counters.
 */
export class UsageMeter {
  private readonly usage = new Map<string, number>();

  public increment(tenantId: string): void {
    const key = tenantId.toLowerCase();
    const cur = this.usage.get(key) ?? 0;
    this.usage.set(key, cur + 1);
  }

  public get(tenantId: string): number {
    return this.usage.get(tenantId.toLowerCase()) ?? 0;
  }

  public clear(): void {
    this.usage.clear();
  }
}
