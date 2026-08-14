import { PrismaClient } from "@prisma/client";

/**
 * Health monitor component performing connection ping checks against the database.
 */
export class DatabaseHealthChecker {
  constructor(private readonly client: PrismaClient) {}

  /**
   * Pings the database with a raw query to check connectivity and calculate response latency.
   */
  public async checkHealth(): Promise<{
    status: "healthy" | "unhealthy";
    latencyMs?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      // Ping query checking PostgreSQL/SQLite connectivity
      await this.client.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - startTime;
      return { status: "healthy", latencyMs };
    } catch (error: any) {
      return { status: "unhealthy", error: error.message };
    }
  }
}
