import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Customer } from "../aggregates/Customer.js";
import { TaxIdentifier } from "../value-objects/TaxIdentifier.js";

/**
 * Domain Service enforcing business policies across Customer aggregates.
 */
export class CustomerPolicy {
  /**
   * Asserts that a candidate TaxIdentifier is unique among the organization's customer index.
   */
  public validateUniqueTaxIdentifier(
    taxId: TaxIdentifier,
    existingCustomers: Customer[],
    currentCustomerId?: string
  ): Result<void> {
    const duplicate = existingCustomers.find(
      (c) =>
        c.taxIdentifier &&
        c.taxIdentifier.equals(taxId) &&
        c.id.value !== currentCustomerId
    );

    if (duplicate) {
      return Result.fail(
        ResultError.conflict(
          `A customer with tax identifier '${taxId.value}' already exists within this organization.`
        )
      );
    }

    return Result.ok();
  }

  /**
   * Asserts that a customer can be archived based on outstanding financial relations.
   */
  public validateCanArchive(customer: Customer, hasActiveInvoices: boolean): Result<void> {
    if (hasActiveInvoices) {
      return Result.fail(
        ResultError.conflict("Cannot archive customer with unpaid active invoices.")
      );
    }
    return Result.ok();
  }
}
