import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { CreditAllocationPolicy } from "../services/CreditAllocationPolicy.js";

/**
 * Applies settled funds to an invoice obligation, booking any excess as a
 * customer credit according to the policy.
 */
export function applyReceivablePayment(
  account: AccountsReceivable,
  settlementId: SettlementId,
  invoiceId: InvoiceId,
  amount: Money,
  creditAllocationPolicy: CreditAllocationPolicy
): Result<void> {
  return account.applyPayment(
    new UniqueEntityID(),
    settlementId,
    invoiceId,
    amount,
    creditAllocationPolicy
  );
}
