import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "../value-objects/ReceivableAccountId.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for AccountsReceivable aggregate root operations.
 */
export interface IAccountsReceivableRepository {
  /**
   * Retrieves an AccountsReceivable account by its unique ID.
   */
  findById(id: ReceivableAccountId): Promise<Result<AccountsReceivable>>;

  /**
   * Retrieves an AccountsReceivable account by customer.
   */
  findByCustomer(orgId: OrganizationId, custId: CustomerId): Promise<Result<AccountsReceivable>>;

  /**
   * Retrieves the AccountsReceivable account containing a specific invoice.
   */
  findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<AccountsReceivable>>;

  /**
   * Saves or updates an AccountsReceivable aggregate in persistence.
   */
  save(ar: AccountsReceivable): Promise<Result<void>>;

  /**
   * Permanently deletes an AccountsReceivable aggregate.
   */
  delete(id: ReceivableAccountId): Promise<Result<void>>;
}
