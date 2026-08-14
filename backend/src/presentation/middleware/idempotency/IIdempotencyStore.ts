/**
 * Interface contract for idempotency key storage.
 */
export interface IIdempotencyStore {
  /**
   * Retrieves a cached response by its idempotency key.
   */
  get(key: string): Promise<{ statusCode: number; responseBody: string } | null>;

  /**
   * Saves a response under the given idempotency key.
   */
  save(key: string, statusCode: number, responseBody: string): Promise<void>;

  /**
   * Clears all stored records (useful for tests/resets).
   */
  clear(): Promise<void>;
}
