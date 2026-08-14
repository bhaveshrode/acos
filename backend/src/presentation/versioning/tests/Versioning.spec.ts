import { describe, it, expect, beforeEach } from "vitest";
import { ApiVersion } from "../ApiVersion.js";
import { VersionContext } from "../VersionContext.js";
import { VersioningOptions } from "../VersioningOptions.js";
import { HeaderVersionResolver } from "../HeaderVersionResolver.js";
import { QueryStringVersionResolver } from "../QueryStringVersionResolver.js";
import { UrlSegmentVersionResolver } from "../UrlSegmentVersionResolver.js";
import { MediaTypeVersionResolver } from "../MediaTypeVersionResolver.js";
import { VersionSelector } from "../VersionSelector.js";
import { VersionRouter } from "../VersionRouter.js";
import { VersionPolicy } from "../VersionPolicy.js";
import { CompatibilityChecker } from "../CompatibilityChecker.js";
import { VersionRegistry } from "../VersionRegistry.js";
import { VersioningFactory } from "../VersioningFactory.js";

describe("Presentation Versioning Component Tests (Task 47.7)", () => {
  beforeEach(() => {
    VersionRegistry.clear();
  });

  describe("ApiVersion structures", () => {
    it("should parse version strings and format correctly", () => {
      const v1 = ApiVersion.parse("v2.1");
      expect(v1.major).toBe(2);
      expect(v1.minor).toBe(1);
      expect(v1.toString()).toBe("v2.1");

      const v2 = ApiVersion.parse("3");
      expect(v2.major).toBe(3);
      expect(v2.minor).toBe(0);
      expect(v2.toString()).toBe("v3.0");
    });

    it("should throw error when parsing invalid version formats", () => {
      expect(() => {
        ApiVersion.parse("invalid-version");
      }).toThrow();
    });

    it("should check version equality correctly", () => {
      const v1 = new ApiVersion(1, 1);
      const v2 = new ApiVersion(1, 1);
      const v3 = new ApiVersion(1, 2);

      expect(v1.equals(v2)).toBe(true);
      expect(v1.equals(v3)).toBe(false);
    });
  });

  describe("VersionContext & VersioningOptions", () => {
    it("should map requested and resolved versions onto context cards", () => {
      const requested = new ApiVersion(2);
      const resolved = new ApiVersion(1);
      const ctx = new VersionContext(requested, resolved, true);

      expect(ctx.requestedVersion).toBe(requested);
      expect(ctx.resolvedVersion).toBe(resolved);
      expect(ctx.isDeprecated).toBe(true);
    });

    it("should default options cleanly", () => {
      const opts = new VersioningOptions();
      expect(opts.defaultVersion.major).toBe(1);
      expect(opts.defaultVersion.minor).toBe(0);
      expect(opts.assumeDefaultVersionWhenUnspecified).toBe(true);
    });
  });

  describe("Concrete version resolvers", () => {
    it("should resolve version from HTTP header keys", () => {
      const resolver = new HeaderVersionResolver("X-API-Version");
      const req = { headers: { "x-api-version": "1.5" } };
      expect(resolver.resolve(req)).toBe("1.5");
    });

    it("should resolve version from request URI query parameters", () => {
      const resolver = new QueryStringVersionResolver("ver");
      const req = { query: { ver: "2.0" } };
      expect(resolver.resolve(req)).toBe("2.0");
    });

    it("should resolve version from URI path segments", () => {
      const resolver = new UrlSegmentVersionResolver();
      const req = { path: "/api/v2.3/customers" };
      expect(resolver.resolve(req)).toBe("2.3");
    });

    it("should resolve version from accept media header parameters", () => {
      const resolver = new MediaTypeVersionResolver();
      const req = { headers: { accept: "application/json; v=3.1" } };
      expect(resolver.resolve(req)).toBe("3.1");
    });
  });

  describe("Selection & Routing workflows", () => {
    it("should prioritize resolver lists and yield defaults as fallbacks", () => {
      const resolvers = [
        new HeaderVersionResolver("X-API-Version"),
        new QueryStringVersionResolver("api-version")
      ];
      const selector = new VersionSelector(resolvers, new VersioningOptions(new ApiVersion(1, 0)));

      // Priority resolver match
      const req1 = { headers: { "x-api-version": "2.0" }, query: { "api-version": "3.0" } };
      expect(selector.select(req1).toString()).toBe("v2.0");

      // Fallback resolver match
      const req2 = { headers: {}, query: { "api-version": "3.0" } };
      expect(selector.select(req2).toString()).toBe("v3.0");

      // No match fallback
      const req3 = { headers: {}, query: {} };
      expect(selector.select(req3).toString()).toBe("v1.0");
    });

    it("should dispatch route matches or fallback to closest lower version mappings", () => {
      const router = new VersionRouter();
      const h1 = "handler-v1";
      const h2 = "handler-v2";

      const routes = [
        { version: new ApiVersion(1, 0), handler: h1 },
        { version: new ApiVersion(2, 0), handler: h2 }
      ];

      // Exact match
      expect(router.selectRouteForVersion(routes, new ApiVersion(2, 0))).toBe(h2);

      // Fallback lower match
      expect(router.selectRouteForVersion(routes, new ApiVersion(2, 5))).toBe(h2);

      // Underspecified match
      expect(router.selectRouteForVersion(routes, new ApiVersion(1, 5))).toBe(h1);
    });
  });

  describe("Policies & Compatibility validators", () => {
    it("should validate active compatibility policies", () => {
      const policy = new VersionPolicy(
        [new ApiVersion(1, 0), new ApiVersion(2, 0)],
        [new ApiVersion(0, 9)]
      );

      expect(policy.isSupported(new ApiVersion(2, 0))).toBe(true);
      expect(policy.isSupported(new ApiVersion(3, 0))).toBe(false);

      expect(policy.isDeprecated(new ApiVersion(0, 9))).toBe(true);
      expect(policy.isDeprecated(new ApiVersion(1, 0))).toBe(false);

      const checker = new CompatibilityChecker(policy);

      const res1 = checker.check(new ApiVersion(2, 0));
      expect(res1.isCompatible).toBe(true);
      expect(res1.isDeprecated).toBe(false);

      const res2 = checker.check(new ApiVersion(0, 9));
      expect(res2.isCompatible).toBe(true);
      expect(res2.isDeprecated).toBe(true);

      const res3 = checker.check(new ApiVersion(3, 0));
      expect(res3.isCompatible).toBe(false);
      expect(res3.isDeprecated).toBe(false);
    });
  });

  describe("Registries & Factories", () => {
    it("should register version routes under VersionRegistry", () => {
      const v = new ApiVersion(1);
      const h = "handler";
      VersionRegistry.registerRoute("/customers", v, h);

      expect(VersionRegistry.getVersionedRoutes("/customers")).toEqual([{ version: v, handler: h }]);
    });

    it("should build selectors and checkers using VersioningFactory", () => {
      const policy = new VersionPolicy();
      const options = new VersioningOptions();

      expect(VersioningFactory.createResolvers().length).toBe(4);
      expect(VersioningFactory.createSelector(options)).toBeInstanceOf(VersionSelector);
      expect(VersioningFactory.createRouter()).toBeInstanceOf(VersionRouter);
      expect(VersioningFactory.createCompatibilityChecker(policy)).toBeInstanceOf(CompatibilityChecker);
    });
  });
});
