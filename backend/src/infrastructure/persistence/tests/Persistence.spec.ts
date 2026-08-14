import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

// Customer
import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "../../../business/customer/value-objects/CustomerNumber.js";
import { CustomerName } from "../../../business/customer/value-objects/CustomerName.js";
import { CompanyName } from "../../../business/customer/value-objects/CompanyName.js";
import { EmailAddress } from "../../../business/customer/value-objects/EmailAddress.js";
import { Address } from "../../../business/customer/value-objects/Address.js";
import { CustomerSerializer } from "../serializers/CustomerSerializer.js";
import { CustomerDeserializer } from "../deserializers/CustomerDeserializer.js";
import { CustomerHydrator } from "../hydrators/CustomerHydrator.js";
import { CustomerExtractor } from "../extractors/CustomerExtractor.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";

// User
import { User } from "../../../business/identity/aggregates/User.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { PasswordHash } from "../../../business/identity/value-objects/PasswordHash.js";
import { VerificationToken } from "../../../business/identity/value-objects/VerificationToken.js";
import { UserSerializer } from "../serializers/UserSerializer.js";
import { UserDeserializer } from "../deserializers/UserDeserializer.js";
import { UserHydrator } from "../hydrators/UserHydrator.js";

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
import { InvoiceSerializer } from "../serializers/InvoiceSerializer.js";
import { InvoiceDeserializer } from "../deserializers/InvoiceDeserializer.js";
import { InvoiceHydrator } from "../hydrators/InvoiceHydrator.js";
import { InvoiceExtractor } from "../extractors/InvoiceExtractor.js";
import { CustomerId as InvCustomerId } from "../../../business/customer/value-objects/CustomerId.js";

describe("Persistence Infrastructure Layer Tests (Task 25.7)", () => {
  it("should successfully serialize, deserialize, hydrate and extract Customer aggregate", () => {
    const orgId = new OrganizationId("11111111-1111-4111-8111-111111111111");
    const custId = new CustomerId("22222222-2222-4222-8222-222222222222");
    const custNum = CustomerNumber.create("CUST-0001").value;
    const name = CustomerName.create("Acme Corp").value;
    const company = CompanyName.create("Acme Industries").value;
    const email = EmailAddress.create("info@acme.com").value;
    const address = Address.create("123 Main St", "Metropolis", "NY", "USA", "10001").value;

    const customerResult = Customer.create(
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
        companyName: company,
        email
      }
    );

    expect(customerResult.isSuccess).toBe(true);
    const customer = customerResult.value;

    // Serialize
    const snapshot = CustomerSerializer.serialize(customer);
    expect(snapshot.id).toBe("22222222-2222-4222-8222-222222222222");
    expect(snapshot.name).toBe("Acme Corp");
    expect(snapshot.companyName).toBe("Acme Industries");
    expect(snapshot.email).toBe("info@acme.com");
    expect(snapshot.addresses.length).toBe(1);
    expect(snapshot.contacts.length).toBe(1);

    // Deserialize
    const props = CustomerDeserializer.deserialize(snapshot);
    expect(props.name.value).toBe("Acme Corp");
    expect(props.companyName?.value).toBe("Acme Industries");

    // Hydrate
    const hydrated = CustomerHydrator.hydrate(snapshot);
    expect(hydrated.id.value).toBe(customer.id.value);
    expect(hydrated.name.value).toBe(customer.name.value);
    expect(hydrated.addresses.length).toBe(customer.addresses.length);

    // Extract
    const extracted = CustomerExtractor.extract(customer);
    expect(extracted.customer.id).toBe("22222222-2222-4222-8222-222222222222");
    expect(extracted.addresses.length).toBe(1);
    expect(extracted.contacts.length).toBe(1);
  });

  it("should successfully serialize, deserialize, and hydrate User aggregate", () => {
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

    // Serialize
    const snapshot = UserSerializer.serialize(user);
    expect(snapshot.id).toBe("44444444-4444-4444-8444-444444444444");
    expect(snapshot.name).toBe("Alice Smith");
    expect(snapshot.email).toBe("user@acos.io");
    expect(snapshot.verificationToken?.token).toBe("token-123");

    // Deserialize
    const props = UserDeserializer.deserialize(snapshot);
    expect(props.name).toBe("Alice Smith");
    expect(props.email.value).toBe("user@acos.io");

    // Hydrate
    const hydrated = UserHydrator.hydrate(snapshot);
    expect(hydrated.id.value).toBe(user.id.value);
    expect(hydrated.name).toBe(user.name);
    expect(hydrated.email.value).toBe(user.email.value);
  });

  it("should successfully serialize, deserialize, hydrate and extract Invoice aggregate", () => {
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

    // Bypass private constructor using cast to any for direct setup
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

    // Serialize
    const snapshot = InvoiceSerializer.serialize(invoice);
    expect(snapshot.id).toBe("55555555-5555-4555-8555-555555555555");
    expect(snapshot.invoiceNumber).toBe("INV-2026-001");
    expect(snapshot.grandTotal).toBe(1650);
    expect(snapshot.lines.length).toBe(1);

    // Deserialize
    const props = InvoiceDeserializer.deserialize(snapshot);
    expect(props.invoiceNumber.value).toBe("INV-2026-001");
    expect(props.grandTotal.amount).toBe(1650);

    // Hydrate
    const hydrated = InvoiceHydrator.hydrate(snapshot);
    expect(hydrated.id.value).toBe(invoice.id.value);
    expect(hydrated.grandTotal.amount).toBe(invoice.grandTotal.amount);

    // Extract
    const extracted = InvoiceExtractor.extract(invoice);
    expect(extracted.invoice.id).toBe("55555555-5555-4555-8555-555555555555");
    expect(extracted.lines.length).toBe(1);
  });
});
