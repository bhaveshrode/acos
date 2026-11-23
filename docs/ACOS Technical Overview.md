# ACOS — Technical Overview

**Autonomous Commerce OS** is a domain-driven commerce kernel and runtime, validated by a merchant application built on top of it. It provides explicit domain boundaries, transactional consistency, durable event delivery, a double-entry accounts-receivable ledger, and a payment integration that is exercised against a real gateway.

| | |
| :--- | :--- |
| Project period | June 2026 – Present |
| Kernel | Built and validated |
| Merchant application | v1.0 complete |
| Validation product | ACOS Merchant V1 |
| Repository | [github.com/bhaveshrode/acos](https://github.com/bhaveshrode/acos) |
| Last verified | Commit `97d4eb9`, CI run [`45255202800`](https://github.com/bhaveshrode/acos/actions/runs/45255202800), 2026-11-23 |

This document supersedes the earlier ACOS Technical Overview. That version described NomadX as the validation application and a 1,016-test snapshot. NomadX is a separate experiment and is not part of this repository; the validation product is now the merchant application under `products/merchant`, and the current gate runs 498 tests.

---

## 01 Executive Summary

ACOS is organized as a kernel plus at least one consumer product. The kernel owns the business model — nine bounded contexts, DDD primitives, CQRS use cases, domain events and named operations — and exposes them through exactly two entry points. The merchant application owns HTTP, session cookies, caching, persistence adapters, the payment gateway client and operational configuration. The kernel contains no reference to the merchant application.

The defining engineering decision is that the kernel is a **contract size, not a module count**. An earlier iteration measured breadth: eleven declared workspaces, most imported by nothing, plus simulated production-certification layers. The current iteration keeps three npm workspaces (`backend`, `runtime`, `products/merchant`), pins the public surface with a conformance spec, and rejects deep imports and wildcard exports in CI.

Capabilities are validated rather than assumed. Every repository state change that matters financially is written with its outbox event in one PostgreSQL transaction; events are drained after commit and transported over a broker; gateway callbacks are signature-verified and reconciled transactionally; refunds are reserved before the gateway is called. The Razorpay integration has been exercised against test mode for link creation, the paid-link webhook, the refund round trip, and refund-webhook delivery.

### Engineering outcomes

- **Reusable contract surface.** `acos-backend` exports 389 symbols from `.` and 29 from `./application`; a spec pins both sizes, rejects `export *`, rejects aggregate state shapes, and fails if a consumer imports any other path.
- **Financial correctness.** Money is integer minor units with ISO 4217 exponents, persisted as `Decimal(18,4)`; the accounts-receivable ledger records obligations, payments, credits and their applications, and refunds reverse exactly the entries they unwind.
- **Durable event delivery.** The transactional outbox commits with the aggregate, claims batches with leases, retries with exponential backoff, dead-letters after ten attempts, and transports over Redis Streams with per-replica consumer groups.
- **Idempotency as a primitive.** HTTP mutations honour `Idempotency-Key` persisted in PostgreSQL; webhook re-delivery is idempotent; refund submission is a durable reservation protocol with an operator-driven release path for unknown outcomes.
- **Gate and real-world validation.** CI on every push runs 342 kernel tests, 7 runtime tests and 149 merchant tests (498 passing, 5 manual tests skipped). A dispatched workflow has paid and refunded a real ₹1 test-mode link through a public tunnel.

### What changed from the previous overview

| Area | Previous overview | Current state |
| :--- | :--- | :--- |
| Validation application | NomadX (separate product) | ACOS Merchant V1, in this repository |
| Repository shape | Eleven declared workspaces | Three workspaces: kernel, runtime, merchant |
| Public surface | Broad workspace exports | Two pinned entry points (389 + 29 symbols) |
| Money | Float risk not addressed | Integer minor units, ISO 4217 exponents, `Decimal(18,4)` |
| Event transport | In-process / outbox only | Outbox plus Redis Streams, per-replica groups |
| Test snapshot | 943 kernel + 73 merchant = 1,016 | 342 kernel + 7 runtime + 149 merchant = 498 in the gate |
| Razorpay | Stubbed link creation only | Link creation, paid webhook, refund round trip and refund-webhook delivery executed against test mode |

---

## 02 Architectural Principles

- **Domain-Driven Design.** Aggregates guard invariants, value objects are immutable, and bounded contexts are explicit package boundaries rather than folders of helpers.
- **CQRS with a mediator.** Commands and queries enter through the application layer; controllers and other consumers do not build aggregates by hand. The kernel exposes named operations for state transitions so a consumer never calls a mutating aggregate method directly.
- **Hexagonal architecture.** The kernel depends on ports (`IPaymentGateway`, `IPasswordHasher`, `IEventBus`, repositories, `ILogger`); infrastructure supplies adapters. Persistence and messaging adapters live with the consumer, not in the kernel.
- **Transactional consistency.** A command writes its aggregate and its outbox events inside one transaction. Draining happens only after commit. Multi-aggregate payment work — confirmation, allocation, receivable posting, refund reversal — commits or rolls back as one unit, with gateway calls kept outside the transaction.
- **Durable events.** Domain events are data, not callbacks. Serialization, hydration, versioning and replay behaviour are treated as part of the contract.
- **Idempotency.** Retries are normal. Duplicate HTTP requests, duplicate webhook deliveries and duplicate refund settlements must not produce duplicate business effects.
- **Deterministic time.** Domain code obtains time through `Clock`, never `new Date()`, so tests can freeze or advance it.
- **Fail-closed composition.** A boundary started without a database refuses to start unless the caller explicitly opts into in-memory repositories; a boundary started without a broker refuses to start unless the caller explicitly opts into the in-process bus.

---

## 03 System Architecture

```
                       Merchant HTTP application (Express)
                       controllers · cookies · idempotency · caches
                                      │
                                      ▼
                       AcosIntegrationBoundary
                       tenancy · transactions · DTOs · refund protocol
                       ┌──────────────┼──────────────────┐
                       ▼              ▼                  ▼
                ACOS kernel      Outbox (same       Payment providers
                Mediator         commit)            sandbox | Razorpay
                aggregates              │                  │
                22 operations           ▼                  ▼
                       │          Redis Streams      Razorpay REST API
                       ▼          acos.events         (Payment Links,
                Prisma adapters         │              refunds, webhooks)
                PostgreSQL              ▼
                       ▲          per-replica consumers
                       └────────── cache invalidation
```

*A rendered version of this architecture is available as [PNG](media/ACOS-v1.0-architecture.png), with the [SVG source](media/ACOS-v1.0-architecture.svg).*

### Workspace map

| Workspace | Responsibility |
| :--- | :--- |
| `backend` (`acos-backend`) | Foundation primitives, nine business contexts, CQRS application layer, kernel entry points, Prisma schema and migrations. No infrastructure adapters. |
| `runtime` (`acos-runtime`) | Subsystem registry, dependency graph, composition validation, boot order, lifecycle, readiness/drain, health, telemetry, metrics, execution boundary, environment profiles, and the `ACOSRuntime` facade. |
| `products/merchant` (`acos-merchant`) | Express API, session cookies, controllers, integration boundary, Prisma repositories, outbox transport, Redis Streams bus, sandbox and Razorpay providers, cache invalidation consumers. |

### Source inventory

| Area | Size | Notes |
| :--- | :--- | :--- |
| `backend/src/foundation` | 84 files | DDD primitives, contracts, events, logging, result, validation, configuration |
| `backend/src/business` | 338 files, 9 contexts | Accounts receivable, customer, identity, invoice, notification, organization, payment, settlement, workflow; 93 domain event types |
| `backend/src/application` | 48 files | Commands, queries, handlers, mappers, mediator |
| `backend/src/kernel` | 2 entry files + spec | Public surface: 389 exports at `.`, 29 at `./application` |
| `runtime` | 8 areas | Composition and operating concerns, not business logic |
| `products/merchant/src` | 74 files | Product application and adapters |
| `backend/prisma` | 17 models, 7 migrations | Relational source of truth |

The application entry point currently exposes use cases for identity, organization, customer, invoice, payment and accounts receivable. Notification, settlement and workflow are domain-complete and tested inside the kernel, but are not yet wired into the merchant product or the application entry point.

### Runtime paths

- **Write path.** Controller → boundary → mediator/handler → aggregate operation → repository save and outbox insert in one PostgreSQL transaction → commit → outbox drain.
- **Read path.** Controller → boundary → repository or query handler → DTO. The merchant caches invoice summaries and dashboard aggregates in memory; event consumers invalidate them.
- **Event path.** Committed outbox row → local subscribers, then Redis stream append → each replica's consumer group → local handlers (cache invalidation). The outbox row is marked processed only after both the local dispatch and the broker append succeed.
- **Gateway path.** Boundary creates a Payment Link or refund through the provider adapter; callbacks enter through `/payments/webhook`, are signature-verified over the raw body, and are reconciled inside a transaction.

---

## 04 Core Engineering Stack

| Layer / concern | Technology / pattern |
| :--- | :--- |
| Language | TypeScript (ES modules) |
| Runtime / API | Node.js 18+ (CI runs Node 20) + Express 5 |
| Persistence | PostgreSQL 14+ (CI runs 15) + Prisma Client 7.9 |
| Broker | Redis 7 Streams (optional at runtime, required for cross-replica delivery) |
| Architecture | DDD + CQRS + Mediator + Hexagonal + event-driven integration |
| Consistency | Aggregate + outbox in one transaction; lease-based drains |
| Reliability | Idempotency keys, webhook replay safety, outbox retries/dead-letter, refund reservations, row locks |
| Security | bcrypt (10 rounds), HttpOnly session cookie, HMAC-SHA256 raw-body signatures, tenant scoping |
| Payment gateway | Razorpay REST over HTTPS, no SDK dependency; sandbox simulator by default |
| Testing | Vitest, PostgreSQL and Redis service containers, manual-dispatch gateway E2E |

---

## 05 Reliability and Distributed Workflow Design

### Transactional outbox

Command handlers save the aggregate first, then enqueue its domain events through `OutboxEventBus`, which inserts each event using the caller's transaction client. The aggregate write and the event rows therefore commit together. The boundary drains unprocessed rows only after commit, never mid-transaction.

A drain first claims its batch: a guarded `updateMany` stamps `lockedBy` and `lockedUntil` on rows whose lease has expired or was never taken, so two processes sharing a database split the batch instead of publishing the same event twice. A process that dies mid-publish frees its rows when the lease expires.

A publish failure increments `retryCount`, stores `lastError`, and schedules the next attempt with exponential backoff — 1 second doubling to a 5-minute cap. The boundary arms a one-shot drain at the earliest due time, so retries do not depend on unrelated traffic. After 10 failed attempts the row is dead-lettered and excluded from further drains.

### Broker transport

With `MERCHANT_BROKER_URL` set, `publish` dispatches to local subscribers first and then appends to the `acos.events` stream, preserving read-your-writes behaviour for the process that committed the change. Each replica consumes under its own group (`acos:merchant:<MERCHANT_REPLICA_ID>`), skips messages it originated, and acknowledges a message only after its local handlers succeed.

A failed handler leaves the entry pending; `XAUTOCLAIM` redelivers it after 30 seconds. Ten failures within a replica's own counter move the entry to `acos.events.dead`. If a consumer group disappears, the read loop rebuilds it at the start of the retained stream so delivery resumes instead of retrying `NOGROUP` indefinitely; entries already handled are suppressed by `eventId`. Republished outbox rows are suppressed per replica by `eventId` for 24 hours. The stream is capped near 100,000 entries.

### Idempotency and replay safety

- HTTP `POST`, `PUT` and `PATCH` requests carrying `Idempotency-Key` read and write a persisted `IdempotencyRecord`; a repeated key returns the stored response instead of re-running the command. Responses with status `>= 500` are not stored.
- A payment callback re-delivered after confirmation is acknowledged in every confirmed-once state (`CONFIRMED`, `REFUND_REQUESTED`, `REFUNDED`) before the gateway is asked to confirm again. The locked re-check inside the transaction keeps a concurrent duplicate idempotent.
- A re-delivered `refund.processed` for a terminal refund is acknowledged without a second ledger reversal.
- Razorpay webhook signatures carry no timestamp, so replay protection for that provider rests on payment- and refund-level idempotency. The sandbox provider uses a Stripe-format `t`/`v1` signature and additionally rejects timestamp drift greater than five minutes.

### Payment confirmation

A webhook resolves its payment from the persisted `gatewayReference`, not from process memory. With Razorpay, confirmation always re-reads the payment from the gateway before confirming, so a callback cannot confirm money the gateway has not captured. Confirmation, allocation to invoices, receivable posting and the resulting events commit in one transaction.

### Refund reservation protocol

Every refund is committed as a durable reservation before the gateway is called:

1. The request commits as `REQUESTED`.
2. Immediately before the gateway call, it flips to `APPROVED` in its own committed transaction. A crash therefore leaves either a reservation that provably never reached the gateway (`REQUESTED`) or one that may have (`APPROVED`).
3. A definitive 4xx or `failed` response rejects the request (`REJECTED`) and returns its amount to the cap. Transport errors, 5xx responses, unparseable bodies and success responses without a refund id become an unknown outcome: the reservation stays pending and the payment reports `REFUND_REQUESTED`.
4. A stale-reservation sweep runs at startup and every five minutes. `REQUESTED` rows older than 15 minutes are released; stale `APPROVED` rows are logged for reconciliation because the gateway may hold them. Only rows stamped with `submissionProtocol = 1` are swept.
5. If the process stopped between the submission marker and the HTTP call, the reservation is never released automatically. An operator confirms against the gateway that no refund exists, then calls `releaseUnsubmittedRefundReservation`, which rejects the row under the payment lock.

The submission marker, the sweep, the synchronous refund response and the refund webhook all take the same payment row lock, so each status re-check under the lock is authoritative and the ledger reversal runs exactly once.

### Concurrency control

Every money movement on a customer's ledger — payment reconciliation, credit application, refund reversal — takes a `FOR UPDATE` lock on the `Customer` row inside its transaction, after any payment row lock and always in that order, and reloads the receivable account under the lock. Overlapping operations serialize instead of both passing the same balance check and losing one write.

### Cache invalidation

The merchant caches invoice summaries and dashboard aggregates. Consumers subscribe to `InvoicePaid`, `InvoicePartiallyPaid`, `InvoiceOverpaid`, `InvoiceRefunded` and `InvoiceUpdated`; each clears the affected invoice and the dashboard. `InvoiceUpdated` exists specifically because a status re-derived from the receivable ledger must not be served from a stale cached copy.

### Fail-closed startup

A boundary started without a database URL aborts unless the caller passes `allowInMemory`. A boundary started without a broker URL aborts unless the caller passes `allowInProcessBus`; with that flag, durability still comes from PostgreSQL, but no other replica sees the events.

---

## 06 Accounts Receivable and Financial Correctness

Accounts receivable is the strongest demonstration of the kernel's domain approach. Financial state is modelled as ledger records, not as mutable totals on an invoice.

- **Money.** `Money` stores integer minor units and the currency's ISO 4217 exponent. Construction converts a decimal amount with round-half-away-from-zero and rejects values outside the safe-integer range. Prisma stores monetary columns as `Decimal(18,4)`; a database spec proves that three payments of `0.10` round-trip as exactly `0.3`.
- **Ledger.** `ReceivableAccount` owns entries, credits, payment applications and collection actions. Obligations are registered per invoice, payments are applied against outstanding balances, and overpayment becomes customer credit attributed to the payment (`settlementId`) and invoice (`invoiceId`) that produced it.
- **Credit.** A customer's credit can be applied to another outstanding invoice of the same customer, in the invoice's currency, oldest credit first, capped by the invoice's remaining balance and the available credit. A credit-funded application is recorded against the payment that left the credit, so a later refund can recall it.
- **Refund reversal.** A refund returns the payment's own unapplied credit before reversing any obligation. Credit-funded applications are recalled first (then newest), and the invoice the payment settled directly stays paid while the recalled credit covers the refund. A larger refund also reverses that direct allocation and re-opens the invoice.
- **Derived status.** An invoice's paid amount is derived from the larger of its confirmed payment allocations (which carry overpayment that spilled into credit) and its receivable entry (which nets customer credit applied to the invoice). An invoice half-settled by credit and then paid by card therefore reaches `PAID`, not `PARTIALLY_PAID`.
- **Lock ordering.** Ledger reads and writes use a checked-out transaction client, take the payment row lock before the customer row lock, and reload balances under the lock.

### Invoice lifecycle

The domain status enum is `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERPAID`, `VOID`, `CANCELLED`, `CLOSED`. Delivery is not a domain status: `markSent` records `sentAt` once, and the integration boundary reports `SENT` when an issued invoice has been delivered. The product-facing sequence is:

```
DRAFT ──► ISSUED ──► SENT ──► PARTIALLY_PAID / PAID / OVERPAID
                                  │
                                  └── refund ──► SENT (outstanding again)
```

Issued invoices are immutable. Payment requests and credit applications are accepted only for `SENT` invoices awaiting payment. A refund re-opens the receivable and returns the invoice to `SENT` while the repayment obligation remains.

---

## 07 Multi-Tenancy, Security and Public Surfaces

### Authentication and tenant isolation

- Passwords are hashed with `bcryptjs` at 10 salt rounds through the `IPasswordHasher` port.
- Successful signup and login issue a session token delivered as an `HttpOnly`, `SameSite=Lax`, path `/` `session_token` cookie; logout clears it. Sessions and login attempts are persisted as `UserSession` and `LoginAttempt` rows.
- Every business operation resolves the caller's active business from the session and scopes reads and writes to it. Customer, invoice, payment, dashboard and credit-balance lookups cross-check ownership; a foreign identifier does not grant access.

### Webhook security

- **Razorpay.** `X-Razorpay-Signature` is the lowercase hex HMAC-SHA256 of the exact request body bytes. Verification recomputes it and compares with `crypto.timingSafeEqual`. A missing or invalid signature returns 401. Only `payment_link.paid` is a terminal payment event; `refund.processed` and `refund.failed` settle or reject the refund request named in the gateway's echoed notes; every other event is acknowledged without touching the ledger.
- **Sandbox.** The simulator uses a Stripe-format `t`/`v1` header; verification covers the timestamp plus body, compares in constant time, and rejects drift beyond 300 seconds.

### HTTP surface (25 routes)

| Area | Routes |
| :--- | :--- |
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Business | `POST /business/onboarding`, `GET /business`, `GET /business/dashboard` |
| Customers | `POST /business/customers`, `GET /business/customers`, `GET /business/customers/{id}`, `GET /business/customers/{id}/credit-balance` |
| Invoices | `POST /business/invoices`, `GET /business/invoices`, `GET /business/invoices/{id}`, `POST /business/invoices/{id}/issue`, `POST /business/invoices/{id}/send` |
| Payments | `POST /business/invoices/{id}/collect-payment`, `POST /business/invoices/{id}/apply-credit`, `POST /business/payments/{id}/refund`, `GET /business/payments/{id}`, `GET /business/payments`, `POST /payments/webhook` |
| System | `GET /health`, `GET /acos-status`, `POST /simulate-error` |

`/payments/webhook` is reachable without a session but requires a valid provider signature. `/simulate-error` is a failure-injection endpoint used by the degradation suite.

Every request receives or propagates an `X-Correlation-ID`, which is attached to log lines for that request's asynchronous scope.

### Kernel surface

The package declares exactly two entry points, `.` and `./application`, plus `./package.json`. The conformance spec in [`surface.spec.ts`](../backend/src/kernel/surface.spec.ts) enforces that:

- neither entry file uses `export *`;
- the sizes stay pinned at 389 and 29 exported names;
- no `*Props` state shape or duplicate name is exported;
- every consumer imports only a declared entry point;
- consumers do not reach backend sources through relative paths.

The surface includes the foundation, the domain model, 22 named operations (invoice issue/send/record payment/record refund, payment submit/process/confirm/fail, refund request/approve/complete/reject, receivable open/register/apply/refund/credit, identity verify/terminate) and the contracts an adapter implements.

---

## 08 Razorpay Integration and Executed Evidence

The adapter uses Razorpay's REST API directly. With `PAYMENT_PROVIDER=razorpay`:

- `createPaymentRequest` creates a Payment Link for the invoice amount converted to paise, stores the link id as the payment's gateway reference, and returns the hosted `paymentUrl`.
- Collection is INR-only until international payments are enabled on the account.
- Link creation failure terminal-fails the already-persisted payment (`GATEWAY_INITIATION_FAILED`) before the error returns.
- `payment_link.paid` is verified over the raw body, then the payment is re-read from Razorpay before confirmation.
- Refunds post to the singular `POST /v1/payments/{pay_id}/refund` with the internal payment id and refund request id in `notes`. A refund reported as `processed` settles inline; any other status leaves the request `APPROVED` for the webhook.
- The collecting gateway is persisted on the payment (`RAZORPAY`, or the simulator's `STRIPE`), so payment history reports who actually took the money.

### Verification matrix

| Path | Status | Evidence |
| :--- | :--- | :--- |
| Test-mode credentials, request schema, paise conversion, link creation | Verified | Manual smoke dispatch, 2026-11-13 |
| `payment_link.paid` delivery → signature accepted → `CONFIRMED` → invoice `PAID` → receivable settled | Verified | Manual E2E, 2026-11-13 and three dispatches on 2026-11-23 |
| Refund creation through the singular route | Verified | Run `45239007777` |
| Inline settlement of a `processed` refund → payment `REFUNDED`, invoice `SENT`, receivable reopened, `InvoiceRefunded` processed | Verified | Run `45239007777` |
| `refund.processed` delivery through a public tunnel, signature verification, idempotent duplicate acknowledgement | Verified | Run `45252744468` |
| Settlement of an asynchronous refund by the webhook | Not observed | This account returns refunds `processed` synchronously; the `pending` state is account-level |
| `refund.failed` rejection path | Implemented, stubbed-gateway tested | No live failed refund has been produced |

The refund round trip on 2026-11-23 followed the create-refund response: the gateway listed the refund under the echoed `notes.refundRequestId`, and the run asserted `REFUNDED`, the invoice back to `SENT`, the receivable reopened and `InvoiceRefunded` processed. The later run held its process open past the inline settlement and observed the signed `refund.processed` event arrive and be acknowledged as a duplicate.

These gateway checks are operator-driven and live outside the CI gate because they need a human at the hosted payment page and a publicly reachable webhook endpoint. The dispatched workflow exposes the backend through a cloudflared quick tunnel, publishes the webhook URL and pay link to the job summary, runs the create and wait phases as separate processes, and allows 40 minutes.

---

## 09 Testing and Validation

The gate is two GitHub Actions jobs on every push to `main` and every pull request that touches `backend`, `runtime`, `products/merchant` or the workflow itself. The latest main run, [`45255202800`](https://github.com/bhaveshrode/acos/actions/runs/45255202800), passed both jobs.

| Job | Step | Result |
| :--- | :--- | :--- |
| Kernel Build & Test | Build kernel | Passed |
| | Kernel spec suites | 342 / 342 in 28 files |
| | Runtime spec suite | 7 / 7 in 1 file |
| | Full backend typecheck | Passed |
| Build & Test Validation Gate | Prisma generate + migrate | Passed |
| | Migration drift check | Migrations match `schema.prisma` |
| | Build merchant | Passed |
| | Merchant spec suites | 149 passed, 5 skipped (154) |

That is **498 passing tests in the gate**, plus 5 opt-in tests that stay skipped: 3 live-smoke tests and 2 inbound E2E tests.

### Merchant suite composition

| Category | Tests | Environment |
| :--- | :--- | :--- |
| Integration | 81 | Real Express server on loopback + PostgreSQL |
| Golden E2E flow | 1 | Signup → onboarding → customer → invoice → payment → reconciliation |
| Failure | 11 | Invalid signatures, degradation and connection loss |
| Database | 18 | PostgreSQL, skipped when unreachable |
| Restart and recovery | 1 | Two application lifecycles over PostgreSQL |
| Broker | 8 | Real Redis stream, skipped when unreachable |
| Payment provider | 29 | Razorpay adapter against a stubbed gateway client |
| Live smoke (manual) | 3 | Real API link creation, skipped in the gate |
| Inbound E2E (manual) | 2 | Real paid link + refund + webhook, skipped in the gate |

Spec files run one at a time (`fileParallelism: false`). The PostgreSQL suites share one database and one outbox table, and parallel workers could claim each other's event rows and deliver them to the wrong in-process bus, losing cache invalidations nondeterministically.

### What each layer proves

- **Kernel tests** prove invariants, DDD mechanics, money arithmetic, lifecycle transitions, event contracts and surface conformance without a database.
- **Runtime tests** prove composition validation, boot order and lifecycle behaviour against the real runtime.
- **Merchant integration and database tests** prove cross-context behaviour over PostgreSQL, including refunds, credits, row-lock serialization, idempotency and tenant boundaries.
- **Broker tests** prove cross-replica delivery, dedupe, retry, reclaim and dead-lettering against a real Redis stream.
- **Provider tests** prove gateway mapping and failure handling against a stubbed client; they are not evidence about Razorpay itself.
- **Manual gateway jobs** are the only evidence about Razorpay's actual behaviour, and they are recorded with dates and run ids rather than folded into the gate.

---

## 10 Key Engineering Lessons

1. **A kernel is a contract size, not a module count.** Declaring many workspaces produced breadth without reuse. Pinning two entry points and enforcing them in CI made the boundary real.
2. **Financial invariants belong in types and storage.** Minor-unit integers, ISO 4217 exponents and `Decimal(18,4)` columns remove a class of rounding and serialization errors that application checks cannot.
3. **Events need durable ownership.** Committing the outbox row with the aggregate, leasing the drain, transporting over a stream and invalidating caches in a consumer keeps state and projections consistent across processes.
4. **Gateway calls need reservations, not just retries.** A request that may have reached the gateway is not a failure. Marking submission before the call, sweeping only provably unsubmitted reservations, and requiring an operator for unknown outcomes prevents double-spending a refund cap.
5. **Evidence must name the executed path.** A stubbed client proves mapping; it does not prove a gateway. The overview separates implemented-and-tested paths from paths executed against the real service, and it records the one refund path still unobserved.

---

## 11 Current Position and Next Direction

The kernel and merchant V1 architecture are frozen as documented in [`Merchant V1 Architecture Freeze.md`](../products/merchant/docs/Merchant%20V1%20Architecture%20Freeze.md). The code backlog is closed: surface consolidation, money correctness, outbox durability, broker transport, the Razorpay paid/refund round trips, test hardening and documentation drift have all been merged and verified on `main`.

One item remains open and is external to the codebase: **settlement of a refund by the `refund.processed` webhook**. This Razorpay account returns refunds `processed` synchronously, and the `pending` refund state is enabled per account by Razorpay support (default only for merchants onboarded on or after 28 April 2026). The code path is implemented and tested against the stubbed gateway; when a pending-capable account is available, dispatching the E2E workflow and waiting for `Refund webhook observed: settled the refund` closes it without a code change.

The next decision is product direction, not platform construction. ACOS now needs one corridor, one buyer segment and one workflow validated with real finance and operations conversations before more kernel breadth is added. Any new capability should arrive as another narrow, CI-verified slice.

---

## 12 Project Snapshot

| | |
| :--- | :--- |
| Project | Autonomous Commerce OS (ACOS) |
| Role | Architecture, backend engineering, domain modeling, integration and validation |
| Language | TypeScript |
| API | Node.js + Express 5 |
| Database | PostgreSQL + Prisma |
| Broker | Redis Streams |
| Architecture | DDD / CQRS / Mediator / Hexagonal / event-driven |
| Reliability | Transactional outbox / idempotency / replay safety / refund reservations / recovery |
| Financial domain | Accounts receivable / ledger / allocation / credit / reconciliation / multi-currency money |
| Payment gateway | Razorpay Payment Links and refunds; sandbox simulator by default |
| Validation | 498 tests in CI + operator-driven Razorpay test-mode E2E |
| Validation product | ACOS Merchant V1 |
| Repository | [github.com/bhaveshrode/acos](https://github.com/bhaveshrode/acos) |
| Timeline | June 2026 – Present |

---

This overview concentrates on architecture and verified behaviour rather than listing every module. The source repository, the [kernel conformance spec](../backend/src/kernel/surface.spec.ts), the [integration boundary](../products/merchant/src/integration/AcosIntegrationBoundary.ts), the [Prisma schema](../backend/prisma/schema.prisma) and the [CI workflow](../.github/workflows/ci.yml) remain the authoritative technical reference.