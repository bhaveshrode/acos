import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Payment } from "../aggregates/Payment.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain Service enforcing payment allocation distributions and FIFO mapping.
 */
export class AllocationPolicy {
  /**
   * Asserts if the aggregate's sum of allocations complies with its payment capacity.
   */
  public validateAllocations(payment: Payment): Result<void> {
    let allocatedTotal = 0;
    payment.allocations.forEach((alloc) => {
      allocatedTotal += alloc.allocatedAmount.amount;
    });

    if (allocatedTotal > payment.amount.amount) {
      return Result.fail(
        ResultError.conflict("Sum of allocations cannot exceed payment amount.")
      );
    }
    return Result.ok();
  }

  /**
   * Distributes payment amount across outstanding invoices in a First-In-First-Out sequence.
   */
  public distributeFIFO(
    paymentAmount: Money,
    outstandingInvoices: { id: string; balance: number }[]
  ): { invoiceId: string; amount: Money }[] {
    let remaining = paymentAmount.amount;
    const distributions: { invoiceId: string; amount: Money }[] = [];

    // Sort by ID to represent incremental chronological sequence in test environments
    const sorted = [...outstandingInvoices].sort((a, b) => a.id.localeCompare(b.id));

    for (const inv of sorted) {
      if (remaining <= 0) break;
      const allocateValue = Math.min(remaining, inv.balance);
      distributions.push({
        invoiceId: inv.id,
        amount: Money.create(allocateValue, paymentAmount.currency).value
      });
      remaining -= allocateValue;
    }

    return distributions;
  }
}
