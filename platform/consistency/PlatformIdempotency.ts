export class PlatformIdempotency {
  private readonly cache = new Map<string, { success: boolean; result?: any; error?: string }>();
  private readonly activeExecutions = new Map<string, Promise<any>>();

  public async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (!key) {
      return await fn();
    }

    const cached = this.cache.get(key);
    if (cached) {
      if (cached.success) {
        return cached.result;
      }
    }

    if (this.activeExecutions.has(key)) {
      return await this.activeExecutions.get(key);
    }

    const executionPromise = (async () => {
      try {
        const result = await fn();
        this.cache.set(key, { success: true, result });
        return result;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        this.cache.set(key, { success: false, error: errMsg });
        throw err;
      } finally {
        this.activeExecutions.delete(key);
      }
    })();

    this.activeExecutions.set(key, executionPromise);
    return await executionPromise;
  }

  public clear(): void {
    this.cache.clear();
    this.activeExecutions.clear();
  }
}
