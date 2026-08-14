import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClaimsPrincipal } from "../../authentication/ClaimsPrincipal.js";
import { UserSession } from "../../authentication/UserSession.js";
import { AuthenticationEvent } from "../../authentication/AuthenticationEvent.js";
import { AuthenticationEventDispatcher } from "../../authentication/AuthenticationEventDispatcher.js";
import { AuthenticationObserver } from "../../authentication/AuthenticationObserver.js";
import { AuthorizationState } from "../AuthorizationState.js";
import { AuthorizationDecision } from "../AuthorizationDecision.js";
import { AuthorizationContext } from "../AuthorizationContext.js";
import { AuthorizationRequirement } from "../AuthorizationRequirement.js";
import { AuthorizationPolicy } from "../AuthorizationPolicy.js";
import { CompiledPolicy } from "../CompiledPolicy.js";
import { PolicyRegistry } from "../PolicyRegistry.js";
import { RoleAuthorizationHandler } from "../RoleAuthorizationHandler.js";
import { PermissionAuthorizationHandler } from "../PermissionAuthorizationHandler.js";
import { ClaimAuthorizationHandler } from "../ClaimAuthorizationHandler.js";
import { OwnershipAuthorizationHandler } from "../OwnershipAuthorizationHandler.js";
import { AuthorizationEvaluator } from "../AuthorizationEvaluator.js";
import { PermissionContext } from "../PermissionContext.js";
import { PermissionCache } from "../PermissionCache.js";
import { PermissionProvider } from "../PermissionProvider.js";
import { PermissionCacheInvalidator } from "../PermissionCacheInvalidator.js";
import { AuthorizationGuard } from "../AuthorizationGuard.js";
import { ComponentAuthorizationGuard } from "../ComponentAuthorizationGuard.js";
import { AuthorizationEvent } from "../AuthorizationEvent.js";
import { AuthorizationEventDispatcher } from "../AuthorizationEventDispatcher.js";
import { AuthorizationObserver } from "../AuthorizationObserver.js";
import { AuthorizationFactory } from "../AuthorizationFactory.js";
import { RouteContext } from "../../routing/RouteContext.js";

describe("Frontend Authorization Component Refactored Unit Tests (Task 68.8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Contexts & Models", () => {
    it("should instantiate AuthorizationContext and deep freeze arrays", () => {
      const user = new ClaimsPrincipal("u-1", { role: "user" });
      const ctx = new AuthorizationContext(user, ["read:own"], { resourceId: "res-1" });

      expect(ctx.user).toBe(user);
      expect(ctx.permissions).toContain("read:own");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.permissions)).toBe(true);
      expect(Object.isFrozen(ctx.resourceMetadata)).toBe(true);
    });

    it("should generate proper AuthorizationDecision outcomes", () => {
      const allow = AuthorizationDecision.allow("Policy1");
      expect(allow.allowed).toBe(true);
      expect(allow.status).toBe("Allowed");
      expect(allow.policyName).toBe("Policy1");

      const req = new AuthorizationRequirement("role", "admin");
      const deny = AuthorizationDecision.deny("Policy2", [req], "Some reason");
      expect(deny.allowed).toBe(false);
      expect(deny.status).toBe("Denied");
      expect(deny.policyName).toBe("Policy2");
      expect(deny.failedRequirements).toContain(req);
      expect(deny.reason).toBe("Some reason");
    });
  });

  describe("Policies & Registry", () => {
    it("should register compiled policies and support registry freezing", () => {
      const registry = new PolicyRegistry();
      const req = new AuthorizationRequirement("role", "admin");
      const policy = new AuthorizationPolicy("AdminOnly", [req]);

      registry.register(policy);
      const compiled = registry.getPolicy("AdminOnly");
      expect(compiled).toBeInstanceOf(CompiledPolicy);
      expect(compiled?.name).toBe("AdminOnly");
      expect(compiled?.requirements).toContain(req);

      registry.freeze();
      expect(() => registry.register(new AuthorizationPolicy("Other", []))).toThrow(
        "PolicyRegistry is frozen and cannot accept further policies"
      );
    });
  });

  describe("Evaluators & Handlers", () => {
    it("should evaluate RoleAuthorizationHandler", async () => {
      const handler = new RoleAuthorizationHandler();
      const user = new ClaimsPrincipal("u-1", { role: "Manager" });
      const context = new AuthorizationContext(user);

      const reqTrue = new AuthorizationRequirement("role", "manager");
      const reqFalse = new AuthorizationRequirement("role", "admin");

      expect(handler.canHandle(reqTrue)).toBe(true);
      expect(await handler.evaluate(context, reqTrue)).toBe(true);
      expect(await handler.evaluate(context, reqFalse)).toBe(false);
    });

    it("should evaluate PermissionAuthorizationHandler with wildcards", async () => {
      const handler = new PermissionAuthorizationHandler();
      const user = new ClaimsPrincipal("u-1", { role: "Manager" }); // manager roles have read:*
      const context = new AuthorizationContext(user);

      const reqTrue = new AuthorizationRequirement("permission", "read:invoice");
      const reqFalse = new AuthorizationRequirement("permission", "delete:customer");

      expect(handler.canHandle(reqTrue)).toBe(true);
      expect(await handler.evaluate(context, reqTrue)).toBe(true);
      expect(await handler.evaluate(context, reqFalse)).toBe(false);
    });

    it("should evaluate ClaimAuthorizationHandler", async () => {
      const handler = new ClaimAuthorizationHandler();
      const user = new ClaimsPrincipal("u-1", { department: "Billing" });
      const context = new AuthorizationContext(user);

      const reqTrue = new AuthorizationRequirement("claim", { type: "department", value: "Billing" });
      const reqFalse = new AuthorizationRequirement("claim", { type: "department", value: "Sales" });

      expect(handler.canHandle(reqTrue)).toBe(true);
      expect(await handler.evaluate(context, reqTrue)).toBe(true);
      expect(await handler.evaluate(context, reqFalse)).toBe(false);
    });

    it("should evaluate OwnershipAuthorizationHandler", async () => {
      const handler = new OwnershipAuthorizationHandler();
      const user = new ClaimsPrincipal("u-100");
      const contextTrue = new AuthorizationContext(user, [], { ownerId: "u-100" });
      const contextFalse = new AuthorizationContext(user, [], { ownerId: "u-200" });

      const req = new AuthorizationRequirement("ownership", true);

      expect(handler.canHandle(req)).toBe(true);
      expect(await handler.evaluate(contextTrue, req)).toBe(true);
      expect(await handler.evaluate(contextFalse, req)).toBe(false);
    });

    it("should orchestrate evaluators inside AuthorizationEvaluator", async () => {
      const evaluator = AuthorizationFactory.createEvaluator();
      const user = new ClaimsPrincipal("u-1", { role: "admin" });
      const context = new AuthorizationContext(user, ["*"]);

      const policy = new AuthorizationPolicy("AdminOrOwner", [
        new AuthorizationRequirement("role", "admin")
      ]);
      const compiled = CompiledPolicy.compile(policy);

      const result = await evaluator.evaluate(context, compiled);
      expect(result.allowed).toBe(true);
      expect(result.policyName).toBe("AdminOrOwner");
    });
  });

  describe("Permission Resolution & Cache Invalidation", () => {
    it("should resolve and cache permissions, and invalidate on logout events", () => {
      const cache = new PermissionCache();
      const provider = new PermissionProvider(cache);
      const user = new ClaimsPrincipal("u-1", { role: "user" });

      const perms = provider.getPermissions(user);
      expect(perms).toContain("read:*");

      const authDispatcher = new AuthenticationEventDispatcher();
      const authObserver = new AuthenticationObserver(authDispatcher);
      const invalidator = new PermissionCacheInvalidator(cache, authObserver);

      const session = new UserSession("u-1", "user", "token-1");
      authDispatcher.dispatch(new AuthenticationEvent("logout", Date.now(), session));

      expect(cache.get("u-1")).toBeUndefined();
      invalidator.dispose();
    });
  });

  describe("Route & UI Guards", () => {
    it("should protect route activation in AuthorizationGuard", async () => {
      const evaluator = AuthorizationFactory.createEvaluator();
      const registry = new PolicyRegistry();
      
      const req = new AuthorizationRequirement("role", "admin");
      registry.register(new AuthorizationPolicy("AdminOnly", [req]));

      const guard = new AuthorizationGuard(
        evaluator,
        registry,
        () => new ClaimsPrincipal("u-1", { role: "user" }) // not admin
      );

      const routeContext = new RouteContext(
        "/admin",
        {},
        {},
        { authorizationPolicy: "AdminOnly" }
      );

      const res = await guard.canActivate(routeContext);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("Policy check failed");
    });

    it("should authorize rendering via ComponentAuthorizationGuard", async () => {
      const evaluator = AuthorizationFactory.createEvaluator();
      const registry = new PolicyRegistry();

      const req = new AuthorizationRequirement("role", "manager");
      registry.register(new AuthorizationPolicy("ManagerOnly", [req]));

      const guard = new ComponentAuthorizationGuard(evaluator, registry);
      const user = new ClaimsPrincipal("u-1", { role: "manager" });

      const res = await guard.isAuthorized(user, "ManagerOnly");
      expect(res).toBe(true);
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch and observe authorization events", () => {
      const dispatcher = new AuthorizationEventDispatcher();
      const observer = new AuthorizationObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.type).toBe("permissionUpdate");
      });

      dispatcher.dispatch(new AuthorizationEvent("permissionUpdate"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new AuthorizationEvent("permissionUpdate"));
      expect(count).toBe(1); // unsubscribed
    });
  });
});
