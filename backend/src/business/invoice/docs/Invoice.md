# Invoice Bounded Context — Domain Design Guide

This document details the purpose, ubiquitous vocabulary, aggregate invariants, child entities, and domain events for the `invoice` business module.

---

## 1. Context Boundaries & Purpose

The **Invoice Module** manages the lifecycle of invoices, representing legal billing documents requesting payment from an Organization to a Customer.
- **In-Scope**: Invoice lines, tax rates, discount rates, currency, totals calculations, issue/due dates, status transitions.
- **Out-of-Scope**: Payment execution (Payment), confirmations (Settlement), and outstanding ledger balance tracking (Accounts Receivable).
- **Guiding Rule**: The Invoice aggregate represents the legal billing document itself, not the payment state.

---

## 2. Ubiquitous Language

- **Invoice**: A legal commercial document requesting payment.
- **Invoice Line**: A billable item containing description, quantity, price, tax rate, and subtotal.
- **Tax**: GST, VAT, or Sales Tax rates applied to lines.
- **Discount**: Fixed amount or percentage discount applied to invoices.
- **Due Date**: The deadline for payment.
- **Draft**: Invoicing state where elements remain fully editable.
- **Issued**: State indicating the invoice is locked, immutable, and sent.

---

## 3. Aggregate Root and Child Entities

### `Invoice` (Aggregate Root)
Serves as the transaction boundary protecting lines, totals recalculations, issue/due dates, and status editing blocks.

### `InvoiceLine` (Child Entity)
Represents a billable line item.
- Fields: `Description`, `Quantity`, `UnitPrice`, `TaxRate`, `Subtotal`.

### `InvoiceNote` (Child Entity)
Internal notes tracking audits.

### `InvoiceAttachment` (Child Entity - Future)
Links supporting files.

---

## 4. Aggregate Invariant Guards

The `Invoice` aggregate root enforces the following business rules:
1. **Organization Affiliation**: Invoice belongs to exactly one `OrganizationId`.
2. **Customer Reference**: Invoice references exactly one `CustomerId`.
3. **Currency Consistency**: All line items, taxes, discounts, and totals must share the same currency. Mismatches will reject additions.
4. **Draft Mutation**: Editing lines, discounts, and taxes is restricted to `DRAFT` status. Once issued, financial values are locked.
5. **No Editing Void/Cancelled Invoices**: Completely locked and immutable.
6. **Due Date Logic**: Due date must be equal to or greater than the issue date.
7. **Recalculations**: Grand totals, subtotals, tax aggregates, and discounts are recomputed on any addition or removal.

---

## 5. Domain Event Catalog

- `InvoiceCreated`: Emitted upon aggregate instantiation.
- `InvoiceIssued`: Draft invoice finalized.
- `InvoiceUpdated`: Modifications applied to Draft.
- `InvoiceVoided`: Invoice voided.
- `InvoiceCancelled`: Invoice cancelled.
- `InvoiceDueDateChanged`: Invoice due date extended.
- `InvoicePartiallyPaid`: Confirming partial payment.
- `InvoicePaid`: Confirming full payment.
- `InvoiceOverpaid`: Confirming surplus payment.
- `InvoiceClosed`: Account closed administratively.
