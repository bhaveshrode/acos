import { PrismaClient } from "@prisma/client";
import { DatabaseConfiguration } from "../configuration/DatabaseConfiguration.js";

/**
 * Handles database connection lifecycle actions, wrapping ORM connection hooks and shutdowns.
 */
export class DatabaseConnection {
  private isConnected: boolean = false;

  constructor(
    private readonly client: PrismaClient,
    private readonly config: DatabaseConfiguration,
    private readonly onClosePool?: () => Promise<void>
  ) {}

  /**
   * Triggers the initial connection to the database.
   */
  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      // Connect to the DB
      await this.client.$connect();
      this.isConnected = true;
    } catch (error: any) {
      throw new Error(`Failed to establish database connection: ${error.message}`);
    }
  }

  /**
   * Closes the active connection pool.
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.$disconnect();
      if (this.onClosePool) {
        await this.onClosePool();
      }
      this.isConnected = false;
    } catch (error: any) {
      throw new Error(`Failed to close database connection gracefully: ${error.message}`);
    }
  }

  /**
   * Returns connection status.
   */
  public get active(): boolean {
    return this.isConnected;
  }
}
