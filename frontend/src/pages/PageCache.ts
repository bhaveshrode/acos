/**
 * PageCache holding active page instances to prevent redundant allocations.
 */
export class PageCache {
  private readonly cache = new Map<string, any>();

  public set(key: string, pageInstance: any): void {
    this.cache.set(key, pageInstance);
  }

  public get(key: string): any | undefined {
    return this.cache.get(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}
