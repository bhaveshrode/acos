import { Result } from "../../result/Result.js";

/**
 * Interface representing type-safe application configuration retrieval.
 */
export interface IConfigurationProvider {
  /**
   * Retrieves a configuration value by key.
   * Returns a failed Result if the key is missing.
   * @param key The configuration property key name.
   */
  get(key: string): Result<string>;

  /**
   * Retrieves a configuration key, parsed as a number.
   */
  getNumber(key: string): Result<number>;

  /**
   * Retrieves a configuration key, parsed as a boolean.
   */
  getBoolean(key: string): Result<boolean>;
}
