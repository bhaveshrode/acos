import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Invoice } from "../aggregates/Invoice.js";
import { InvoiceStatus } from "../enums/InvoiceStatus.js";

/**
 * Domain Service enforcing state transition policies for Invoices.
 */
export class InvoicePolicy {
  /**
   * Asserts if edits are permitted on the invoice (only allowed in DRAFT).
   */
  public validateCanEdit(invoice: Invoice): Result<void> {
    if (invoice.status !== InvoiceStatus.DRAFT) {
      return Result.fail(
        ResultError.conflict(`Cannot modify invoice in status: ${invoice.status}.`)
      );
    }
    return Result.ok();
  }

  /**
   * Asserts if the invoice is voidable (only allowed in DRAFT or ISSUED).
   */
  public validateCanVoid(invoice: Invoice): Result<void> {
    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.ISSUED) {
      return Result.fail(ResultError.conflict(`Cannot void invoice in status: ${invoice.status}.`));
    }
    return Result.ok();
  }

  /**
   * Asserts if the invoice can be cancelled (allowed in DRAFT, ISSUED, or PARTIALLY_PAID).
   */
  public validateCanCancel(invoice: Invoice): Result<void> {
    if (
      invoice.status !== InvoiceStatus.DRAFT &&
      invoice.status !== InvoiceStatus.ISSUED &&
      invoice.status !== InvoiceStatus.PARTIALLY_PAID
    ) {
      return Result.fail(
        ResultError.conflict(`Cannot cancel invoice in status: ${invoice.status}.`)
      );
    }
    return Result.ok();
  }
}
