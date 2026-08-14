# Customer Bounded Context — Domain Design Guide

This document details the purpose, ubiquitous vocabulary, aggregate invariants, child entities, and domain events for the `customer` business module.

---

## 1. Context Boundaries & Purpose

The **Customer Module** manages the profiles and business relationships of customers (recipients of invoices, reminders, and payment links) belonging to an organization.
- **In-Scope**: Customer lifecycle, contacts directory, billing/shipping addresses, tax profiles, notes, communication preferences.
- **Out-of-Scope**: User authentication (Identity), organization details (Organization), invoices calculations (Invoice), money settlement (Payment).
- **Dependency Flow**: The Customer module references organizations strictly by their `OrganizationId`. There are no dependencies on authentication or financial accounts, ensuring loose coupling.

---

## 2. Ubiquitous Language

- **Customer**: A person or company that does business with an Organization.
- **Contact**: A person representing the customer (e.g. Accounts Payable clerk).
- **Billing Address**: The official invoicing address of the customer.
- **Tax Profile**: Abstraction representing Tax Identifier numbers (e.g. GST, VAT, TIN).
- **Customer Number**: A unique, human-friendly code identifying a customer within an organization (e.g. `CUST-10042`).
- **Communication Preference**: Preferred notification channel (e.g. email, SMS, portal).

---

## 3. Aggregate Root and Child Entities

### `Customer` (Aggregate Root)
Serves as the transaction boundary protecting contact listings, tax identifiers, and addresses.

### `Contact` (Child Entity)
Represents a customer contact person.
- Fields: `Name`, `Email`, `Phone`, `Designation`, `IsPrimary`.

### `AddressRecord` (Child Entity)
Represents an address details item.
- Fields: `Address` (Value Object), `AddressType`.

### `CustomerNote` (Child Entity)
Represents internal audit notes about this customer (never visible to the customer).

---

## 4. Aggregate Invariant Guards

The `Customer` aggregate root enforces the following business rules:
1. **Organization Belonging**: Every customer belongs to exactly one `OrganizationId`.
2. **Customer Number Uniqueness**: Customer number is unique within an Organization.
3. **Exactly One Primary Contact**: A customer must always have exactly one contact marked as primary.
4. **At Least One Billing Address**: A customer must always have at least one billing address registered.
5. **Contact Uniqueness**: Contacts with duplicate emails are rejected.
6. **Modification Protection**: Suspended or Archived customers cannot have their profiles or contact lists mutated.
7. **Tax Identifier Uniqueness**: Tax identifier is unique within an Organization (checked via Repository/Domain Service).

---

## 5. Domain Event Catalog

- `CustomerCreated`: Emitted upon aggregate instantiation.
- `CustomerActivated`: Emitted when account leaves pending state.
- `CustomerArchived`: Account archived and future invoices are blocked.
- `CustomerDeleted`: Account marked for cascading resources archiving.
- `CustomerBlocked`: Account suspended due to payment or administrative reasons.
- `ContactAdded`: A new contact record is registered.
- `PrimaryContactChanged`: The primary contact flag is swapped to another contact.
- `BillingAddressChanged`: The billing address is replaced or updated.
- `TaxInformationUpdated`: Tax IDs (VAT/GST/TIN) updated.
- `CommunicationPreferencesChanged`: Notifications preferences updated.
