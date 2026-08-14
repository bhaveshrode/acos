import { describe, it, expect, beforeEach } from "vitest";
import { RouteDefinition } from "../RouteDefinition.js";
import { RouteGroup } from "../RouteGroup.js";
import { RouteBuilder } from "../RouteBuilder.js";
import { RouteRegistry } from "../RouteRegistry.js";
import { RouteFactory } from "../RouteFactory.js";
import { ControllerRegistry } from "../../controllers/ControllerRegistry.js";
import { ControllerFactory } from "../../controllers/ControllerFactory.js";

// Mock Mediator
class MockMediator {
  public async send(request: any): Promise<any> {
    return { mock: true };
  }
}

describe("Presentation Routes Component Tests (Task 40.8)", () => {
  beforeEach(() => {
    RouteRegistry.clear();
    ControllerRegistry.clear();
  });

  describe("RouteBuilder & RouteGroup", () => {
    it("should build a RouteGroup fluently with prefix, middleware and routes", () => {
      const mockMiddleware = () => {};
      const handler = () => {};

      const group = new RouteBuilder()
        .withPrefix("/test")
        .withMiddleware(mockMiddleware)
        .addRoute("GET", "/status", handler)
        .build();

      expect(group.prefix).toBe("/test");
      expect(group.middleware).toContain(mockMiddleware);
      expect(group.routes.length).toBe(1);
      expect(group.routes[0]).toEqual({
        method: "GET",
        path: "/status",
        handler,
        middleware: []
      });
    });
  });

  describe("RouteRegistry", () => {
    it("should register and retrieve RouteGroups", () => {
      const group1 = new RouteGroup("/users");
      const group2 = new RouteGroup("/payments");

      RouteRegistry.registerGroup(group1);
      RouteRegistry.registerGroup(group2);

      const registered = RouteRegistry.getGroups();
      expect(registered).toContain(group1);
      expect(registered).toContain(group2);
      expect(registered.length).toBe(2);

      RouteRegistry.clear();
      expect(RouteRegistry.getGroups().length).toBe(0);
    });
  });

  describe("RouteFactory with Bounded Context Routes", () => {
    it("should register all 9 context routes from Resolved Controllers", () => {
      const mediator = new MockMediator();

      // Seed all required controllers in registry for factory to resolve
      ControllerRegistry.register("Customer", ControllerFactory.createCustomerController(mediator));
      ControllerRegistry.register("Identity", ControllerFactory.createIdentityController(mediator));
      ControllerRegistry.register("Organization", ControllerFactory.createOrganizationController(mediator));
      ControllerRegistry.register("Invoice", ControllerFactory.createInvoiceController(mediator));
      ControllerRegistry.register("Payment", ControllerFactory.createPaymentController(mediator));
      ControllerRegistry.register("Settlement", ControllerFactory.createSettlementController(mediator));
      ControllerRegistry.register("AccountsReceivable", ControllerFactory.createAccountsReceivableController(mediator));
      ControllerRegistry.register("Notification", ControllerFactory.createNotificationController(mediator));
      ControllerRegistry.register("Workflow", ControllerFactory.createWorkflowController(mediator));

      // Dry run factory loading all routes
      RouteFactory.registerAllRoutes();

      const groups = RouteRegistry.getGroups();
      expect(groups.length).toBe(9);

      const prefixes = groups.map((g) => g.prefix);
      expect(prefixes).toContain("/customers");
      expect(prefixes).toContain("/users");
      expect(prefixes).toContain("/organizations");
      expect(prefixes).toContain("/invoices");
      expect(prefixes).toContain("/payments");
      expect(prefixes).toContain("/settlements");
      expect(prefixes).toContain("/receivables");
      expect(prefixes).toContain("/notifications");
      expect(prefixes).toContain("/workflows");
    });
  });
});
