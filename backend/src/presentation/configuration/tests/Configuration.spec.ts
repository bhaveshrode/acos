import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PresentationConfiguration } from "../PresentationConfiguration.js";
import { ConfigurationContext } from "../ConfigurationContext.js";
import { EnvironmentConfigurationLoader } from "../EnvironmentConfigurationLoader.js";
import { JsonConfigurationLoader } from "../JsonConfigurationLoader.js";
import { CompositeConfigurationLoader } from "../CompositeConfigurationLoader.js";
import { ConfigurationResolver } from "../ConfigurationResolver.js";
import { ConfigurationValidator } from "../ConfigurationValidator.js";
import { ConfigurationCache } from "../ConfigurationCache.js";
import { ConfigurationRegistry } from "../ConfigurationRegistry.js";
import { ConfigurationBuilder } from "../ConfigurationBuilder.js";
import { PresentationConfigurationFactory } from "../PresentationConfigurationFactory.js";

describe("Presentation Configuration Component Tests (Task 59.6)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    ConfigurationRegistry.clear();
    ConfigurationCache.clear();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("Models & Context", () => {
    it("should initialize ConfigurationContext properties correctly", () => {
      const mockConfig: PresentationConfiguration = {
        server: { port: 8080, host: "127.0.0.1", bodyLimit: "5mb" },
        routing: { prefix: "/api/v1", enableVersionRouting: false },
        middleware: { enableCors: false, enableCompression: false, rateLimitMax: 50 },
        security: { jwtSecret: "test-secret-key", tokenLifetimeSeconds: 1800 },
        serialization: { prettyPrint: true }
      };

      const context = new ConfigurationContext("development", mockConfig);
      expect(context.environment).toBe("development");
      expect(context.values.server.port).toBe(8080);
      expect(context.values.security.jwtSecret).toBe("test-secret-key");
    });
  });

  describe("Configuration Loaders", () => {
    it("should load variables from process.env using EnvironmentConfigurationLoader", () => {
      process.env.PORT = "9090";
      process.env.HOST = "192.168.1.100";
      process.env.JWT_SECRET = "env-jwt-secret";

      const loader = new EnvironmentConfigurationLoader();
      const config = loader.load();

      expect(config.server?.port).toBe(9090);
      expect(config.server?.host).toBe("192.168.1.100");
      expect(config.security?.jwtSecret).toBe("env-jwt-secret");
    });

    it("should parse configuration variables from JSON files using JsonConfigurationLoader", () => {
      const jsonStr = JSON.stringify({
        server: { port: 7070 },
        routing: { prefix: "/custom" }
      });

      const loader = new JsonConfigurationLoader(jsonStr);
      const config = loader.load();

      expect(config.server?.port).toBe(7070);
      expect(config.routing?.prefix).toBe("/custom");
    });

    it("should handle corrupted json formats gracefully in JsonConfigurationLoader", () => {
      const loader = new JsonConfigurationLoader("{ invalid JSON }");
      expect(loader.load()).toEqual({});
    });

    it("should merge nested loader payloads using CompositeConfigurationLoader", () => {
      const l1 = new JsonConfigurationLoader(JSON.stringify({ server: { host: "127.0.0.1", port: 5050 } }));
      const l2 = new JsonConfigurationLoader(JSON.stringify({ server: { port: 6060 }, security: { jwtSecret: "sec" } }));

      const composite = new CompositeConfigurationLoader([l1, l2]);
      const merged = composite.load();

      expect(merged.server.host).toBe("127.0.0.1");
      expect(merged.server.port).toBe(6060); // Overridden by l2
      expect(merged.security.jwtSecret).toBe("sec");
    });
  });

  describe("Resolvers, Validators & Cache", () => {
    it("should override default configuration properties in ConfigurationResolver", () => {
      const resolver = new ConfigurationResolver();
      const resolved = resolver.resolve({
        server: { port: 443 },
        security: { jwtSecret: "custom-secret-key" }
      });

      expect(resolved.server.port).toBe(443);
      expect(resolved.server.host).toBe("localhost"); // Preserved default
      expect(resolved.security.jwtSecret).toBe("custom-secret-key");
    });

    it("should validate required variables and types in ConfigurationValidator", () => {
      const validator = new ConfigurationValidator();
      const baseConfig = {
        server: { port: 3000, host: "localhost", bodyLimit: "10mb" },
        routing: { prefix: "/api", enableVersionRouting: true },
        middleware: { enableCors: true, enableCompression: true, rateLimitMax: 100 },
        security: { jwtSecret: "sec", tokenLifetimeSeconds: 3600 },
        serialization: { prettyPrint: false }
      };

      expect(() => validator.validate(baseConfig)).not.toThrow();

      const missingPort = { ...baseConfig, server: { ...baseConfig.server, port: undefined as any } };
      expect(() => validator.validate(missingPort)).toThrow("server port is required");

      const missingSecret = { ...baseConfig, security: { ...baseConfig.security, jwtSecret: "" } };
      expect(() => validator.validate(missingSecret)).toThrow("security JWT secret is required");
    });

    it("should store and freeze configurations in ConfigurationCache", () => {
      const config = {
        server: { port: 3000, host: "localhost", bodyLimit: "10mb" },
        routing: { prefix: "/api", enableVersionRouting: true },
        middleware: { enableCors: true, enableCompression: true, rateLimitMax: 100 },
        security: { jwtSecret: "sec", tokenLifetimeSeconds: 3600 },
        serialization: { prettyPrint: false }
      };

      expect(() => ConfigurationCache.get()).toThrow("Configuration has not been resolved");

      ConfigurationCache.set(config);
      const cached = ConfigurationCache.get();
      expect(cached.server.port).toBe(3000);
      expect(Object.isFrozen(cached)).toBe(true);
    });
  });

  describe("Builders & Factories", () => {
    it("should manage loaders registry and build complete snapshot using ConfigurationBuilder", () => {
      const l1 = new JsonConfigurationLoader(JSON.stringify({ server: { port: 4000 } }));
      const l2 = new JsonConfigurationLoader(JSON.stringify({ security: { jwtSecret: "builder-sec" } }));

      ConfigurationRegistry.register(l1);
      ConfigurationRegistry.register(l2);

      const builder = new ConfigurationBuilder();
      const config = builder.build();

      expect(config.server.port).toBe(4000);
      expect(config.security.jwtSecret).toBe("builder-sec");
      expect(ConfigurationCache.get()).toStrictEqual(config);
    });

    it("should instantiate helper structures using PresentationConfigurationFactory", () => {
      expect(PresentationConfigurationFactory.createBuilder()).toBeInstanceOf(ConfigurationBuilder);
      expect(PresentationConfigurationFactory.createResolver()).toBeInstanceOf(ConfigurationResolver);
      expect(PresentationConfigurationFactory.createValidator()).toBeInstanceOf(ConfigurationValidator);
    });
  });
});
