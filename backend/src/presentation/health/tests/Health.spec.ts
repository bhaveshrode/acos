import { describe, it, expect, beforeEach } from "vitest";
import { HealthStatus } from "../HealthStatus.js";
import { HealthContext } from "../HealthContext.js";
import { HealthReport } from "../HealthReport.js";
import { DatabaseHealthCheck } from "../DatabaseHealthCheck.js";
import { StorageHealthCheck } from "../StorageHealthCheck.js";
import { BlockchainHealthCheck } from "../BlockchainHealthCheck.js";
import { NotificationHealthCheck } from "../NotificationHealthCheck.js";
import { ConfigurationHealthCheck } from "../ConfigurationHealthCheck.js";
import { HealthCheckRegistry } from "../HealthCheckRegistry.js";
import { HealthCheckRunner } from "../HealthCheckRunner.js";
import { HealthAggregator } from "../HealthAggregator.js";
import { HealthResponseBuilder } from "../HealthResponseBuilder.js";
import { HealthController } from "../HealthController.js";
import { HealthPolicy } from "../HealthPolicy.js";
import { HealthFactory } from "../HealthFactory.js";

describe("Presentation Health Component Tests (Task 51.7)", () => {
  beforeEach(() => {
    HealthCheckRegistry.clear();
  });

  describe("Health Models & Context", () => {
    it("should initialize health context tags", () => {
      const now = new Date();
      const ctx = new HealthContext(now, { env: "prod" });

      expect(ctx.timestamp).toBe(now);
      expect(ctx.metadata).toEqual({ env: "prod" });
    });

    it("should define core health statuses enum keys", () => {
      expect(HealthStatus.Healthy).toBe("Healthy");
      expect(HealthStatus.Degraded).toBe("Degraded");
      expect(HealthStatus.Unhealthy).toBe("Unhealthy");
    });
  });

  describe("Component Probes checks", () => {
    it("should execute default storage, blockchain, notification, and configuration probes", async () => {
      const storage = new StorageHealthCheck();
      const blockchain = new BlockchainHealthCheck();
      const notification = new NotificationHealthCheck();
      const config = new ConfigurationHealthCheck();

      const r1 = await storage.check();
      const r2 = await blockchain.check();
      const r3 = await notification.check();
      const r4 = await config.check();

      expect(r1.status).toBe(HealthStatus.Healthy);
      expect(r2.status).toBe(HealthStatus.Healthy);
      expect(r3.status).toBe(HealthStatus.Healthy);
      expect(r4.status).toBe(HealthStatus.Healthy);
    });

    it("should probe database ping successfully or mark Unhealthy on exceptions", async () => {
      const dbMonitorOk = {
        ping: async () => "OK"
      };
      const checkOk = new DatabaseHealthCheck(dbMonitorOk);
      const rOk = await checkOk.check();
      expect(rOk.status).toBe(HealthStatus.Healthy);

      const dbMonitorErr = {
        ping: async () => {
          throw new Error("Connection timed out");
        }
      };
      const checkErr = new DatabaseHealthCheck(dbMonitorErr);
      const rErr = await checkErr.check();
      expect(rErr.status).toBe(HealthStatus.Unhealthy);
      expect(rErr.error).toBe("Connection timed out");
    });
  });

  describe("Runners & Aggregators", () => {
    it("should store and clean checks using HealthCheckRegistry", () => {
      expect(HealthCheckRegistry.getChecks().length).toBe(0);
      HealthCheckRegistry.register(new StorageHealthCheck());
      expect(HealthCheckRegistry.getChecks().length).toBe(1);
    });

    it("should execute all checks in parallel using HealthCheckRunner", async () => {
      const c1 = new StorageHealthCheck();
      const c2 = new BlockchainHealthCheck();
      const runner = new HealthCheckRunner([c1, c2]);

      const results = await runner.run();
      expect(results.length).toBe(2);
      expect(results[0].name).toBe("Storage");
      expect(results[1].name).toBe("Blockchain");
    });

    it("should aggregate healthy, degraded, and unhealthy statuses logically", () => {
      const agg = new HealthAggregator();

      // All healthy
      const r1 = agg.aggregate(
        [
          { name: "DB", status: HealthStatus.Healthy, durationMs: 1 },
          { name: "Storage", status: HealthStatus.Healthy, durationMs: 2 }
        ],
        10
      );
      expect(r1.status).toBe(HealthStatus.Healthy);

      // One Degraded
      const r2 = agg.aggregate(
        [
          { name: "DB", status: HealthStatus.Healthy, durationMs: 1 },
          { name: "Storage", status: HealthStatus.Degraded, durationMs: 2 }
        ],
        10
      );
      expect(r2.status).toBe(HealthStatus.Degraded);

      // One Unhealthy (takes absolute priority)
      const r3 = agg.aggregate(
        [
          { name: "DB", status: HealthStatus.Unhealthy, durationMs: 1 },
          { name: "Storage", status: HealthStatus.Degraded, durationMs: 2 }
        ],
        10
      );
      expect(r3.status).toBe(HealthStatus.Unhealthy);
    });
  });

  describe("Endpoints & Response builders", () => {
    it("should format standardized JSON responses", () => {
      const builder = new HealthResponseBuilder();
      const report = new HealthReport(HealthStatus.Healthy, [
        { name: "DB", status: HealthStatus.Healthy, durationMs: 15 }
      ], 20);

      const res = builder.build(report);
      expect(res.status).toBe(HealthStatus.Healthy);
      expect(res.durationMs).toBe(20);
      expect(res.details.DB.status).toBe(HealthStatus.Healthy);
      expect(res.details.DB.durationMs).toBe(15);
    });

    it("should return HTTP 200 on healthy states and HTTP 503 on unhealthy states", async () => {
      const mockOkRunner = {
        run: async () => [
          { name: "DB", status: HealthStatus.Healthy, durationMs: 1 }
        ]
      } as any;
      const ctrlOk = new HealthController(mockOkRunner, new HealthAggregator(), new HealthResponseBuilder());
      const resOk = await ctrlOk.handleHealth();
      expect(resOk.statusCode).toBe(200);
      expect(resOk.payload.status).toBe(HealthStatus.Healthy);

      const mockErrRunner = {
        run: async () => [
          { name: "DB", status: HealthStatus.Unhealthy, durationMs: 1 }
        ]
      } as any;
      const ctrlErr = new HealthController(mockErrRunner, new HealthAggregator(), new HealthResponseBuilder());
      const resErr = await ctrlErr.handleHealth();
      expect(resErr.statusCode).toBe(503);
      expect(resErr.payload.status).toBe(HealthStatus.Unhealthy);
    });

    it("should initialize default HealthPolicy properties", () => {
      const policy = new HealthPolicy();
      expect(policy.timeoutMs).toBe(5000);
      expect(policy.allowDegradedState).toBe(true);
    });
  });

  describe("HealthFactory builder setups", () => {
    it("should wire runners and controllers, and register default checks", () => {
      HealthFactory.registerDefaultChecks();
      expect(HealthCheckRegistry.getChecks().length).toBe(5);

      const runner = HealthFactory.createRunner();
      expect(runner).toBeInstanceOf(HealthCheckRunner);

      const controller = HealthFactory.createController(runner);
      expect(controller).toBeInstanceOf(HealthController);
    });
  });
});
