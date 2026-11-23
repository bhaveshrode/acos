import { Money } from "../../invoice/value-objects/Money.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import {
  AccountsReceivable,
  ApplicationReversalResult
} from "../aggregates/AccountsReceivable.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Returns money a settlement applied to invoice obligations, re-opening the
 * invoices it settled. Unapplied credit must be returned first, so a refunded
 * overpayment never re-opens an invoice the payment had fully settled.
 */
export function reverseSettlementApplications(
  account: AccountsReceivable,
  settlementId: SettlementId,
  amount: Money
): Result<ApplicationReversalResult> {
  return account.reverseApplications(settlementId, amount);
}
