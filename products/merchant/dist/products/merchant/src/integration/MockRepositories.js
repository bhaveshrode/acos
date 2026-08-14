import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
/**
 * In-memory repository implementation of IUserRepository.
 */
export class MockUserRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`User with ID ${id.value} not found.`));
        return Result.ok(item);
    }
    async findByEmail(email) {
        for (const item of this.items.values()) {
            if (item.email.equals(email)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound(`User with email ${email.value} not found.`));
    }
    async exists(email) {
        for (const item of this.items.values()) {
            if (item.email.equals(email)) {
                return Result.ok(true);
            }
        }
        return Result.ok(false);
    }
    async save(user) {
        this.items.set(user.id.value, user);
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
/**
 * In-memory repository implementation of IOrganizationRepository.
 */
export class MockOrganizationRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`Organization with ID ${id.value} not found.`));
        return Result.ok(item);
    }
    async findBySlug(slug) {
        for (const item of this.items.values()) {
            if (item.slug.equals(slug)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound(`Organization with slug ${slug.value} not found.`));
    }
    async exists(slug) {
        for (const item of this.items.values()) {
            if (item.slug.equals(slug)) {
                return Result.ok(true);
            }
        }
        return Result.ok(false);
    }
    async save(org) {
        this.items.set(org.id.value, org);
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
/**
 * In-memory repository implementation of ICustomerRepository.
 */
export class MockCustomerRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`Customer with ID ${id.value} not found.`));
        return Result.ok(item);
    }
    async findByCustomerNumber(orgId, number) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.customerNumber.equals(number)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Customer not found."));
    }
    async findByOrganization(orgId) {
        const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId));
        return Result.ok(list);
    }
    async exists(orgId, number) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.customerNumber.equals(number)) {
                return Result.ok(true);
            }
        }
        return Result.ok(false);
    }
    async save(customer) {
        this.items.set(customer.id.value, customer);
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
/**
 * In-memory repository implementation of IInvoiceRepository.
 */
export class MockInvoiceRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`Invoice with ID ${id.value} not found.`));
        return Result.ok(item);
    }
    async findByInvoiceNumber(orgId, number) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.invoiceNumber.equals(number)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Invoice not found."));
    }
    async findByCustomer(orgId, customerId) {
        const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId) && item.customerId.equals(customerId));
        return Result.ok(list);
    }
    async findByOrganization(orgId) {
        const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId));
        return Result.ok(list);
    }
    async exists(orgId, number) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.invoiceNumber.equals(number)) {
                return Result.ok(true);
            }
        }
        return Result.ok(false);
    }
    async save(invoice) {
        this.items.set(invoice.id.value, invoice);
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
/**
 * In-memory repository implementation of IPaymentRepository.
 */
export class MockPaymentRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`Payment with ID ${id.value} not found.`));
        return Result.ok(item);
    }
    async findByReference(orgId, ref) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.reference.equals(ref)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Payment not found."));
    }
    async findByTransactionHash(hash) {
        for (const item of this.items.values()) {
            if (item.transactionHash && item.transactionHash.equals(hash)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Payment not found."));
    }
    async findByInvoice(orgId, invoiceId) {
        const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId) && item.allocations.some(a => a.invoiceId.equals(invoiceId)));
        return Result.ok(list);
    }
    async existsHash(hash) {
        for (const item of this.items.values()) {
            if (item.transactionHash && item.transactionHash.equals(hash)) {
                return Result.ok(true);
            }
        }
        return Result.ok(false);
    }
    async save(payment) {
        this.items.set(payment.id.value, payment);
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
/**
 * In-memory repository implementation of IAccountsReceivableRepository (Phase 6).
 */
export class MockAccountsReceivableRepository {
    items = new Map();
    async findById(id) {
        const item = this.items.get(id.value);
        if (!item)
            return Result.fail(ResultError.notFound(`Receivable account with ID ${id.value} not found.`));
        return Result.ok(item);
    }
    async findByCustomer(orgId, custId) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.customerId.equals(custId)) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Receivable account not found."));
    }
    async findByInvoice(orgId, invoiceId) {
        for (const item of this.items.values()) {
            if (item.organizationId.equals(orgId) && item.entries.some(e => e.invoiceId.equals(invoiceId))) {
                return Result.ok(item);
            }
        }
        return Result.fail(ResultError.notFound("Receivable account not found."));
    }
    async save(ar) {
        this.items.set(ar.id.value, ar);
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
