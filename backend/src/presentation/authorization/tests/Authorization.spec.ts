import { describe, it, expect, beforeEach } from "vitest";
import { AuthorizationContext } from "../AuthorizationContext.js";
import { AuthorizationException } from "../AuthorizationException.js";
import { AuthorizationPolicy } from "../AuthorizationPolicy.js";
import { RoleRequirement, PermissionRequirement, OwnerRequirement } from "../AuthorizationRequirement.js";
import { RoleAuthorizationHandler, PermissionAuthorizationHandler, OwnerAuthorizationHandler } from "../AuthorizationHandler.js";
import { AuthorizationEvaluator } from "../AuthorizationEvaluator.js";
import { RoleResolver } from "../RoleResolver.js";
import { PermissionResolver } from "../PermissionResolver.js";
import { ResourceAuthorizationService } from "../ResourceAuthorizationService.js";
import { AuthorizeAttribute } from "../AuthorizeAttribute.js";
import { AuthorizationRegistry } from "../AuthorizationRegistry.js";
import { AuthorizationFactory } from "../AuthorizationFactory.js";

describe("Presentation Authorization Component Tests (Task 43.7)", () => {
  beforeEach(() => {
    AuthorizationRegistry.clear();
  });

  describe("AuthorizationContext & AuthorizationException", () => {
    it("should initialize properties correctly", () => {
      const ctx = new AuthorizationContext({
        userId: "user-1",
        roles: ["admin"],
        permissions: ["read", "write"],
        resourceId: "resource-123"
      });
      expect(ctx.props.userId).toBe("user-1");
      expect(ctx.props.roles).toEqual(["admin"]);
      expect(ctx.props.permissions).toEqual(["read", "write"]);
      expect(ctx.props.resourceId).toBe("resource-123");
    });

    it("should carry standard exception message", () => {
      const exc = new AuthorizationException("Forbidden resource access");
      expect(exc.message).toBe("Forbidden resource access");
      expect(exc.name).toBe("AuthorizationException");
    });
  });

  describe("AuthorizationRequirement & AuthorizationPolicy", () => {
    it("should instantiate concrete requirements with specified criteria", () => {
      const roleReq = new RoleRequirement("admin");
      const permReq = new PermissionRequirement("write");
      const ownerReq = new OwnerRequirement();

      expect(roleReq.requiredRole).toBe("admin");
      expect(permReq.requiredPermission).toBe("write");
      expect(ownerReq.name).toBe("OwnerRequirement");
    });

    it("should bundle requirements into AuthorizationPolicy", () => {
      const policy = new AuthorizationPolicy("AdminWriteOnly", [
        new RoleRequirement("admin"),
        new PermissionRequirement("write")
      ]);
      expect(policy.name).toBe("AdminWriteOnly");
      expect(policy.requirements.length).toBe(2);
    });
  });

  describe("AuthorizationHandler & AuthorizationEvaluator Workflow", () => {
    let evaluator: AuthorizationEvaluator;

    beforeEach(() => {
      evaluator = AuthorizationFactory.createEvaluator();
    });

    it("should evaluate role requirement correctly", async () => {
      const policy = new AuthorizationPolicy("AdminOnly", [new RoleRequirement("admin")]);
      
      const authorizedCtx = new AuthorizationContext({
        userId: "user-1",
        roles: ["admin"],
        permissions: []
      });

      const unauthorizedCtx = new AuthorizationContext({
        userId: "user-2",
        roles: ["user"],
        permissions: []
      });

      expect(await evaluator.evaluate(policy, authorizedCtx)).toBe(true);
      expect(await evaluator.evaluate(policy, unauthorizedCtx)).toBe(false);
    });

    it("should evaluate permission requirement correctly", async () => {
      const policy = new AuthorizationPolicy("WriteAccess", [new PermissionRequirement("write")]);

      const authorizedCtx = new AuthorizationContext({
        userId: "user-1",
        roles: [],
        permissions: ["read", "write"]
      });

      const unauthorizedCtx = new AuthorizationContext({
        userId: "user-2",
        roles: [],
        permissions: ["read"]
      });

      expect(await evaluator.evaluate(policy, authorizedCtx)).toBe(true);
      expect(await evaluator.evaluate(policy, unauthorizedCtx)).toBe(false);
    });

    it("should evaluate owner requirement correctly", async () => {
      const policy = new AuthorizationPolicy("OwnerOnly", [new OwnerRequirement()]);

      const authorizedCtx = new AuthorizationContext({
        userId: "user-100",
        roles: [],
        permissions: [],
        resourceId: "user-100/attachments/1"
      });

      const unauthorizedCtx = new AuthorizationContext({
        userId: "user-200",
        roles: [],
        permissions: [],
        resourceId: "user-100/attachments/1"
      });

      expect(await evaluator.evaluate(policy, authorizedCtx)).toBe(true);
      expect(await evaluator.evaluate(policy, unauthorizedCtx)).toBe(false);
    });
  });

  describe("Resolvers & Resource Ownership Services", () => {
    it("should resolve roles based on userId", () => {
      const resolver = new RoleResolver();
      expect(resolver.resolveRoles("user-admin")).toEqual(["admin"]);
      expect(resolver.resolveRoles("user-editor")).toEqual(["editor"]);
      expect(resolver.resolveRoles("user-other")).toEqual(["user"]);
    });

    it("should resolve permissions based on role hierarchy", () => {
      const resolver = new PermissionResolver();
      expect(resolver.resolvePermissions(["admin"])).toEqual(["read", "write", "delete"]);
      expect(resolver.resolvePermissions(["editor"])).toEqual(["read", "write"]);
      expect(resolver.resolvePermissions(["user"])).toEqual(["read"]);
    });

    it("should validate resource ownership successfully", () => {
      const service = new ResourceAuthorizationService();
      expect(service.validateOwnership("user-1", "user-1/invoices/20")).toBe(true);
      expect(service.validateOwnership("user-1", "public-resource")).toBe(true);
      expect(service.validateOwnership("user-2", "user-1/invoices/20")).toBe(false);
    });
  });

  describe("Attributes, Registries, and Factories", () => {
    it("should assign policy names onto AuthorizeAttribute", () => {
      const attr = new AuthorizeAttribute("SuperAdminOnly");
      expect(attr.policyName).toBe("SuperAdminOnly");
    });

    it("should register and fetch policies through static AuthorizationRegistry", () => {
      const policy = new AuthorizationPolicy("CustomPolicy");
      AuthorizationRegistry.register(policy);

      expect(AuthorizationRegistry.getPolicy("CustomPolicy")).toBe(policy);
      expect(AuthorizationRegistry.getPolicy("NonExistent")).toBeUndefined();
    });

    it("should build resolvers and services using AuthorizationFactory", () => {
      expect(AuthorizationFactory.createRoleResolver()).toBeInstanceOf(RoleResolver);
      expect(AuthorizationFactory.createPermissionResolver()).toBeInstanceOf(PermissionResolver);
      expect(AuthorizationFactory.createResourceService()).toBeInstanceOf(ResourceAuthorizationService);
      expect(AuthorizationFactory.createEvaluator()).toBeInstanceOf(AuthorizationEvaluator);
    });
  });
});
