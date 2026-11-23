import { Money } from "../../invoice/value-objects/Money.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import { AccountsReceivable, CreditRefundResult } from "../aggregates/AccountsReceivable.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Returns the unapplied credit a payment left behind, so a refund does not
 * re-open an invoice obligation the payment had already settled.
 */
export function refundCustomerCredit(
  account: AccountsReceivable,
  settlementId: SettlementId,
  amount: Money
): Result<CreditRefundResult> {
  return account.refundCredit(settlementId, amount);
}
