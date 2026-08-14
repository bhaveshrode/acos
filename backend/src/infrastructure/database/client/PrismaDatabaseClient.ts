import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { DatabaseConfiguration } from "../configuration/DatabaseConfiguration.js";

/**
 * Initializes and manages the physical PrismaClient ORM client instance with PostgreSQL drivers.
 */
export class PrismaDatabaseClient {
  private clientInstance: PrismaClient | null = null;
  private poolInstance: pg.Pool | null = null;

  constructor(private readonly config: DatabaseConfiguration) {}

  /**
   * Retrieves or builds the PrismaClient instance with its PostgreSQL driver adapter.
   */
  public getClient(): PrismaClient {
    if (!this.clientInstance) {
      const connectionString = this.config.connectionString;

      // Initialize the pg connection pool
      this.poolInstance = new pg.Pool({
        connectionString,
        max: this.config.poolSize,
        idleTimeoutMillis: this.config.timeoutSeconds * 1000
      });

      // Wrap the pg pool in the PrismaPg adapter
      const adapter = new PrismaPg(this.poolInstance);

      // Pass the adapter directly to PrismaClient constructor
      this.clientInstance = new PrismaClient({
        adapter,
        log: [
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" }
        ]
      });
    }
    return this.clientInstance;
  }

  /**
   * Closes the underlying database connection pool.
   */
  public async closePool(): Promise<void> {
    if (this.poolInstance) {
      await this.poolInstance.end();
      this.poolInstance = null;
    }
    this.clientInstance = null;
  }
}
