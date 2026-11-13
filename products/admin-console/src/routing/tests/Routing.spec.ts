import { describe, it, expect, beforeEach } from "vitest";
import { RouteDefinition } from "../RouteDefinition.js";
import { RouteContext } from "../RouteContext.js";
import { NavigationOptions } from "../NavigationOptions.js";
import { RouteRegistry } from "../RouteRegistry.js";
import { RouteBuilder } from "../RouteBuilder.js";
import { RouteGroup } from "../RouteGroup.js";
import { RouteMatcher } from "../RouteMatcher.js";
import { RouteResolver } from "../RouteResolver.js";
import { GuardResult } from "../GuardResult.js";
import { AuthenticationGuard } from "../AuthenticationGuard.js";
import { AuthorizationGuard } from "../AuthorizationGuard.js";
import { FeatureGuard } from "../FeatureGuard.js";
import { GuardPipeline } from "../GuardPipeline.js";
import { RouteParameterParser } from "../RouteParameterParser.js";
import { QueryParameterParser } from "../QueryParameterParser.js";
import { NavigationStateManager } from "../NavigationStateManager.js";
import { RoutingFactory } from "../RoutingFactory.js";

describe("Frontend Routing Component Refactored Unit Tests (Task 64.7)", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      (window as any).history.state = null;
    }
  });

  describe("Models & Builders", () => {
    it("should initialize RouteContext and NavigationOptions", () => {
      const context = new RouteContext(
        "/customers/123",
        { id: "123" },
        { tab: "details" },
        { requiredRole: "Admin" }
      );
      expect(context.path).toBe("/customers/123");
      expect(context.params.id).toBe("123");
      expect(context.query.tab).toBe("details");
      expect(context.meta.requiredRole).toBe("Admin");
      expect(Object.isFrozen(context.params)).toBe(true);

      const navOptions: NavigationOptions = { replace: true, state: { test: 1 } };
      expect(navOptions.replace).toBe(true);
    });

    it("should assemble route definitions using RouteBuilder", () => {
      const route = new RouteBuilder()
        .setPath("/invoices/:id")
        .setName("InvoiceDetail")
        .setComponent("InvoiceComp")
        .setLayout("DashboardLayout")
        .addMeta("roles", ["billing"])
        .build();

      expect(route.path).toBe("/invoices/:id");
      expect(route.name).toBe("InvoiceDetail");
      expect(route.component).toBe("InvoiceComp");
      expect(route.layout).toBe("DashboardLayout");
      expect(route.meta?.roles).toContain("billing");
    });

    it("should prefixes routes using RouteGroup", () => {
      const routes: RouteDefinition[] = [
        { path: "/", component: "Home" },
        { path: "/list", component: "List" }
      ];

      const group = new RouteGroup("/customers", routes);
      const definitions = group.getRouteDefinitions();

      expect(definitions[0].path).toBe("/customers");
      expect(definitions[1].path).toBe("/customers/list");
    });

    it("should support frozen immutable registry states", () => {
      const registry = new RouteRegistry();
      registry.register({ path: "/foo", component: "Foo" });

      registry.freeze();
      expect(() => registry.register({ path: "/bar", component: "Bar" })).toThrow(
        "is frozen and cannot accept further route registrations"
      );
    });
  });

  describe("Matching & Parsers", () => {
    it("should match patterns using RouteMatcher and parse parameters", () => {
      const routes: RouteDefinition[] = [
        { path: "/dashboard", component: "Dash" },
        { path: "/payments/:id/details", component: "PayDetail" }
      ];

      const matcher = new RouteMatcher();
      const matchDash = matcher.match(routes, "/dashboard");
      expect(matchDash).not.toBeNull();
      expect(matchDash?.route.component).toBe("Dash");

      const matchPay = matcher.match(routes, "/payments/pay-777/details");
      expect(matchPay).not.toBeNull();
      expect(matchPay?.route.component).toBe("PayDetail");
      expect(matchPay?.params.id).toBe("pay-777");
    });

    it("should parse query string variables via QueryParameterParser", () => {
      const query = QueryParameterParser.parse("?foo=bar&baz=123");
      expect(query.foo).toBe("bar");
      expect(query.baz).toBe("123");
    });

    it("should parse dynamic path segment variables via RouteParameterParser", () => {
      const params = RouteParameterParser.parse("/invoices/:id/lines/:lineId", "/invoices/inv-001/lines/line-5");
      expect(params.id).toBe("inv-001");
      expect(params.lineId).toBe("line-5");
    });
  });

  describe("Guards & Access Control", () => {
    it("should evaluate guards executing GuardPipeline returning GuardResult outcomes", async () => {
      const authGuard = new AuthenticationGuard(() => true);
      const roleGuard = new AuthorizationGuard((roles) => roles.includes("Admin"));
      const featureGuard = new FeatureGuard((flag) => flag === "invoice_v2");

      const pipeline = new GuardPipeline();

      const validContext = new RouteContext("/route", {}, {}, { roles: ["Admin"], featureFlag: "invoice_v2" });
      const allowedResult = await pipeline.execute([authGuard, roleGuard, featureGuard], validContext);
      expect(allowedResult.allowed).toBe(true);

      const invalidContext = new RouteContext("/route", {}, {}, { roles: ["User"], featureFlag: "invoice_v2" });
      const rejectedResult = await pipeline.execute([authGuard, roleGuard, featureGuard], invalidContext);
      expect(rejectedResult.allowed).toBe(false);
      expect(rejectedResult.reason).toBe("User does not have required roles or permissions");
    });

    it("should return redirects on unauthenticated routes", async () => {
      const authGuard = new AuthenticationGuard(() => false, "/sign-in");
      const pipeline = new GuardPipeline();
      const context = new RouteContext("/dashboard", {}, {});

      const result = await pipeline.execute([authGuard], context);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/sign-in");
    });
  });

  describe("State Manager & Resolvers", () => {
    it("should persist transient navigation state maps using NavigationStateManager", () => {
      const manager = new NavigationStateManager();
      manager.setState({ token: "abc", count: 42 });

      expect(manager.getState().token).toBe("abc");
      expect(manager.getState().count).toBe(42);

      manager.clear();
      expect(manager.getState()).toEqual({});
    });

    it("should resolve components lazy dynamic properties via RouteResolver returning ResolvedRoute models", async () => {
      const resolver = new RouteResolver();
      const mockRoute: RouteDefinition = {
        path: "/lazy",
        component: async () => ({ default: "LazyComponentLoaded" }),
        layout: "MainLayout"
      };

      const resolved = await resolver.resolve(mockRoute, { dynamicId: "44" });
      expect(resolved.component).toBe("LazyComponentLoaded");
      expect(resolved.layout).toBe("MainLayout");
      expect(resolved.params.dynamicId).toBe("44");
      expect(Object.isFrozen(resolved)).toBe(true);
    });
  });

  describe("Router & Factories Integration", () => {
    it("should integrate pipelines using Router and NavigationManager mocks", async () => {
      (globalThis as any).window = {
        location: { pathname: "/dashboard", search: "?tab=1" },
        history: {
          pushState: () => {},
          replaceState: () => {}
        },
        addEventListener: () => {}
      } as any;

      const registry = RoutingFactory.createRegistry();
      registry.register({ path: "/dashboard", component: "Dashboard" });

      const matcher = RoutingFactory.createMatcher();
      const resolver = RoutingFactory.createResolver();
      const navManager = RoutingFactory.createNavigationManager();
      const guardPipeline = RoutingFactory.createGuardPipeline();

      const router = RoutingFactory.createRouter(registry, matcher, resolver, navManager, guardPipeline);

      let routeChanged = false;
      router.onRouteChanged((ctx) => {
        routeChanged = true;
        expect(ctx.path).toBe("/dashboard");
        expect(ctx.query.tab).toBe("1");
      });

      await router.start("/dashboard?tab=1");
      expect(routeChanged).toBe(true);
      expect(router.getCurrentContext()?.path).toBe("/dashboard");

      delete (globalThis as any).window;
    });
  });
});
