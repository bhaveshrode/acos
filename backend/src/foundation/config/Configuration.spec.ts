import { describe, it, expect } from "vitest";
import { Result } from "../result/Result.js";
import { ResultError } from "../result/ResultError.js";
import { IConfigurationProvider } from "../contracts/system/IConfigurationProvider.js";
import { ConfigurationSnapshot } from "./ConfigurationSnapshot.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";
import { ConfigurationFactory } from "./ConfigurationFactory.js";

// Helper helper mock provider class
class MockConfigProvider implements IConfigurationProvider {
  private readonly values = new Map<string, any>();

  constructor(initialValues: Record<string, any> = {}) {
    Object.entries(initialValues).forEach(([k, v]) => {
      this.values.set(k, v);
    });
  }

  public get(key: string): Result<string> {
    const val = this.values.get(key);
    return val !== undefined ? Result.ok(String(val)) : Result.fail(ResultError.notFound(`Key ${key} not found`));
  }

  public getNumber(key: string): Result<number> {
    const val = this.values.get(key);
    return typeof val === "number" ? Result.ok(val) : Result.fail(ResultError.notFound(`Key ${key} not found`));
  }

  public getBoolean(key: string): Result<boolean> {
    const val = this.values.get(key);
    return typeof val === "boolean" ? Result.ok(val) : Result.fail(ResultError.notFound(`Key ${key} not found`));
  }
}

describe("Configuration Submodule Unit Tests (Task 8.2)", () => {
  const validProps = {
    app: { name: "ACOS", version: "1.0.0", environment: "testing" as const, debug: true },
    database: { connectionString: "sqlite://local.db", poolSize: 5, timeoutSeconds: 30 },
    event: { provider: "in-memory", retryCount: 3, batchSize: 50, deadLetterEnabled: false },
    logging: { minLevel: "DEBUG", structuredLoggingEnabled: true },
    security: { jwtSecret: "my-super-secret-key-12345", jwtExpirationSeconds: 3600, issuer: "acos", passwordMinLength: 8 },
    payment: { settlementTimeoutSeconds: 60, defaultNetwork: "devnet", supportedCurrencies: ["USD", "EUR"] },
    ai: { defaultModel: "gemini", temperature: 0.5, maxTokens: 1000, timeoutMs: 15000 }
  };

  describe("ConfigurationSnapshot Immutability", () => {
    it("should instantiate correctly and enforce deep immutability", () => {
      const config = new ConfigurationSnapshot(validProps);

      expect(config.app.name).toBe("ACOS");
      expect(config.database.poolSize).toBe(5);
      
      // Verify deep freeze properties
      expect(() => {
        (config.app as any).name = "HackedName";
      }).toThrow();

      expect(() => {
        (config.database as any).poolSize = 100;
      }).toThrow();

      expect(() => {
        (config.payment.supportedCurrencies as any)[0] = "ETH";
      }).toThrow();
    });
  });

  describe("ConfigurationValidator", () => {
    it("should pass validation with complete, valid configs", () => {
      const config = new ConfigurationSnapshot(validProps);
      expect(() => ConfigurationValidator.validate(config)).not.toThrow();
    });

    it("should throw ConfigurationException if required connectionString is empty", () => {
      const badProps = {
        ...validProps,
        database: { connectionString: "", poolSize: 5, timeoutSeconds: 30 } // Empty connection string
      };
      const config = new ConfigurationSnapshot(badProps);
      expect(() => ConfigurationValidator.validate(config)).toThrow("Invalid Database Configuration.");
    });

    it("should throw ConfigurationException if poolSize is out of range", () => {
      const badProps = {
        ...validProps,
        database: { connectionString: "sqlite://", poolSize: 0, timeoutSeconds: 30 } // Out of bounds min=1
      };
      const config = new ConfigurationSnapshot(badProps);
      expect(() => ConfigurationValidator.validate(config)).toThrow("Invalid Database Configuration.");
    });

    it("should throw ConfigurationException if environment is invalid", () => {
      const badProps = {
        ...validProps,
        app: { name: "ACOS", version: "1", environment: "hacked-env" as any, debug: false }
      };
      const config = new ConfigurationSnapshot(badProps);
      expect(() => ConfigurationValidator.validate(config)).toThrow("Invalid environment setting: 'hacked-env'.");
    });

    it("should throw ConfigurationException if supportedCurrencies list is empty", () => {
      const badProps = {
        ...validProps,
        payment: { settlementTimeoutSeconds: 60, defaultNetwork: "devnet", supportedCurrencies: [] }
      };
      const config = new ConfigurationSnapshot(badProps);
      expect(() => ConfigurationValidator.validate(config)).toThrow("Invalid Payment Configuration: supportedCurrencies cannot be empty.");
    });
  });

  describe("ConfigurationFactory", () => {
    it("should build and validate configuration correctly using configuration provider values", () => {
      const provider = new MockConfigProvider({
        "app.name": "AutonomousOS",
        "app.version": "1.2.0",
        "app.environment": "production",
        "app.debug": false,
        "database.connectionString": "postgresql://localhost:5432",
        "database.poolSize": 20,
        "database.timeoutSeconds": 60,
        "event.provider": "rabbitmq",
        "event.retryCount": 5,
        "event.batchSize": 200,
        "event.deadLetterEnabled": true,
        "logging.minLevel": "WARN",
        "logging.structuredLoggingEnabled": false,
        "security.jwtSecret": "prod-secret-key-that-is-very-long",
        "security.jwtExpirationSeconds": 7200,
        "security.issuer": "acos.prod",
        "security.passwordMinLength": 12,
        "payment.settlementTimeoutSeconds": 1800,
        "payment.defaultNetwork": "mainnet",
        "payment.supportedCurrencies": "USD,EUR,GBP",
        "ai.defaultModel": "gemini-ultra",
        "ai.temperature": 0.2,
        "ai.maxTokens": 4096,
        "ai.timeoutMs": 60000
      });

      const config = ConfigurationFactory.create(provider);

      expect(config.app.name).toBe("AutonomousOS");
      expect(config.app.environment).toBe("production");
      expect(config.app.debug).toBe(false);
      
      expect(config.database.connectionString).toBe("postgresql://localhost:5432");
      expect(config.database.poolSize).toBe(20);
      
      expect(config.event.provider).toBe("rabbitmq");
      expect(config.event.deadLetterEnabled).toBe(true);

      expect(config.logging.minLevel).toBe("WARN");
      expect(config.logging.structuredLoggingEnabled).toBe(false);

      expect(config.security.jwtSecret).toBe("prod-secret-key-that-is-very-long");
      expect(config.security.passwordMinLength).toBe(12);

      expect(config.payment.supportedCurrencies).toEqual(["USD", "EUR", "GBP"]);
      expect(config.payment.defaultNetwork).toBe("mainnet");

      expect(config.ai.defaultModel).toBe("gemini-ultra");
      expect(config.ai.temperature).toBe(0.2);
    });

    it("should fallback to default parameters for optional omitted configuration keys", () => {
      const provider = new MockConfigProvider({
        // Provide only mandatory fields to satisfy validation
        "database.connectionString": "sqlite://local.db",
        "security.jwtSecret": "fallback-secret-jwt-hash-key-value"
      });

      const config = ConfigurationFactory.create(provider);

      // Verify that missing optional keys fell back to defaults correctly
      expect(config.app.name).toBe("ACOS");
      expect(config.app.environment).toBe("development");
      expect(config.database.poolSize).toBe(10);
      expect(config.event.provider).toBe("in-memory");
      expect(config.logging.minLevel).toBe("INFO");
      expect(config.security.issuer).toBe("acos.internal");
      expect(config.payment.supportedCurrencies).toEqual(["USD", "EUR"]);
      expect(config.ai.defaultModel).toBe("gemini-2.5-flash");
    });
  });
});
