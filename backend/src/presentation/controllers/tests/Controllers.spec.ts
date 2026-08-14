import { describe, it, expect, beforeEach } from "vitest";
import { BaseController, IMediator } from "../BaseController.js";
import { ControllerContext } from "../ControllerContext.js";
import { CustomerController } from "../CustomerController.js";
import { IdentityController } from "../IdentityController.js";
import { OrganizationController } from "../OrganizationController.js";
import { InvoiceController } from "../InvoiceController.js";
import { PaymentController } from "../PaymentController.js";
import { SettlementController } from "../SettlementController.js";
import { AccountsReceivableController } from "../AccountsReceivableController.js";
import { NotificationController } from "../NotificationController.js";
import { WorkflowController } from "../WorkflowController.js";
import { ControllerRegistry } from "../ControllerRegistry.js";
import { ControllerFactory } from "../ControllerFactory.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Mock Mediator implementation
class MockMediator implements IMediator {
  public lastRequestSent: any = null;
  public mockResponse: any = Result.ok("mock-success-payload");

  public async send(request: any): Promise<any> {
    this.lastRequestSent = request;
    return this.mockResponse;
  }
}

describe("Presentation Controllers Component Tests (Task 39.7)", () => {
  let mediator: MockMediator;

  beforeEach(() => {
    mediator = new MockMediator();
    ControllerRegistry.clear();
  });

  describe("BaseController Response Helpers & Execution", () => {
    it("should return correct HTTP shapes from helper status codes", () => {
      // Create inline controller to test protected methods
      class TestCtrl extends BaseController {
        constructor(med: IMediator) {
          super(med);
        }
        public testOk() { return this.ok("data"); }
        public testCreated() { return this.created("created-id"); }
        public testBadRequest() { return this.badRequest("err"); }
        public testNotFound() { return this.notFound(); }
        public testForbidden() { return this.forbidden(); }
      }

      const ctrl = new TestCtrl(mediator);
      expect(ctrl.testOk()).toEqual({ status: 200, body: "data" });
      expect(ctrl.testCreated()).toEqual({ status: 201, body: "created-id" });
      expect(ctrl.testBadRequest()).toEqual({ status: 400, body: { error: "err" } });
      expect(ctrl.testNotFound()).toEqual({ status: 404, body: { error: "Not Found" } });
      expect(ctrl.testForbidden()).toEqual({ status: 403, body: { error: "Forbidden" } });
    });

    it("should translate success and failure Results to corresponding HTTP outputs", async () => {
      class TestCtrl extends BaseController {
        constructor(med: IMediator) {
          super(med);
        }
        public async run(req: any) {
          return this.execute(req);
        }
      }
      const ctrl = new TestCtrl(mediator);

      // Test Success Result
      mediator.mockResponse = Result.ok("data-saved");
      const successRes = await ctrl.run({ action: "save" });
      expect(successRes).toEqual({ status: 200, body: "data-saved" });
      expect(mediator.lastRequestSent).toEqual({ action: "save" });

      // Test Failure Result
      mediator.mockResponse = Result.fail(new ResultError("RESOURCE_LOCKED", "Locked database write"));
      const failRes = await ctrl.run({ action: "save" });
      expect(failRes).toEqual({ status: 400, body: { error: "Locked database write" } });
    });
  });

  describe("Bounded Context controllers mappings", () => {
    it("should map CustomerController commands and queries correctly", async () => {
      const ctrl = new CustomerController(mediator);

      await ctrl.createCustomer({ name: "Bob" });
      expect(mediator.lastRequestSent.type).toBe("CreateCustomerCommand");
      expect(mediator.lastRequestSent.body).toEqual({ name: "Bob" });

      await ctrl.getCustomerById("cust-1");
      expect(mediator.lastRequestSent.type).toBe("GetCustomerByIdQuery");
      expect(mediator.lastRequestSent.id).toBe("cust-1");
    });

    it("should map IdentityController logins and registers", async () => {
      const ctrl = new IdentityController(mediator);

      await ctrl.register({ email: "test@acos.io" });
      expect(mediator.lastRequestSent.type).toBe("RegisterUserCommand");

      await ctrl.login({ pass: "secret" });
      expect(mediator.lastRequestSent.type).toBe("LoginUserCommand");
    });
  });

  describe("Transaction context controllers mappings", () => {
    it("should map InvoiceController issues and cancels", async () => {
      const ctrl = new InvoiceController(mediator);

      await ctrl.issueInvoice("inv-55");
      expect(mediator.lastRequestSent.type).toBe("IssueInvoiceCommand");
      expect(mediator.lastRequestSent.id).toBe("inv-55");
    });

    it("should map PaymentController and AccountsReceivableController writeoffs", async () => {
      const payCtrl = new PaymentController(mediator);
      const recCtrl = new AccountsReceivableController(mediator);

      await payCtrl.confirmPayment("pay-7");
      expect(mediator.lastRequestSent.type).toBe("ConfirmPaymentCommand");

      await recCtrl.writeoffReceivable("rec-9");
      expect(mediator.lastRequestSent.type).toBe("WriteoffReceivableCommand");
    });
  });

  describe("Infrastructure context controllers mappings", () => {
    it("should map NotificationController and WorkflowController actions", async () => {
      const notifCtrl = new NotificationController(mediator);
      const wfCtrl = new WorkflowController(mediator);

      await notifCtrl.sendNotification({ msg: "hi" });
      expect(mediator.lastRequestSent.type).toBe("SendNotificationCommand");

      await wfCtrl.initiateWorkflow({ workflowType: "InvoiceProcessing" });
      expect(mediator.lastRequestSent.type).toBe("InitiateWorkflowCommand");
    });
  });

  describe("ControllerRegistry and ControllerFactory resolvers", () => {
    it("should register and resolve controllers through registries catalog", () => {
      const customerController = ControllerFactory.createCustomerController(mediator);
      ControllerRegistry.register("Customer", customerController);

      expect(ControllerRegistry.getControllers()).toContain("Customer");
      expect(ControllerRegistry.resolve("Customer")).toBe(customerController);

      expect(() => {
        ControllerRegistry.resolve("NonExistentController");
      }).toThrow("is not registered");
    });

    it("should build all context controllers via Factory instantiators", () => {
      expect(ControllerFactory.createCustomerController(mediator)).toBeInstanceOf(CustomerController);
      expect(ControllerFactory.createIdentityController(mediator)).toBeInstanceOf(IdentityController);
      expect(ControllerFactory.createOrganizationController(mediator)).toBeInstanceOf(OrganizationController);
      expect(ControllerFactory.createInvoiceController(mediator)).toBeInstanceOf(InvoiceController);
      expect(ControllerFactory.createPaymentController(mediator)).toBeInstanceOf(PaymentController);
      expect(ControllerFactory.createSettlementController(mediator)).toBeInstanceOf(SettlementController);
      expect(ControllerFactory.createAccountsReceivableController(mediator)).toBeInstanceOf(AccountsReceivableController);
      expect(ControllerFactory.createNotificationController(mediator)).toBeInstanceOf(NotificationController);
      expect(ControllerFactory.createWorkflowController(mediator)).toBeInstanceOf(WorkflowController);
    });
  });
});
