import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
export class PrismaAccountsReceivableRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`Result account not found.`));
        return Result.ok(item);
    }
    async findByCustomer(orgId, customerId) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.customerId.equals(customerId)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Receivable account not found."));
    }
    async findByInvoice(orgId, invoiceId) {
        return Result.fail(ResultError.notFound("Receivable not found."));
    }
    async save(receivable) {
        this.items.set(receivable.id.value, receivable);
        return Result.ok();
    }
    async delete(id) {
        this.items.delete(id.value);
        return Result.ok();
    }
    clear() {
        this.items.clear();
    }
}
