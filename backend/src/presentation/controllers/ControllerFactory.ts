import { IMediator } from "./BaseController.js";
import { CustomerController } from "./CustomerController.js";
import { IdentityController } from "./IdentityController.js";
import { OrganizationController } from "./OrganizationController.js";
import { InvoiceController } from "./InvoiceController.js";
import { PaymentController } from "./PaymentController.js";
import { SettlementController } from "./SettlementController.js";
import { AccountsReceivableController } from "./AccountsReceivableController.js";
import { NotificationController } from "./NotificationController.js";
import { WorkflowController } from "./WorkflowController.js";

/**
 * ControllerFactory class organizing controller instantiations and mediator mappings.
 */
export class ControllerFactory {
  public static createCustomerController(mediator: IMediator): CustomerController {
    return new CustomerController(mediator);
  }

  public static createIdentityController(mediator: IMediator): IdentityController {
    return new IdentityController(mediator);
  }

  public static createOrganizationController(mediator: IMediator): OrganizationController {
    return new OrganizationController(mediator);
  }

  public static createInvoiceController(mediator: IMediator): InvoiceController {
    return new InvoiceController(mediator);
  }

  public static createPaymentController(mediator: IMediator): PaymentController {
    return new PaymentController(mediator);
  }

  public static createSettlementController(mediator: IMediator): SettlementController {
    return new SettlementController(mediator);
  }

  public static createAccountsReceivableController(mediator: IMediator): AccountsReceivableController {
    return new AccountsReceivableController(mediator);
  }

  public static createNotificationController(mediator: IMediator): NotificationController {
    return new NotificationController(mediator);
  }

  public static createWorkflowController(mediator: IMediator): WorkflowController {
    return new WorkflowController(mediator);
  }
}
