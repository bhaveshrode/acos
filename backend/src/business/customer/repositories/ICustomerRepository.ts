import { Customer } from "../aggregates/Customer.js";
import { CustomerId } from "../value-objects/CustomerId.js";
import { CustomerNumber } from "../value-objects/CustomerNumber.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for Customer aggregate root operations.
 */
export interface ICustomerRepository {
  /**
   * Retrieves a Customer by its unique ID.
   */
  findById(id: CustomerId): Promise<Result<Customer>>;

  /**
   * Retrieves a Customer by its sequential identifier number within the organization context.
   */
  findByCustomerNumber(orgId: OrganizationId, number: CustomerNumber): Promise<Result<Customer>>;

  /**
   * Retrieves all Customer aggregates belonging to an organization.
   */
  findByOrganization(orgId: OrganizationId): Promise<Result<Customer[]>>;

  /**
   * Checks if a Customer exists with the given serial number under an organization.
   */
  exists(orgId: OrganizationId, number: CustomerNumber): Promise<Result<boolean>>;

  /**
   * Saves or updates a Customer aggregate in persistence.
   */
  save(customer: Customer): Promise<Result<void>>;

  /**
   * Permanently deletes a Customer aggregate.
   */
  delete(id: CustomerId): Promise<Result<void>>;
}
