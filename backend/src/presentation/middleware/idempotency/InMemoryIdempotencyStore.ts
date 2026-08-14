import { IIdempotencyStore } from "./IIdempotencyStore.js";

/**
 * In-memory fallback implementation of IIdempotencyStore.
 */
export class InMemoryIdempotencyStore implements IIdempotencyStore {
  private readonly store = new Map<string, { statusCode: number; responseBody: string }>();

  public async get(key: string): Promise<{ statusCode: number; responseBody: string } | null> {
    return this.store.get(key) || null;
  }

  public async save(key: string, statusCode: number, responseBody: string): Promise<void> {
    this.store.set(key, { statusCode, responseBody });
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}
