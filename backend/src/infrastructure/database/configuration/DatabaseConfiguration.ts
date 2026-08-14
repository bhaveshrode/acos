import { DatabaseConfig } from "../../../foundation/config/ConfigurationSection.js";

/**
 * Configuration manager dedicated to database connectivity settings.
 */
export class DatabaseConfiguration {
  constructor(private readonly config: DatabaseConfig) {}

  /**
   * Retrieves the raw database connection string (e.g. postgresql://user:pass@host:port/db).
   */
  public get connectionString(): string {
    return this.config.connectionString;
  }

  /**
   * Connection pool size.
   */
  public get poolSize(): number {
    return this.config.poolSize;
  }

  /**
   * Connection or query timeout limit in seconds.
   */
  public get timeoutSeconds(): number {
    return this.config.timeoutSeconds;
  }
}
