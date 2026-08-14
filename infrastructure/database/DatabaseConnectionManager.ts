import { ConnectionPoolManager } from "./ConnectionPoolManager.js";
import { DatabaseRuntime } from "./DatabaseRuntime.js";

/**
 * DatabaseConnectionManager managing connection instances.
 */
export class DatabaseConnectionManager {
  private readonly pool: ConnectionPoolManager;
  private connected = false;

  constructor(
    public readonly config: { postgresUrl: string; maxPoolSize: number }
  ) {
    this.pool = new ConnectionPoolManager(config.maxPoolSize);
  }

  public async connect(): Promise<DatabaseRuntime> {
    this.connected = true;
    return new DatabaseRuntime(this.config.postgresUrl);
  }

  public acquire(): string {
    if (!this.connected) {
      throw new Error("Cannot acquire connection: Database is not connected");
    }
    return this.pool.acquireConnection();
  }

  public release(connectionId: string): void {
    this.pool.releaseConnection(connectionId);
  }

  public disconnect(): void {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getPool(): ConnectionPoolManager {
    return this.pool;
  }
}
