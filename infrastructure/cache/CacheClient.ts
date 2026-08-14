/**
 * CacheClient mapping key/value operations with expiration times.
 */
export class CacheClient {
  private readonly store = new Map<string, { value: string; expiresAt?: number }>();

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  public async get(key: string): Promise<string | null> {
    const val = this.store.get(key);
    if (!val) return null;

    if (val.expiresAt && val.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return val.value;
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }
}
