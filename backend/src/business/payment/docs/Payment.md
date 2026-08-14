# Payment Bounded Context — Domain Design Guide

This document details the purpose, ubiquitous vocabulary, aggregate invariants, child entities, and domain events for the `payment` business module.

---

## 1. Context Boundaries & Purpose

The **Payment Module** manages the lifecycle of customer payments submitted against invoices.
- **In-Scope**: Payment intents, allocations to one or more invoices, gateway references, attempts logs, and refund requests.
- **Out-of-Scope**: Final blockchain settlement consensus check (Settlement) and receivable calculations (Accounts Receivable).
- **Guiding Rule**: The Payment aggregate owns payment execution, transaction details, and allocation matrices.

---

## 2. Ubiquitous Language

- **Payment**: A financial value transfer transaction submitted toward one or more invoices.
- **Payment Reference**: Business identifier (e.g. `PAY-2027-000084`).
- **Payment Method**: Mechanism used (USDC, USDT, BankTransfer, ACH, Stripe, Card).
- **Transaction Hash**: Blockchain transaction identifier (e.g., Ethereum transaction hash).
- **Payment Intent**: Represents customer intention to pay.
- **Allocation**: The distribution of payment value across invoices.
- **Refund Request**: Request to return confirmed funds.

---

## 3. Aggregate Root and Child Entities

### `Payment` (Aggregate Root)
Serves as the consistency boundary protecting processing attempts, allocations, and refund parameters.

### `PaymentAllocation` (Child Entity)
Represents distribution of value to invoices.
- Fields: `InvoiceId`, `AllocatedAmount`, `Status`.

### `PaymentAttempt` (Child Entity)
Tracks attempts.
- Fields: `Timestamp`, `Status`, `GatewayResponse`, `ErrorCode`.

### `RefundRequest` (Child Entity)
Tracks refunds.
- Fields: `Amount`, `Reason`, `Status`.

---

## 4. Aggregate Invariant Guards

The `Payment` aggregate root enforces the following business rules:
1. **Organization Affiliation**: Payment belongs to exactly one `OrganizationId`.
2. **Invoice Linkages**: Payment must reference at least one `InvoiceId` via allocations.
3. **Positive Value**: Payment amount must be positive.
4. **Currency Match**: Payment currency must match allocated invoice currencies.
5. **Confirmation Lock**: Confirmed payments are immutable.
6. **Cancellation Lock**: Cancelled or failed payments cannot transition to confirmed.
7. **Allocation Limits**: The sum of all allocated amounts cannot exceed the total payment amount.
8. **Refund Limits**: Refund amount cannot exceed the confirmed payment amount.

---

## 5. Domain Event Catalog

- `PaymentCreated`: Payment aggregate initialized.
- `PaymentSubmitted`: Sent to the payment provider.
- `PaymentProcessingStarted`: Gateway acknowledges processing.
- `PaymentConfirmed`: Payment processed successfully.
- `PaymentFailed`: Gateway returns a processing failure.
- `PaymentCancelled`: Cancelled administratively before confirmation.
- `PaymentAllocated`: Funds distributed to invoices.
- `PartialPaymentRecorded`: Confirmed amount is less than invoice grand total.
- `OverpaymentRecorded`: Confirmed amount is more than invoice grand total.
- `RefundRequested`: Request initiated.
