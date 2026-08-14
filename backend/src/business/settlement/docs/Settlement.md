# Settlement Bounded Context

## Purpose
The Settlement Bounded Context manages the lifecycle of financial finality after a payment is processed. It tracks block confirmations, bank clearings, treasury receipts, and provides finality guarantees to other downstream modules (e.g. Accounts Receivable).

## Ubiquitous Language

- **Settlement**: The business confirmation that a payment is financially final and funds are safely received.
- **Settlement Reference**: A unique business identifier following the format `SET-YYYY-NNNNNN`.
- **Finality**: The point at which funds are considered irreversible according to business and/or protocol policies.
- **Confirmation**: Evidence supporting settlement, such as blockchain block confirmations, bank clearing, or gateway confirmation.
- **Treasury Receipt**: Internal acknowledgement that funds have successfully reached the treasury wallet or account.
- **Confirmation Threshold**: The minimum confirmations required before declaring settlement finality (e.g., 12 confirmations on Ethereum).
- **Settlement Failure**: Settlement could not be finalized (e.g., chain reorganization, gateway rollback).
- **Settlement Reversal**: Settlement is rolled back after prior confirmation (e.g., administrative override, protocol rollback).

## Responsibilities
- Verifying block/bank/gateway confirmations.
- Logging treasury receipts matching the expected settlement amount.
- Declaring finality and completing the settlement.
- Handling failures, cancellations, and reversals.

## Out of Scope
- Invoice pricing and line items.
- Creating payments.
- Customer management.
- Computing invoice/receivables outstanding balances.
