import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { IUserRepository } from "acos-backend/business/identity/repositories/IUserRepository.js";
import { User } from "acos-backend/business/identity/aggregates/User.js";
import { UserId } from "acos-backend/business/identity/value-objects/UserId.js";
import { Email } from "acos-backend/business/identity/value-objects/Email.js";

import { IOrganizationRepository } from "acos-backend/business/organization/repositories/IOrganizationRepository.js";
import { Organization } from "acos-backend/business/organization/aggregates/Organization.js";
import { OrganizationId } from "acos-backend/business/organization/value-objects/OrganizationId.js";
import { OrganizationSlug } from "acos-backend/business/organization/value-objects/OrganizationSlug.js";

import { ICustomerRepository } from "acos-backend/business/customer/repositories/ICustomerRepository.js";
import { Customer } from "acos-backend/business/customer/aggregates/Customer.js";
import { CustomerId } from "acos-backend/business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "acos-backend/business/customer/value-objects/CustomerNumber.js";

import { IInvoiceRepository } from "acos-backend/business/invoice/repositories/IInvoiceRepository.js";
import { Invoice } from "acos-backend/business/invoice/aggregates/Invoice.js";
import { InvoiceId } from "acos-backend/business/invoice/value-objects/InvoiceId.js";
import { InvoiceNumber } from "acos-backend/business/invoice/value-objects/InvoiceNumber.js";

import { IPaymentRepository } from "acos-backend/business/payment/repositories/IPaymentRepository.js";
import { Payment } from "acos-backend/business/payment/aggregates/Payment.js";
import { PaymentId } from "acos-backend/business/payment/value-objects/PaymentId.js";
import { PaymentReference } from "acos-backend/business/payment/value-objects/PaymentReference.js";
import { TransactionHash } from "acos-backend/business/payment/value-objects/TransactionHash.js";

import { IAccountsReceivableRepository } from "acos-backend/business/accounts_receivable/repositories/IAccountsReceivableRepository.js";
import { AccountsReceivable } from "acos-backend/business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "acos-backend/business/accounts_receivable/value-objects/ReceivableAccountId.js";

/**
 * In-memory repository implementation of IUserRepository.
 */
export class MockUserRepository implements IUserRepository {
  public readonly items = new Map<string, User>();

  public async findById(id: UserId): Promise<Result<User>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`User with ID ${id.value} not found.`));
    return Result.ok(item);
  }

  public async findByEmail(email: Email): Promise<Result<User>> {
    for (const item of this.items.values()) {
      if (item.email.equals(email)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound(`User with email ${email.value} not found.`));
  }

  public async exists(email: Email): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.email.equals(email)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(user: User): Promise<Result<void>> {
    this.items.set(user.id.value, user);
    return Result.ok();
  }

  public async delete(id: UserId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }

  public clear(): void {
    this.items.clear();
  }
}

/**
 * In-memory repository implementation of IOrganizationRepository.
 */
export class MockOrganizationRepository implements IOrganizationRepository {
  public readonly items = new Map<string, Organization>();

  public async findById(id: OrganizationId): Promise<Result<Organization>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`Organization with ID ${id.value} not found.`));
    return Result.ok(item);
  }

  public async findBySlug(slug: OrganizationSlug): Promise<Result<Organization>> {
    for (const item of this.items.values()) {
      if (item.slug.equals(slug)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound(`Organization with slug ${slug.value} not found.`));
  }

  public async exists(slug: OrganizationSlug): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.slug.equals(slug)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(org: Organization): Promise<Result<void>> {
    this.items.set(org.id.value, org);
    return Result.ok();
  }

  public async delete(id: OrganizationId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }

  public clear(): void {
    this.items.clear();
  }
}

/**
 * In-memory repository implementation of ICustomerRepository.
 */
export class MockCustomerRepository implements ICustomerRepository {
  public readonly items = new Map<string, Customer>();

  public async findById(id: CustomerId): Promise<Result<Customer>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`Customer with ID ${id.value} not found.`));
    return Result.ok(item);
  }

  public async findByCustomerNumber(
    orgId: OrganizationId,
    number: CustomerNumber
  ): Promise<Result<Customer>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerNumber.equals(number)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Customer not found."));
  }

  public async findByOrganization(orgId: OrganizationId): Promise<Result<Customer[]>> {
    const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId));
    return Result.ok(list);
  }

  public async exists(orgId: OrganizationId, number: CustomerNumber): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerNumber.equals(number)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(customer: Customer): Promise<Result<void>> {
    this.items.set(customer.id.value, customer);
    return Result.ok();
  }

  public async delete(id: CustomerId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }

  public clear(): void {
    this.items.clear();
  }
}

/**
 * In-memory repository implementation of IInvoiceRepository.
 */
export class MockInvoiceRepository implements IInvoiceRepository {
  public readonly items = new Map<string, Invoice>();

  public async findById(id: InvoiceId): Promise<Result<Invoice>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`Invoice with ID ${id.value} not found.`));
    return Result.ok(item);
  }

  public async findByInvoiceNumber(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<Invoice>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.invoiceNumber.equals(number)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Invoice not found."));
  }

  public async findByCustomer(orgId: OrganizationId, customerId: CustomerId): Promise<Result<Invoice[]>> {
    const list = Array.from(this.items.values()).filter(
      (item) => item.organizationId.equals(orgId) && item.customerId.equals(customerId)
    );
    return Result.ok(list);
  }

  public async findByOrganization(orgId: OrganizationId): Promise<Result<Invoice[]>> {
    const list = Array.from(this.items.values()).filter((item) => item.organizationId.equals(orgId));
    return Result.ok(list);
  }

  public async exists(orgId: OrganizationId, number: InvoiceNumber): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.invoiceNumber.equals(number)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(invoice: Invoice): Promise<Result<void>> {
    this.items.set(invoice.id.value, invoice);
    return Result.ok();
  }

  public async delete(id: InvoiceId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }

  public clear(): void {
    this.items.clear();
  }
}

/**
 * In-memory repository implementation of IPaymentRepository.
 */
export class MockPaymentRepository implements IPaymentRepository {
  public readonly items = new Map<string, Payment>();

  public async findById(id: PaymentId): Promise<Result<Payment>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`Payment with ID ${id.value} not found.`));
    return Result.ok(item);
  }

  public async findByReference(orgId: OrganizationId, ref: PaymentReference): Promise<Result<Payment>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.reference.equals(ref)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Payment not found."));
  }

  public async findByTransactionHash(hash: TransactionHash): Promise<Result<Payment>> {
    for (const item of this.items.values()) {
      if (item.transactionHash && item.transactionHash.equals(hash)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Payment not found."));
  }

  public async findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<Payment[]>> {
    const list = Array.from(this.items.values()).filter(
      (item) => item.organizationId.equals(orgId) && item.allocations.some(a => a.invoiceId.equals(invoiceId))
    );
    return Result.ok(list);
  }

  public async existsHash(hash: TransactionHash): Promise<Result<boolean>> {
    for (const item of this.items.values()) {
      if (item.transactionHash && item.transactionHash.equals(hash)) {
        return Result.ok(true);
      }
    }
    return Result.ok(false);
  }

  public async save(payment: Payment): Promise<Result<void>> {
    this.items.set(payment.id.value, payment);
    return Result.ok();
  }

  public async delete(id: PaymentId): Promise<Result<void>> {
    this.items.delete(id.value);
    return Result.ok();
  }

  public clear(): void {
    this.items.clear();
  }
}

/**
 * In-memory repository implementation of IAccountsReceivableRepository (Phase 6).
 */
export class MockAccountsReceivableRepository implements IAccountsReceivableRepository {
  public readonly items = new Map<string, AccountsReceivable>();

  public async findById(id: ReceivableAccountId): Promise<Result<AccountsReceivable>> {
    const item = this.items.get(id.value);
    if (!item) return Result.fail(ResultError.notFound(`Receivable account with ID ${id.value} not found.`));
    return Result.ok(item);
  }

  public async findByCustomer(orgId: OrganizationId, custId: CustomerId): Promise<Result<AccountsReceivable>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.customerId.equals(custId)) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Receivable account not found."));
  }

  public async findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<AccountsReceivable>> {
    for (const item of this.items.values()) {
      if (item.organizationId.equals(orgId) && item.entries.some(e => e.invoiceId.equals(invoiceId))) {
        return Result.ok(item);
      }
    }
    return Result.fail(ResultError.notFound("Receivable account not found."));
  }

  public async save(ar: AccountsReceivable): Promise<Result<void>> {
    this.items.set(ar.id.value, ar);
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
