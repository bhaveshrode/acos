/**
 * ComponentCache caching component classes to prevent repeated resolutions.
 */
export class ComponentCache {
  private readonly cache = new Map<string, any>();

  public set(key: string, component: any): void {
    this.cache.set(key, component);
  }

  public get(key: string): any | undefined {
    return this.cache.get(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}
