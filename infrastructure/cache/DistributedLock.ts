import { CacheClient } from "./CacheClient.js";

/**
 * DistributedLock coordinating lock keys.
 */
export class DistributedLock {
  constructor(private readonly client: CacheClient) {}

  public async acquire(lockKey: string, ttlSeconds = 10): Promise<boolean> {
    const val = await this.client.get(lockKey);
    if (val !== null) {
      return false; // Lock already acquired
    }

    await this.client.set(lockKey, "LOCKED", ttlSeconds);
    return true;
  }

  public async release(lockKey: string): Promise<void> {
    await this.client.delete(lockKey);
  }
}
