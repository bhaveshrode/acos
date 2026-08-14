import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

/**
 * Singleton cache preserving the built ConfigurationSnapshot during application lifetime.
 */
export class ConfigurationCache {
  private static instance: ConfigurationSnapshot | null = null;

  /**
   * Retrieves the cached snapshot.
   * Throws an error if the cache has not been initialized.
   */
  public static get(): ConfigurationSnapshot {
    if (!this.instance) {
      throw new Error("Configuration snapshot has not been initialized in cache.");
    }
    return this.instance;
  }

  /**
   * Sets the singleton configuration snapshot.
   */
  public static set(snapshot: ConfigurationSnapshot): void {
    this.instance = snapshot;
  }

  /**
   * Clears the cached snapshot (primarily used during testing resets).
   */
  public static clear(): void {
    this.instance = null;
  }
}
