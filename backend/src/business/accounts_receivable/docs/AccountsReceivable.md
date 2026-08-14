# Accounts Receivable Bounded Context

## Purpose
The Accounts Receivable (AR) Bounded Context manages the outstanding financial obligations of customers after invoices have been issued and payment settlements have become final. It tracks receivable entries, payment applications, customer credit balances, and the collection lifecycle.

## Ubiquitous Language

- **Receivable Account**: The customer's financial account from the organization's perspective.
- **Outstanding Balance**: The net amount currently owed by the customer.
- **Customer Credit**: Available credit (from overpayments, manual adjustments, or refunds) that can offset future invoices.
- **Aging**: Classification of unpaid balances by age (e.g. Current, 1-30 Days, 31-60 Days, 61-90 Days, 90+ Days).
- **Payment Application**: Application of settled settlement funds to specific invoice balances.
- **Write-Off**: Releasing the customer's financial obligation due to uncollectibility.
- **Collection Status**: Collection stages (e.g., None, ReminderSent, Escalated, LegalReview, Resolved).

## Responsibilities
- Tracking outstanding invoice obligations per customer.
- Recording payment applications linked to completed settlements.
- Recording and allocating customer credits.
- Computing aging categories and managing collections actions.
- Enforcing write-off approvals.

## Dependencies
- OrganizationId
- CustomerId
- InvoiceId
- SettlementId
- UserId (audit only)
