import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EnvironmentLoader } from "../loaders/EnvironmentLoader.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { EnvironmentConfigurationProvider } from "../providers/EnvironmentConfigurationProvider.js";
import { JsonConfigurationProvider } from "../providers/JsonConfigurationProvider.js";
import { CompositeConfigurationProvider } from "../providers/CompositeConfigurationProvider.js";
import { ConfigurationBuilder } from "../builders/ConfigurationBuilder.js";
import { ConfigurationCache } from "../cache/ConfigurationCache.js";
import { EnvironmentDetector } from "../environments/EnvironmentDetector.js";
import { EnvironmentSecretProvider } from "../secrets/SecretProvider.js";
import fs from "fs";

describe("Configuration Infrastructure Layer Tests (Task 29.7)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    ConfigurationCache.clear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("EnvironmentLoader", () => {
    it("should load process.env and translate double underscores to dot notation", () => {
      process.env.APP__NAME = "ACOS-Test";
      process.env.DATABASE__POOLSIZE = "25";

      const parsed = EnvironmentLoader.load();
      expect(parsed["app.name"]).toBe("ACOS-Test");
      expect(parsed["database.poolsize"]).toBe("25");
    });
  });

  describe("JsonLoader", () => {
    it("should recursively flatten nested JSON structures into dot-separated paths", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({
          app: {
            name: "ACOS-Json",
            debug: true
          },
          database: {
            timeoutSeconds: 45
          }
        })
      );

      const parsed = JsonLoader.load("mock-path.json");
      expect(parsed["app.name"]).toBe("ACOS-Json");
      expect(parsed["app.debug"]).toBe("true");
      expect(parsed["database.timeoutSeconds"]).toBe("45");

      vi.restoreAllMocks();
    });
  });

  describe("BaseConfigurationProvider Parsing", () => {
    it("should correctly parse type-safe strings, numbers, and booleans with defaults", () => {
      const values = {
        "app.name": "ACOS",
        "database.poolsize": "15",
        "app.debug": "true",
        "logging.structuredloggingenabled": "yes",
        "event.deadletterenabled": "0"
      };
      const provider = new JsonConfigurationProvider(values);

      expect(provider.get("app.name").value).toBe("ACOS");
      expect(provider.getNumber("database.poolsize").value).toBe(15);
      expect(provider.getBoolean("app.debug").value).toBe(true);
      expect(provider.getBoolean("logging.structuredloggingenabled").value).toBe(true);
      expect(provider.getBoolean("event.deadletterenabled").value).toBe(false);
    });
  });

  describe("CompositeConfigurationProvider Overriding", () => {
    it("should override earlier values with subsequent providers in composite stack", () => {
      const baseValues = {
        "app.name": "BaseApp",
        "app.debug": "false"
      };
      const envValues = {
        "app.debug": "true"
      };

      const baseProvider = new JsonConfigurationProvider(baseValues);
      const envProvider = new JsonConfigurationProvider(envValues);
      const composite = new CompositeConfigurationProvider([baseProvider, envProvider]);

      expect(composite.get("app.name").value).toBe("BaseApp");
      expect(composite.getBoolean("app.debug").value).toBe(true);
    });
  });

  describe("ConfigurationBuilder & Caching", () => {
    it("should build and cache a valid ConfigurationSnapshot", () => {
      const builder = new ConfigurationBuilder();
      
      // Inject required settings to pass configuration validator startup checks
      const values = {
        "database.connectionstring": "postgresql://localhost:5432/acos",
        "security.jwtsecret": "extremely-secure-random-jwt-secret-key-32-chars-long",
        "app.environment": "development"
      };
      builder.addProvider(new JsonConfigurationProvider(values));

      const snapshot = builder.build();
      expect(snapshot.database.connectionString).toBe("postgresql://localhost:5432/acos");
      expect(snapshot.security.jwtSecret).toBe("extremely-secure-random-jwt-secret-key-32-chars-long");

      ConfigurationCache.set(snapshot);
      expect(ConfigurationCache.get()).toBe(snapshot);
    });
  });

  describe("EnvironmentDetector", () => {
    it("should resolve environment flag indicators", () => {
      process.env.NODE_ENV = "PRODUCTION";
      expect(EnvironmentDetector.getEnvironment()).toBe("production");
      expect(EnvironmentDetector.isProduction()).toBe(true);
      expect(EnvironmentDetector.isDevelopment()).toBe(false);
    });
  });

  describe("EnvironmentSecretProvider", () => {
    it("should retrieve key credentials from environment variables", async () => {
      process.env.JWT_SECRET = "super-secret";
      const provider = new EnvironmentSecretProvider();
      const val = await provider.getSecret("JWT_SECRET");
      expect(val).toBe("super-secret");
    });
  });
});
