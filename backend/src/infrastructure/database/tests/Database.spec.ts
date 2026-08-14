import { describe, it, expect, vi } from "vitest";
import { DatabaseConfiguration } from "../configuration/DatabaseConfiguration.js";
import { PrismaDatabaseClient } from "../client/PrismaDatabaseClient.js";
import { DatabaseConnection } from "../connection/DatabaseConnection.js";
import { DatabaseHealthChecker } from "../health/DatabaseHealthChecker.js";
import { PrismaClient } from "@prisma/client";

describe("Database Infrastructure Layer Tests (Task 24.6)", () => {
  const mockDbConfig = {
    connectionString: "postgresql://test-user:test-pass@localhost:5432/test-db",
    poolSize: 15,
    timeoutSeconds: 45
  };

  it("should correctly map configuration options", () => {
    const config = new DatabaseConfiguration(mockDbConfig);
    expect(config.connectionString).toBe(mockDbConfig.connectionString);
    expect(config.poolSize).toBe(mockDbConfig.poolSize);
    expect(config.timeoutSeconds).toBe(mockDbConfig.timeoutSeconds);
  });

  it("should initialize PrismaClient with correct connection configurations", () => {
    const config = new DatabaseConfiguration(mockDbConfig);
    const clientManager = new PrismaDatabaseClient(config);
    const client = clientManager.getClient();
    expect(client).toBeDefined();
    expect(typeof client.$connect).toBe("function");
    clientManager.closePool();
  });

  it("should manage connection active state status", async () => {
    const config = new DatabaseConfiguration(mockDbConfig);
    const mockClient = {
      $connect: vi.fn().mockResolvedValue(undefined),
      $disconnect: vi.fn().mockResolvedValue(undefined)
    } as unknown as PrismaClient;

    const connection = new DatabaseConnection(mockClient, config);
    expect(connection.active).toBe(false);

    await connection.connect();
    expect(connection.active).toBe(true);
    expect(mockClient.$connect).toHaveBeenCalledTimes(1);

    await connection.disconnect();
    expect(connection.active).toBe(false);
    expect(mockClient.$disconnect).toHaveBeenCalledTimes(1);
  });

  it("should capture connection errors on connect failure", async () => {
    const config = new DatabaseConfiguration(mockDbConfig);
    const mockClient = {
      $connect: vi.fn().mockRejectedValue(new Error("Connection timeout.")),
      $disconnect: vi.fn()
    } as unknown as PrismaClient;

    const connection = new DatabaseConnection(mockClient, config);
    await expect(connection.connect()).rejects.toThrow("Connection timeout.");
    expect(connection.active).toBe(false);
  });

  it("should pass health checks when ping query succeeds", async () => {
    const mockClient = {
      $queryRaw: vi.fn().mockResolvedValue([1])
    } as unknown as PrismaClient;

    const checker = new DatabaseHealthChecker(mockClient);
    const result = await checker.checkHealth();

    expect(result.status).toBe("healthy");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();
  });

  it("should fail health checks when ping query rejects", async () => {
    const mockClient = {
      $queryRaw: vi.fn().mockRejectedValue(new Error("Database offline."))
    } as unknown as PrismaClient;

    const checker = new DatabaseHealthChecker(mockClient);
    const result = await checker.checkHealth();

    expect(result.status).toBe("unhealthy");
    expect(result.error).toBe("Database offline.");
    expect(result.latencyMs).toBeUndefined();
  });
});
