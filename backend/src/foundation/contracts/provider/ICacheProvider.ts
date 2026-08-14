import { Result } from "../../result/Result.js";

/**
 * Interface representing quick key-value TTL caching capabilities (e.g. Redis, Memcached).
 */
export interface ICacheProvider {
  /**
   * Retrieves a cached value by key.
   * Returns a successful Result containing null if key is missing or expired.
   */
  get<T>(key: string): Promise<Result<T | null>>;

  /**
   * Sets a cached value with an optional time-to-live.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<Result<void>>;

  /**
   * Deletes a cached entry by key.
   */
  delete(key: string): Promise<Result<void>>;

  /**
   * Flushes the entire cache workspace.
   */
  clear(): Promise<Result<void>>;
}
