import { Invoice } from "../aggregates/Invoice.js";
import { InvoiceId } from "../value-objects/InvoiceId.js";
import { InvoiceNumber } from "../value-objects/InvoiceNumber.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for Invoice aggregate root operations.
 */
export interface IInvoiceRepository {
  /**
   * Retrieves an Invoice by its unique ID.
   */
  findById(id: InvoiceId): Promise<Result<Invoice>>;

  /**
   * Retrieves an Invoice by its unique serial number within an organization.
   */
  findByInvoiceNumber(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<Invoice>>;

  /**
   * Retrieves all Invoices belonging to a Customer.
   */
  findByCustomer(orgId: OrganizationId, customerId: CustomerId): Promise<Result<Invoice[]>>;

  /**
   * Retrieves all Invoices belonging to an Organization.
   */
  findByOrganization(orgId: OrganizationId): Promise<Result<Invoice[]>>;

  /**
   * Checks if an Invoice with the serial number already exists under the organization.
   */
  exists(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<boolean>>;

  /**
   * Saves or updates an Invoice aggregate in database.
   */
  save(invoice: Invoice): Promise<Result<void>>;

  /**
   * Permanently deletes an Invoice aggregate.
   */
  delete(id: InvoiceId): Promise<Result<void>>;
}
