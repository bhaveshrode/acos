import { describe, it, expect, vi, beforeEach } from "vitest";
import { RepositoryContext } from "../base/RepositoryContext.js";
import { CustomerRepository } from "../customer/CustomerRepository.js";
import { UserRepository } from "../identity/UserRepository.js";
import { InvoiceRepository } from "../invoice/InvoiceRepository.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

// Customer
import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "../../../business/customer/value-objects/CustomerNumber.js";
import { CustomerName } from "../../../business/customer/value-objects/CustomerName.js";
import { EmailAddress } from "../../../business/customer/value-objects/EmailAddress.js";
import { Address } from "../../../business/customer/value-objects/Address.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";

// User
import { User } from "../../../business/identity/aggregates/User.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { PasswordHash } from "../../../business/identity/value-objects/PasswordHash.js";
import { VerificationToken } from "../../../business/identity/value-objects/VerificationToken.js";

// Invoice
import { Invoice } from "../../../business/invoice/aggregates/Invoice.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { InvoiceNumber } from "../../../business/invoice/value-objects/InvoiceNumber.js";
import { Quantity } from "../../../business/invoice/value-objects/Quantity.js";
import { UnitPrice } from "../../../business/invoice/value-objects/UnitPrice.js";
import { TaxRate } from "../../../business/invoice/value-objects/TaxRate.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { DueDate } from "../../../business/invoice/value-objects/DueDate.js";
import { InvoiceType } from "../../../business/invoice/enums/InvoiceType.js";
import { InvoiceLine } from "../../../business/invoice/entities/InvoiceLine.js";
import { CustomerId as InvCustomerId } from "../../../business/customer/value-objects/CustomerId.js";

describe("Repositories Infrastructure Layer Tests (Task 26.11)", () => {
  let mockPrisma: any;
  let context: RepositoryContext;

  beforeEach(() => {
    mockPrisma = {
      customer: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn()
      },
      customerAddress: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      customerContact: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      customerNote: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn()
      },
      userSession: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      loginAttempt: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      invoice: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn()
      },
      invoiceLineItem: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      invoiceNote: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      $transaction: vi.fn((cb) => cb(mockPrisma))
    };
    context = new RepositoryContext(mockPrisma);
  });

  describe("CustomerRepository", () => {
    it("should successfully save a customer and sync child records in transaction", async () => {
      const repo = new CustomerRepository(context);
      const orgId = new OrganizationId("11111111-1111-4111-8111-111111111111");
      const custId = new CustomerId("22222222-2222-4222-8222-222222222222");
      const custNum = CustomerNumber.create("CUST-0001").value;
      const name = CustomerName.create("Acme Corp").value;
      const email = EmailAddress.create("info@acme.com").value;
      const address = Address.create("123 Main St", "Metropolis", "NY", "USA", "10001").value;

      const customer = Customer.create(
        custId,
        orgId,
        custNum,
        name,
        {
          id: new UniqueEntityID("33333333-3333-4333-8333-333333333333"),
          name: "John Doe",
          email
        },
        address,
        {
          email
        }
      ).value;

      mockPrisma.customer.upsert.mockResolvedValue({});
      mockPrisma.customerAddress.deleteMany.mockResolvedValue({});
      mockPrisma.customerAddress.createMany.mockResolvedValue({});
      mockPrisma.customerContact.deleteMany.mockResolvedValue({});
      mockPrisma.customerContact.createMany.mockResolvedValue({});
      mockPrisma.customerNote.deleteMany.mockResolvedValue({});
      mockPrisma.customerNote.createMany.mockResolvedValue({});

      const saveResult = await repo.save(customer);
      expect(saveResult.isSuccess).toBe(true);
      expect(mockPrisma.customer.upsert).toHaveBeenCalled();
      expect(mockPrisma.customerAddress.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.customerAddress.createMany).toHaveBeenCalled();
    });

    it("should retrieve a customer aggregate with all child records mapped", async () => {
      const repo = new CustomerRepository(context);
      const custId = new CustomerId("22222222-2222-4222-8222-222222222222");

      mockPrisma.customer.findUnique.mockResolvedValue({
        id: "22222222-2222-4222-8222-222222222222",
        organizationId: "11111111-1111-4111-8111-111111111111",
        customerNumber: "CUST-0001",
        name: "Acme Corp",
        companyName: "Acme Industries",
        status: "ACTIVE",
        taxIdentifier: null,
        phoneNumber: null,
        website: null,
        email: "info@acme.com",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockPrisma.customerAddress.findMany.mockResolvedValue([
        {
          id: "77777777-7777-4777-8777-777777777777",
          customerId: "22222222-2222-4222-8222-222222222222",
          line1: "123 Main St",
          line2: null,
          city: "Metropolis",
          state: "NY",
          country: "USA",
          postalCode: "10001",
          type: "BILLING"
        }
      ]);

      mockPrisma.customerContact.findMany.mockResolvedValue([
        {
          id: "33333333-3333-4333-8333-333333333333",
          customerId: "22222222-2222-4222-8222-222222222222",
          name: "John Doe",
          email: "info@acme.com",
          phone: null,
          isPrimary: true
        }
      ]);

      mockPrisma.customerNote.findMany.mockResolvedValue([]);

      const result = await repo.findById(custId);
      if (!result.isSuccess) {
        console.error("CUSTOMER RETRIEVAL ERROR DETAILS:", result.error);
      }
      expect(result.isSuccess).toBe(true);
      const customer = result.value;
      expect(customer.id.value).toBe("22222222-2222-4222-8222-222222222222");
      expect(customer.name.value).toBe("Acme Corp");
      expect(customer.addresses.length).toBe(1);
      expect(customer.contacts.length).toBe(1);
    });
  });

  describe("UserRepository", () => {
    it("should successfully save a user and related sessions/login attempts", async () => {
      const repo = new UserRepository(context);
      const userId = new UserId("44444444-4444-4444-8444-444444444444");
      const email = Email.create("user@acos.io").value;
      const passwordHash = PasswordHash.create("secret-hash").value;
      const vToken = VerificationToken.create("token-123", new Date(Date.now() + 3600000)).value;

      const user = User.create(userId, {
        email,
        passwordHash,
        status: "ACTIVE" as any,
        name: "Alice Smith",
        verificationToken: vToken,
        passwordResetToken: null
      });

      mockPrisma.user.upsert.mockResolvedValue({});
      mockPrisma.userSession.deleteMany.mockResolvedValue({});
      mockPrisma.userSession.createMany.mockResolvedValue({});
      mockPrisma.loginAttempt.deleteMany.mockResolvedValue({});

      const saveResult = await repo.save(user);
      expect(saveResult.isSuccess).toBe(true);
      expect(mockPrisma.user.upsert).toHaveBeenCalled();
      expect(mockPrisma.userSession.deleteMany).toHaveBeenCalled();
    });

    it("should retrieve a user by email", async () => {
      const repo = new UserRepository(context);
      const email = Email.create("user@acos.io").value;

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "44444444-4444-4444-8444-444444444444",
        email: "user@acos.io",
        passwordHash: "secret-hash",
        status: "ACTIVE",
        name: "Alice Smith",
        verificationToken: "token-123",
        verificationExpiresAt: new Date(Date.now() + 3600000),
        resetToken: null,
        resetExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockPrisma.userSession.findMany.mockResolvedValue([]);
      mockPrisma.loginAttempt.findMany.mockResolvedValue([]);

      const result = await repo.findByEmail(email);
      expect(result.isSuccess).toBe(true);
      const user = result.value;
      expect(user.id.value).toBe("44444444-4444-4444-8444-444444444444");
      expect(user.email.value).toBe("user@acos.io");
    });
  });

  describe("InvoiceRepository", () => {
    it("should save an invoice and its line items", async () => {
      const repo = new InvoiceRepository(context);
      const orgId = new OrganizationId("11111111-1111-4111-8111-111111111111");
      const custId = new InvCustomerId("22222222-2222-4222-8222-222222222222");
      const invoiceId = new InvoiceId("55555555-5555-4555-8555-555555555555");
      const invNum = InvoiceNumber.create("INV-2026-001").value;
      const issueDate = new Date();
      const dueDateVal = DueDate.create(new Date(Date.now() + 86400000 * 30)).value;

      const lines = new Map<string, InvoiceLine>();
      const lineId = new UniqueEntityID("66666666-6666-4666-8666-666666666666");
      lines.set(
        lineId.value,
        new InvoiceLine(lineId, {
          description: "Consulting",
          quantity: Quantity.create(10).value,
          unitPrice: UnitPrice.create(Money.create(150, "USD").value).value,
          taxRate: TaxRate.create(10).value
        })
      );

      const invoice = new (Invoice as any)(invoiceId, {
        organizationId: orgId,
        customerId: custId,
        invoiceNumber: invNum,
        status: "DRAFT",
        type: InvoiceType.STANDARD,
        currency: "USD",
        paymentTerms: { value: "NET_30" } as any,
        issueDate,
        dueDate: dueDateVal,
        lines,
        notes: new Map(),
        discount: null,
        period: null,
        subtotal: Money.create(1500, "USD").value,
        taxTotal: Money.create(150, "USD").value,
        discountTotal: Money.create(0, "USD").value,
        grandTotal: Money.create(1650, "USD").value,
        createdAt: new Date(),
        updatedAt: new Date()
      }) as Invoice;

      mockPrisma.invoice.upsert.mockResolvedValue({});
      mockPrisma.invoiceLineItem.deleteMany.mockResolvedValue({});
      mockPrisma.invoiceLineItem.createMany.mockResolvedValue({});
      mockPrisma.invoiceNote.deleteMany.mockResolvedValue({});

      const saveResult = await repo.save(invoice);
      expect(saveResult.isSuccess).toBe(true);
      expect(mockPrisma.invoice.upsert).toHaveBeenCalled();
      expect(mockPrisma.invoiceLineItem.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.invoiceLineItem.createMany).toHaveBeenCalled();
    });
  });
});
