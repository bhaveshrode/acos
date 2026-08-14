import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { CustomerId } from "../value-objects/CustomerId.js";
import { CustomerNumber } from "../value-objects/CustomerNumber.js";
import { CustomerName } from "../value-objects/CustomerName.js";
import { CompanyName } from "../value-objects/CompanyName.js";
import { TaxIdentifier } from "../value-objects/TaxIdentifier.js";
import { PhoneNumber } from "../value-objects/PhoneNumber.js";
import { Website } from "../value-objects/Website.js";
import { EmailAddress } from "../value-objects/EmailAddress.js";
import { Address } from "../value-objects/Address.js";
import { CommunicationPreferences } from "../value-objects/CommunicationPreferences.js";
import { Contact } from "../entities/Contact.js";
import { AddressRecord } from "../entities/AddressRecord.js";
import { CustomerNote } from "../entities/CustomerNote.js";
import { Customer } from "../aggregates/Customer.js";
import { CustomerStatus } from "../enums/CustomerStatus.js";
import { AddressType } from "../enums/AddressType.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

import { CustomerNumberGenerator } from "../services/CustomerNumberGenerator.js";
import { CustomerPolicy } from "../services/CustomerPolicy.js";
import { ContactPolicy } from "../services/ContactPolicy.js";

describe("Customer Bounded Context Unit Tests (Tasks 13.2 - 13.5)", () => {
  const orgId = OrganizationId.generate();
  const custName = CustomerName.create("Delta Corp").value;
  const custNumber = CustomerNumber.create("CUST-000001").value;
  const billingAddr = Address.create("123 Main St", "Metropolis", "NY", "USA", "10001").value;
  const primaryContact = {
    id: new UniqueEntityID(),
    name: "John Doe",
    email: EmailAddress.create("john@delta.com").value
  };

  describe("Value Objects", () => {
    it("should validate and format CustomerNumber", () => {
      expect(CustomerNumber.create("cust-0042").isSuccess).toBe(true);
      expect(CustomerNumber.create("CUST-0042").value.value).toBe("CUST-0042");
      expect(CustomerNumber.create("BAD-0042").isFailure).toBe(true);
    });

    it("should normalize email inputs to lowercase", () => {
      const email = EmailAddress.create("  BOB@delta.COM  ").value;
      expect(email.value).toBe("bob@delta.com");
    });

    it("should validate phone numbers structure", () => {
      expect(PhoneNumber.create("+1 (555) 123-4567").isSuccess).toBe(true);
      expect(PhoneNumber.create("short").isFailure).toBe(true);
    });

    it("should validate website URL structures", () => {
      expect(Website.create("https://delta.com").isSuccess).toBe(true);
      expect(Website.create("invalid_url").isFailure).toBe(true);
    });
  });

  describe("Customer Aggregate & Invariant Protections", () => {
    it("should initialize with primary contact and billing address", () => {
      const customerRes = Customer.create(
        CustomerId.generate(),
        orgId,
        custNumber,
        custName,
        primaryContact,
        billingAddr
      );

      expect(customerRes.isSuccess).toBe(true);
      const customer = customerRes.value;

      expect(customer.status).toBe(CustomerStatus.ACTIVE);
      expect(customer.contacts).toHaveLength(1);
      expect(customer.contacts[0].isPrimary).toBe(true);
      expect(customer.addresses).toHaveLength(1);
      expect(customer.addresses[0].type).toBe(AddressType.BILLING);

      expect(customer.domainEvents).toHaveLength(1);
      expect(customer.domainEvents[0].eventName).toBe("CustomerCreated");
    });

    it("should reject duplicate email contacts", () => {
      const customer = Customer.create(
        CustomerId.generate(),
        orgId,
        custNumber,
        custName,
        primaryContact,
        billingAddr
      ).value;

      // Try adding another contact with same email
      const res = customer.addContact(
        new UniqueEntityID(),
        "Jane Doe",
        EmailAddress.create("john@delta.com").value
      );
      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("already exists");
    });

    it("should prevent removing the last billing address", () => {
      const customer = Customer.create(
        CustomerId.generate(),
        orgId,
        custNumber,
        custName,
        primaryContact,
        billingAddr
      ).value;

      const addressId = customer.addresses[0].id;
      const res = customer.removeAddress(addressId);
      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("at least one billing address");
    });

    it("should fail profile mutations when archived", () => {
      const customer = Customer.create(
        CustomerId.generate(),
        orgId,
        custNumber,
        custName,
        primaryContact,
        billingAddr
      ).value;

      customer.archive();
      customer.clearDomainEvents();

      const res = customer.addContact(
        new UniqueEntityID(),
        "Jane Doe",
        EmailAddress.create("jane@delta.com").value
      );
      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("Archived customers cannot be modified");
    });
  });

  describe("Policies and Domain Services", () => {
    it("CustomerNumberGenerator should yield sequential padded codes", () => {
      const generator = new CustomerNumberGenerator();
      const codeRes = generator.generate(42);
      expect(codeRes.isSuccess).toBe(true);
      expect(codeRes.value.value).toBe("CUST-000042");
    });

    it("ContactPolicy should evaluate primary contact status", () => {
      const policy = new ContactPolicy();
      
      const c1 = new Contact(new UniqueEntityID(), {
        name: "Alice",
        email: EmailAddress.create("alice@test.com").value,
        isPrimary: true
      });
      const c2 = new Contact(new UniqueEntityID(), {
        name: "Bob",
        email: EmailAddress.create("bob@test.com").value,
        isPrimary: true
      });

      expect(policy.validateHasPrimaryContact([c1]).isSuccess).toBe(true);
      expect(policy.validateHasPrimaryContact([c1, c2]).isFailure).toBe(true);
    });

    it("CustomerPolicy should enforce unique tax numbers", () => {
      const policy = new CustomerPolicy();
      const customer1 = Customer.create(
        CustomerId.generate(),
        orgId,
        custNumber,
        custName,
        primaryContact,
        billingAddr,
        { taxIdentifier: TaxIdentifier.create("VAT-12345").value }
      ).value;

      const customer2 = Customer.create(
        CustomerId.generate(),
        orgId,
        CustomerNumber.create("CUST-000002").value,
        custName,
        primaryContact,
        billingAddr
      ).value;

      const res = policy.validateUniqueTaxIdentifier(
        TaxIdentifier.create("VAT-12345").value,
        [customer1],
        customer2.id.value
      );
      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("already exists");
    });
  });
});
