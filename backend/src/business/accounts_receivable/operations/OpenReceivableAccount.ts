import { Result } from "../../../foundation/result/Result.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "../value-objects/ReceivableAccountId.js";

/**
 * Opens the receivable account that tracks a customer's obligations with a
 * business, generating the account identifier.
 */
export function openReceivableAccount(
  organizationId: OrganizationId,
  customerId: CustomerId
): Result<AccountsReceivable> {
  return AccountsReceivable.create(ReceivableAccountId.generate(), organizationId, customerId);
}
