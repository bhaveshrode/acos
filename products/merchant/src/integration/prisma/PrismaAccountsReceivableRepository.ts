import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { IAccountsReceivableRepository } from "acos-backend/business/accounts_receivable/repositories/IAccountsReceivableRepository.js";
import { AccountsReceivable } from "acos-backend/business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "acos-backend/business/accounts_receivable/value-objects/ReceivableAccountId.js";
import { OrganizationId as OrgId } from "acos-backend/business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "acos-backend/business/customer/value-objects/CustomerId.js";
import { InvoiceId as InvId } from "acos-backend/business/invoice/value-objects/InvoiceId.js";

export class PrismaAccountsReceivableRepository implements IAccountsReceivableRepository {
  private readonly items = new Map<string, AccountsReceivable>();

  public async findById(id: ReceivableAccountId): Promise<Result<AccountsReceivable>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`Result account not found.`));
    return Result.ok(item);
  }

  public async findByCustomer(orgId: OrgId, customerId: CustomerId): Promise<Result<AccountsReceivable>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerId.equals(customerId)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Receivable account not found."));
  }

  public async findByInvoice(orgId: OrgId, invoiceId: InvId): Promise<Result<AccountsReceivable>> {
    return Result.fail(ResultError.notFound("Receivable not found."));
  }

  public async save(receivable: AccountsReceivable): Promise<Result<void>> {
    this.items.set(receivable.id.value, receivable);
    return Result.ok();
  }

  public async delete(id: ReceivableAccountId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }

  public clear(): void {
    this.items.clear();
  }
}
