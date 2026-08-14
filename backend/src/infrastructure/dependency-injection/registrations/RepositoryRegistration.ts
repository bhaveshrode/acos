import { ServiceContainer } from "../container/ServiceContainer.js";
import { Lifetime } from "../lifetimes/Lifetime.js";
import { CustomerRepository } from "../../repositories/customer/CustomerRepository.js";
import { UserRepository } from "../../repositories/identity/UserRepository.js";
import { OrganizationRepository } from "../../repositories/organization/OrganizationRepository.js";
import { InvoiceRepository } from "../../repositories/invoice/InvoiceRepository.js";
import { PaymentRepository } from "../../repositories/payment/PaymentRepository.js";
import { SettlementRepository } from "../../repositories/settlement/SettlementRepository.js";
import { ReceivableRepository } from "../../repositories/accounts_receivable/ReceivableRepository.js";
import { NotificationRepository } from "../../repositories/notification/NotificationRepository.js";
import { WorkflowRepository } from "../../repositories/workflow/WorkflowRepository.js";

/**
 * Service registration helper mapping all 9 Domain Repository interface tokens to concrete repositories.
 */
export class RepositoryRegistration {
  public static register(container: ServiceContainer): void {
    container.register(
      "ICustomerRepository",
      (c) => new CustomerRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "IUserRepository",
      (c) => new UserRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "IOrganizationRepository",
      (c) => new OrganizationRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "IInvoiceRepository",
      (c) => new InvoiceRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "IPaymentRepository",
      (c) => new PaymentRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "ISettlementRepository",
      (c) => new SettlementRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "IAccountsReceivableRepository",
      (c) => new ReceivableRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "INotificationRepository",
      (c) => new NotificationRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "IWorkflowRepository",
      (c) => new WorkflowRepository(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
  }
}
