/**
 * FormCache caching loaded form classes to avoid redundant resolutions.
 */
export class FormCache {
  private readonly cache = new Map<string, any>();

  public set(key: string, formClass: any): void {
    this.cache.set(key, formClass);
  }

  public get(key: string): any | undefined {
    return this.cache.get(key);
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}
