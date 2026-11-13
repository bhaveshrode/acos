import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FrontendConfiguration } from "../FrontendConfiguration.js";
import { ConfigurationContext } from "../ConfigurationContext.js";
import { ConfigurationOptions } from "../ConfigurationOptions.js";
import { RuntimeEnvironmentProvider } from "../RuntimeEnvironmentProvider.js";
import { EnvironmentConfigurationLoader } from "../EnvironmentConfigurationLoader.js";
import { JsonConfigurationLoader } from "../JsonConfigurationLoader.js";
import { CompositeConfigurationLoader } from "../CompositeConfigurationLoader.js";
import { ConfigurationResolver } from "../ConfigurationResolver.js";
import { ConfigurationValidator } from "../ConfigurationValidator.js";
import { ConfigurationStore } from "../ConfigurationStore.js";
import { FrontendConfigurationProvider } from "../FrontendConfigurationProvider.js";
import { ConfigurationBuilder } from "../ConfigurationBuilder.js";
import { FrontendConfigurationFactory } from "../FrontendConfigurationFactory.js";

describe("Frontend Configuration Component Refactored Unit Tests (Task 62.6)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    ConfigurationStore.clear();
    if (typeof window !== "undefined") {
      delete (window as any).env;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("Models & Context", () => {
    it("should initialize ConfigurationContext and ConfigurationOptions as immutable read-only snapshots", () => {
      const mockConfig: FrontendConfiguration = {
        api: { baseUrl: "http://localhost:3000/api", timeoutMs: 3000 },
        ws: { url: "ws://localhost:3000/ws", reconnectIntervalMs: 2000 },
        features: { enableNotifications: true, enableAnalytics: false },
        theme: { defaultMode: "light" }
      };

      const context = new ConfigurationContext("staging", mockConfig);
      expect(context.environment).toBe("staging");
      expect(context.values.api.baseUrl).toBe("http://localhost:3000/api");
      expect(Object.isFrozen(context)).toBe(true);
      expect(Object.isFrozen(context.values)).toBe(true);
    });
  });

  describe("Loaders & Abstractions", () => {
    it("should abstract env parameters retrieval through RuntimeEnvironmentProvider", () => {
      process.env.API_BASE_URL = "http://env-api:4000/api";
      const provider = new RuntimeEnvironmentProvider();
      const vars = provider.getEnvironmentVariables();
      expect(vars.API_BASE_URL).toBe("http://env-api:4000/api");
    });

    it("should load environment variables using EnvironmentConfigurationLoader", () => {
      const customVars = { API_BASE_URL: "http://env-api-2:4000/api", WS_URL: "ws://env-ws-2:4000/ws" };
      const envProvider = {
        getEnvironmentVariables: () => customVars
      } as any;

      const loader = new EnvironmentConfigurationLoader(envProvider);
      const config = loader.load();

      expect(config.api?.baseUrl).toBe("http://env-api-2:4000/api");
      expect(config.ws?.url).toBe("ws://env-ws-2:4000/ws");
    });

    it("should parse configuration parameters from JSON files using JsonConfigurationLoader", () => {
      const jsonStr = JSON.stringify({
        api: { baseUrl: "http://json-api:8080" },
        theme: { defaultMode: "light" }
      });

      const loader = new JsonConfigurationLoader(jsonStr);
      const config = loader.load();

      expect(config.api?.baseUrl).toBe("http://json-api:8080");
      expect(config.theme?.defaultMode).toBe("light");
    });

    it("should handle invalid JSON contents gracefully in JsonConfigurationLoader", () => {
      const loader = new JsonConfigurationLoader("{ invalid JSON }");
      expect(loader.load()).toEqual({});
    });

    it("should merge nested loader payloads using CompositeConfigurationLoader", () => {
      const l1 = new JsonConfigurationLoader(JSON.stringify({ api: { baseUrl: "http://old-api" } }));
      const l2 = new JsonConfigurationLoader(JSON.stringify({ api: { baseUrl: "http://new-api" }, ws: { url: "ws://ws-1" } }));

      const composite = new CompositeConfigurationLoader([l1, l2]);
      const merged = composite.load();

      expect(merged.api.baseUrl).toBe("http://new-api"); // Overridden
      expect(merged.ws.url).toBe("ws://ws-1");
    });
  });

  describe("Resolvers, Validators & Cache", () => {
    it("should override defaults in ConfigurationResolver", () => {
      const emptyLoader = { load: () => ({ api: { baseUrl: "http://custom-api:9000" } }) };
      const validator = new ConfigurationValidator();
      const resolver = new ConfigurationResolver(emptyLoader, validator);
      const resolved = resolver.resolve();

      expect(resolved.api.baseUrl).toBe("http://custom-api:9000");
      expect(resolved.ws.url).toBe("ws://localhost:3000/ws"); // Default preserved
    });

    it("should validate required variables and types in ConfigurationValidator", () => {
      const validator = new ConfigurationValidator();
      const baseConfig: FrontendConfiguration = {
        api: { baseUrl: "http://api", timeoutMs: 5000 },
        ws: { url: "ws://ws", reconnectIntervalMs: 3000 },
        features: { enableNotifications: true, enableAnalytics: true },
        theme: { defaultMode: "dark" }
      };

      expect(() => validator.validate(baseConfig)).not.toThrow();

      const missingApi = { ...baseConfig, api: { ...baseConfig.api, baseUrl: "" } };
      expect(() => validator.validate(missingApi)).toThrow("API base URL is required");

      const missingWs = { ...baseConfig, ws: { ...baseConfig.ws, url: "" } };
      expect(() => validator.validate(missingWs)).toThrow("WebSocket URL is required");
    });

    it("should cache immutable configuration snapshots in ConfigurationStore", () => {
      const config: FrontendConfiguration = {
        api: { baseUrl: "http://api", timeoutMs: 5000 },
        ws: { url: "ws://ws", reconnectIntervalMs: 3000 },
        features: { enableNotifications: true, enableAnalytics: true },
        theme: { defaultMode: "dark" }
      };

      expect(() => ConfigurationStore.get()).toThrow("Configuration has not been resolved");

      ConfigurationStore.set(config);
      const cached = ConfigurationStore.get();
      expect(cached.api.baseUrl).toBe("http://api");
      expect(Object.isFrozen(cached)).toBe(true);
    });
  });

  describe("Builders & Factories", () => {
    it("should compile snapshot using ConfigurationBuilder and resolve via ConfigurationResolver", () => {
      const l1 = new JsonConfigurationLoader(JSON.stringify({ api: { baseUrl: "http://builder-api-3" } }));
      const l2 = new JsonConfigurationLoader(JSON.stringify({ ws: { url: "ws://builder-ws-3" } }));

      const compositeLoader = new ConfigurationBuilder()
        .addLoader(l1)
        .addLoader(l2)
        .build();

      const validator = new ConfigurationValidator();
      const resolver = new ConfigurationResolver(compositeLoader, validator);
      const config = resolver.resolve();

      expect(config.api.baseUrl).toBe("http://builder-api-3");
      expect(config.ws.url).toBe("ws://builder-ws-3");

      const provider = new FrontendConfigurationProvider();
      expect(provider.getConfiguration()).toStrictEqual(config);
    });

    it("should instantiate helper structures using FrontendConfigurationFactory", () => {
      const builder = FrontendConfigurationFactory.createBuilder();
      expect(builder).toBeInstanceOf(ConfigurationBuilder);

      const dummyLoader = { load: () => ({}) };
      const validator = FrontendConfigurationFactory.createValidator();
      expect(validator).toBeInstanceOf(ConfigurationValidator);

      const resolver = FrontendConfigurationFactory.createResolver(dummyLoader, validator);
      expect(resolver).toBeInstanceOf(ConfigurationResolver);

      const provider = FrontendConfigurationFactory.createProvider();
      expect(provider).toBeInstanceOf(FrontendConfigurationProvider);
    });
  });
});
