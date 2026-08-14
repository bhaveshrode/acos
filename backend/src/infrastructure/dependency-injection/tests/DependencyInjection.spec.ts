import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServiceContainer } from "../container/ServiceContainer.js";
import { Lifetime } from "../lifetimes/Lifetime.js";
import { DependencyGraphValidator } from "../validation/DependencyGraphValidator.js";
import { Bootstrapper } from "../bootstrap/Bootstrapper.js";
import { ConfigurationCache } from "../../configuration/cache/ConfigurationCache.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

describe("Dependency Injection Infrastructure Layer Tests (Task 30.8)", () => {
  beforeEach(() => {
    ConfigurationCache.clear();
  });

  describe("Lifetimes & Scoping", () => {
    it("should resolve singletons as a single shared instance", () => {
      const container = new ServiceContainer();
      let count = 0;
      container.register("CountService", () => {
        count++;
        return { count };
      }, Lifetime.SINGLETON);

      const s1 = container.resolve<any>("CountService");
      const s2 = container.resolve<any>("CountService");

      expect(s1.count).toBe(1);
      expect(s2.count).toBe(1);
      expect(s1).toBe(s2);
    });

    it("should resolve transients as fresh instances on every call", () => {
      const container = new ServiceContainer();
      let count = 0;
      container.register("CountService", () => {
        count++;
        return { count };
      }, Lifetime.TRANSIENT);

      const t1 = container.resolve<any>("CountService");
      const t2 = container.resolve<any>("CountService");

      expect(t1.count).toBe(1);
      expect(t2.count).toBe(2);
      expect(t1).not.toBe(t2);
    });

    it("should isolate scoped services between parent and child scopes", () => {
      const container = new ServiceContainer();
      let count = 0;
      container.register("ScopedService", () => {
        count++;
        return { count };
      }, Lifetime.SCOPED);

      // Parent resolves instance
      const parentVal = container.resolve<any>("ScopedService");
      expect(parentVal.count).toBe(1);

      // Create child scopes
      const scopeA = container.createScope();
      const scopeB = container.createScope();

      const a1 = scopeA.resolve<any>("ScopedService");
      const a2 = scopeA.resolve<any>("ScopedService");
      const b1 = scopeB.resolve<any>("ScopedService");

      expect(a1.count).toBe(2);
      expect(a2.count).toBe(2); // Cached within scopeA
      expect(b1.count).toBe(3); // Fresh instance resolved for scopeB

      expect(a1).toBe(a2);
      expect(a1).not.toBe(b1);
      expect(a1).not.toBe(parentVal);
    });
  });

  describe("Nested Resolution", () => {
    it("should recursively resolve dependencies down the tree", () => {
      const container = new ServiceContainer();
      container.register("Config", () => ({ key: "val" }), Lifetime.SINGLETON);
      container.register("Database", (c) => ({
        config: c.resolve<any>("Config"),
        connected: true
      }), Lifetime.SCOPED);
      container.register("Repository", (c) => ({
        db: c.resolve<any>("Database")
      }), Lifetime.TRANSIENT);

      const repo = container.resolve<any>("Repository");
      expect(repo.db.connected).toBe(true);
      expect(repo.db.config.key).toBe("val");
    });
  });

  describe("Circular Dependency & Validation", () => {
    it("should throw Circular dependency exception when circular cycles are present", () => {
      const container = new ServiceContainer();
      container.register("ServiceA", (c) => c.resolve("ServiceB"));
      container.register("ServiceB", (c) => c.resolve("ServiceA"));

      expect(() => {
        container.resolve("ServiceA");
      }).toThrow("Circular dependency detected: ServiceA -> ServiceB -> ServiceA");
    });

    it("should fail validation if registered graph contains cycles", () => {
      const container = new ServiceContainer();
      container.register("ServiceA", (c) => c.resolve("ServiceB"));
      container.register("ServiceB", (c) => c.resolve("ServiceA"));

      expect(() => {
        DependencyGraphValidator.validate(container);
      }).toThrow("Circular dependency detected");
    });
  });

  describe("Application Bootstrapper", () => {
    it("should bootstrap successfully when config singleton is present", () => {
      // Inject required settings to pass configuration validator startup checks
      const mockSnapshot = new ConfigurationSnapshot({
        app: { name: "ACOS-DI-Test", version: "1.0.0", environment: "development", debug: false },
        database: { connectionString: "postgresql://localhost:5432/acos", poolSize: 10, timeoutSeconds: 30 },
        event: { provider: "in-memory", retryCount: 3, batchSize: 100, deadLetterEnabled: false },
        logging: { minLevel: "INFO", structuredLoggingEnabled: true },
        security: { jwtSecret: "jwt-secret-key-32-chars-long-random-string", jwtExpirationSeconds: 3600, issuer: "acos", passwordMinLength: 8 },
        payment: { settlementTimeoutSeconds: 3600, defaultNetwork: "localhost", supportedCurrencies: ["USD"] },
        ai: { defaultModel: "gemini", temperature: 0.7, maxTokens: 2048, timeoutMs: 30000 }
      });
      ConfigurationCache.set(mockSnapshot);

      const container = Bootstrapper.bootstrap();
      expect(container).toBeInstanceOf(ServiceContainer);

      // Verify a few key infrastructure mappings resolved correctly
      const uow = container.resolve("IUnitOfWork");
      expect(uow).toBeDefined();

      const bus = container.resolve("IEventBus");
      expect(bus).toBeDefined();
    });
  });
});
