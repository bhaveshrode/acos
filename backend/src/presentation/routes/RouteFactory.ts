import { RouteRegistry } from "./RouteRegistry.js";
import { ControllerRegistry } from "../controllers/ControllerRegistry.js";
import { CustomerController } from "../controllers/CustomerController.js";
import { IdentityController } from "../controllers/IdentityController.js";
import { OrganizationController } from "../controllers/OrganizationController.js";
import { InvoiceController } from "../controllers/InvoiceController.js";
import { PaymentController } from "../controllers/PaymentController.js";
import { SettlementController } from "../controllers/SettlementController.js";
import { AccountsReceivableController } from "../controllers/AccountsReceivableController.js";
import { NotificationController } from "../controllers/NotificationController.js";
import { WorkflowController } from "../controllers/WorkflowController.js";

import { CustomerRoutes } from "./CustomerRoutes.js";
import { IdentityRoutes } from "./IdentityRoutes.js";
import { OrganizationRoutes } from "./OrganizationRoutes.js";
import { InvoiceRoutes } from "./InvoiceRoutes.js";
import { PaymentRoutes } from "./PaymentRoutes.js";
import { SettlementRoutes } from "./SettlementRoutes.js";
import { AccountsReceivableRoutes } from "./AccountsReceivableRoutes.js";
import { NotificationRoutes } from "./NotificationRoutes.js";
import { WorkflowRoutes } from "./WorkflowRoutes.js";

/**
 * RouteFactory coordinating instantiation and mapping of all context endpoints groups.
 */
export class RouteFactory {
  /**
   * Resolves controllers and registers their groups.
   */
  public static registerAllRoutes(): void {
    const customerController = ControllerRegistry.resolve("Customer") as CustomerController;
    const identityController = ControllerRegistry.resolve("Identity") as IdentityController;
    const organizationController = ControllerRegistry.resolve("Organization") as OrganizationController;
    const invoiceController = ControllerRegistry.resolve("Invoice") as InvoiceController;
    const paymentController = ControllerRegistry.resolve("Payment") as PaymentController;
    const settlementController = ControllerRegistry.resolve("Settlement") as SettlementController;
    const receivableController = ControllerRegistry.resolve("AccountsReceivable") as AccountsReceivableController;
    const notificationController = ControllerRegistry.resolve("Notification") as NotificationController;
    const workflowController = ControllerRegistry.resolve("Workflow") as WorkflowController;

    RouteRegistry.registerGroup(new CustomerRoutes(customerController).getGroup());
    RouteRegistry.registerGroup(new IdentityRoutes(identityController).getGroup());
    RouteRegistry.registerGroup(new OrganizationRoutes(organizationController).getGroup());
    RouteRegistry.registerGroup(new InvoiceRoutes(invoiceController).getGroup());
    RouteRegistry.registerGroup(new PaymentRoutes(paymentController).getGroup());
    RouteRegistry.registerGroup(new SettlementRoutes(settlementController).getGroup());
    RouteRegistry.registerGroup(new AccountsReceivableRoutes(receivableController).getGroup());
    RouteRegistry.registerGroup(new NotificationRoutes(notificationController).getGroup());
    RouteRegistry.registerGroup(new WorkflowRoutes(workflowController).getGroup());
  }
}
