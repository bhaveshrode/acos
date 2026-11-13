# Merchant V1 Architecture Freeze

This document freezes the technical architecture of the **ACOS Merchant V1** product as built and verified through Phases 1–11. It establishes a canonical baseline of product boundaries, module responsibilities, security rules, persistence models, event mechanisms, and validationgates.

---

## 1. Product Boundary
The repository decouples the core ACOS OS kernel from external consumer product applications:

```
ACOS/
├── backend/            # ACOS OS Core Subsystems & Domain Layer
├── frontend/           # ACOS OS Core Admin UI Subsystem
└── products/
    └── merchant/       # Decoupled Merchant-Facing Client Application
        ├── src/        # Product Controller & Integration Boundary
        └── tests/      # Multi-Layered Validation Suites
```
* **ACOS core** contains no reference to the merchant module, treating it strictly as a client.
* **Merchant application** depends on ACOS abstractions exclusively through the integration boundary interface.

---

## 2. Module Responsibilities

### Merchant Product Application
Owns all customer-facing presentation, session state, cache management, and UI controller flows:
* **HTTP REST App Listener**: Real Express.js runtime listening on local network interface.
* **Session Presentation**: Issuing and checking `session_token` HTTP cookies.
* **Caching Layer**: In-memory caching for invoices and dashboard metrics.
* **Request Correlation**: Propagating context correlation tracing headers (`X-Correlation-ID`) across asynchronous execution scopes.

### ACOS Core Subsystems
Owns all business-domain logic, state engines, structural validations, and transactional mutations:
* **Identity Subsystem**: Validates and stores credentials, maps user permissions.
* **Organization Subsystem**: Establishes merchant corporate and financial tenant boundaries.
* **Invoice Subsystem**: Manages invoice lifecycles (DRAFT -> ISSUED -> SENT -> PAID).
* **Payment Subsystem**: Processes payment collection requests and sandbox confirmations.
* **Accounts Receivable**: Maintains double-entry allocations and ledger records.
* **Reconciliation Engine**: Matches and verifies confirmed payments to open invoice obligations.

---

## 3. ACOS Integration Boundary
The integration boundary isolates Merchant logic from domain-level complexities inside the ACOS runtime. All communications pass through [AcosIntegrationBoundary.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/integration/AcosIntegrationBoundary.ts):

```
Merchant Controller
       │
       ▼
AcosIntegrationBoundary ───► Runtime Mediator ───► Domain Handlers
       │
       ▼
Prisma Database Context / Persistence
```

---

## 4. Data Ownership
* **ACOS is the Source of Truth**: The domain repositories inside ACOS are authoritative for all states (e.g. invoice financial state, payment confirmation status, and accounts receivable balances).
* **Merchant is the Presentation Layer**: Merchant never updates invoice or payment states directly. It calls boundary command controllers, intercepts domain events, invalidates local cache structures, and refreshes the presentation dashboard context.

---

## 5. Commerce Flow
The canonical business lifecycle for Merchant V1 is structured as follows:

```
Sign Up ──► Login ──► Onboard Business ──► Create Customer ──► Create Invoice
                                                                    │
   Dashboard ◄── Invalidate Cache ◄── Consume Event ◄── Outbox ◄── SENT (Issue & Send)
```
* Payments are reconciled asynchronously upon receiving provider webhooks.
* Successful reconciliations trigger `InvoicePaid` domain events, invalidating cache registries and updating dashboards in real-time.

---

## 6. Persistence Architecture
The persistence layer supports two execution contexts:
1. **Mock Context (Opt-In Development Fallback)**: In-memory repository registries mapping data to local collections for rapid testing. Selected only when the caller passes `allowInMemory`; a boundary started without a database URL otherwise refuses to start.
2. **Persistent Context (Production Mode)**: Relational tables mapped to PostgreSQL using Prisma Client. Repositories utilize transaction boundaries (`$transaction`) to enforce financial ledger consistency. The accounts receivable ledger (`ReceivableAccount` with its entry, credit, application and collection-action rows) lives here too, so balances survive a restart. The business profile (`BusinessProfile`, with the owning user on the `Organization` row) is stored here as well, so onboarding metadata and tenant ownership resolve through a fresh process instead of an in-memory registry.

---

## 7. Event & Outbox Architecture
To guarantee at-least-once domain event delivery and avoid dual-write consistency issues:
1. Command handlers save the aggregate, then publish its domain events. `OutboxEventBus` inserts each event into the `OutboxEvent` table using the caller's transaction client, so the aggregate write and the event row commit together.
2. The boundary wraps invoice creation, issuing and sending, payment submission, and payment-webhook reconciliation in a PostgreSQL transaction via `TransactionScope`. Multi-aggregate work — confirming a payment, reconciling its allocations onto invoices and the receivable ledger, and enqueuing the resulting events — commits or rolls back as one unit, and gateway calls stay outside the transaction. A webhook resolves its payment from the `gatewayReference` stored on the payment row, so a callback that arrives after a restart confirms the same payment instead of depending on process-memory state. `processOutboxAsynchronously` drains unprocessed rows after commit — never mid-transaction — publishing each event to the configured Event Bus transport and marking it processed. A drain first claims its batch: a guarded `updateMany` stamps `lockedBy` and `lockedUntil` on rows whose lease has expired or was never taken, so two processes sharing the database split the batch instead of publishing the same event twice, and a process that dies mid-publish frees its rows when the lease runs out. A publish failure increments `retryCount`, stores `lastError`, and schedules the next attempt after an exponential backoff (1s doubling to a 5-minute cap), with the boundary arming a one-shot drain at the earliest due time so retries do not depend on unrelated traffic. After 10 failed attempts the row is dead-lettered (`deadLetteredAt`) and excluded from further drains instead of retrying forever.
3. The payment lifecycle is enqueued the same way: `PaymentSubmitted` and `PaymentProcessingStarted` when a request is collected, `PaymentAllocated` and `PaymentConfirmed` when the webhook confirms, and `PaymentFailed` when it declines — each inside the transaction that writes the payment row.
4. With `MERCHANT_BROKER_URL` set, the transport is a Redis stream. `publish` dispatches to local subscribers first and only then appends the event to `acos.events`, so the writing process keeps the synchronous read-your-writes behavior it had on the in-process bus. Each replica consumes under its own group (`acos:merchant:<MERCHANT_REPLICA_ID>`), skips messages it originated, and acknowledges a message only after its local handlers succeed. A failed handler leaves the entry in the group's pending list, where `XAUTOCLAIM` redelivers it after 30 seconds; ten failures within that replica's own retry counter move it to `acos.events.dead`. Republished outbox rows are suppressed per replica by `eventId` for 24 hours, and the stream is capped near 100,000 entries. The outbox row is marked processed only after both the local dispatch and the broker append succeed. Without `MERCHANT_BROKER_URL` the boundary refuses to start unless the caller explicitly passes `allowInProcessBus`, so reachability loss fails loudly at startup rather than silently isolating a replica.

---

## 8. Authentication & Security
* **Session Verification**: Secure cookies named `session_token` with `HttpOnly`, `SameSite=Lax`, and path `/` parameters.
* **Credentials Security**: Asynchronous password hashing using `bcryptjs` (10 salt rounds) instead of PBKDF2.
* **Tenant Isolation**: Ensures users can only access entities (customers, invoices, payments, dashboards) belonging to their active business context.
* **Webhook Signature Verification**: Standard cryptographic HMAC-SHA256 signature verification over incoming raw webhook bodies. Replay attacks are mitigated by rejecting requests with timestamp drifts greater than 5 minutes.
* **Mutation Safety**: HTTP mutating endpoints (`POST`, `PUT`, `PATCH`) enforce unique `Idempotency-Key` headers cache-backed by PostgreSQL.

---

## 9. Caching
* **Invoice Cache**: Caches fetched invoice summaries. Invalidated when `InvoiceIssued` or `InvoicePaid` events are consumed.
* **Dashboard Cache**: Caches dashboard aggregates. Invalidated on any payment/invoice state updates.

---

## 10. Test Baseline
The release criteria baseline is strictly frozen as follows:

| Test Suite Category | Test Count | Environment |
| :--- | :--- | :--- |
| **Integration Tests** | 61 | Local Express server (Loopback port 9001) |
| **Golden E2E Flow** | 1 | Complete signup-to-reconciliation path (Port 9002) |
| **Failure Tests** | 11 | Infrastructure and network degradation tests (Port 9003) |
| **Database Tests** | 6 | PostgreSQL required (port 9005); skipped when unreachable |
| **Restart & Recovery** | 1 | Two application lifecycles over PostgreSQL (port 9006); skipped when unreachable |
| **Broker Tests** | 7 | Redis required (CI service); skipped when unreachable |
| **Payment Provider Tests** | 17 | Razorpay adapter, signature verification, webhook dispatch and failed initiation against a stubbed gateway; no network |
| **Razorpay Live Smoke** | 3 | Skipped in the gate. Manual dispatch (`RAZORPAY_SMOKE=1`, test-mode keys) creates and abandons a ₹1 Payment Link against the real API |
| **Total** | **104** | **All tests must pass cleanly (`104/104 PASS`)** |

---

## 11. Known Development Fallbacks
* **Mock Repositories**: Opt-in only. A boundary started without a database URL aborts unless the caller passes `allowInMemory`, so no deployment runs on repositories that lose state at exit. The mock-mode suites pass the flag explicitly.
* **Sandbox Payment Provider**: The default (`PAYMENT_PROVIDER=sandbox`) simulates the gateway in-process rather than calling a live API. It holds no state, so a simulated callback can be delivered to any process that can reach the database. With `PAYMENT_PROVIDER=razorpay` the boundary instead creates Razorpay Payment Links, returns the hosted URL as `paymentUrl`, and confirms from `payment_link.paid` only after re-reading the payment from Razorpay. Collection is INR-only until international payments are enabled on the account. Each payment records the collecting gateway as its method (`RAZORPAY` or, for the simulator, `STRIPE`), and that column is persisted so payment history reports the gateway that actually took the money. If the gateway refuses to open a link, the payment that was already persisted is terminal-failed (`GATEWAY_INITIATION_FAILED`) before the error is returned, so a failed collection does not linger as pending or accumulate on retry. Link creation is verified against the real API by a manual-dispatch smoke job: it proves test-mode credentials, the request schema, and paise conversion by opening and abandoning a ₹1 Payment Link. The paid → captured → `payment_link.paid` path is still verified only against a stub, because Razorpay delivers that event only after a human pays the hosted page and the endpoint must be publicly reachable.
* **Local Event Bus**: Opt-in only. A boundary started without `MERCHANT_BROKER_URL` aborts unless the caller passes `allowInProcessBus`, so no deployment silently keeps outbox events inside the process that wrote them. With the flag, durability still comes from the outbox, which retains events in PostgreSQL until a subscriber accepts them, but no other replica ever sees them.

---

## 12. Production Dependencies
* **Runtime**: Node.js v18+
* **Database**: PostgreSQL v14+
* **Broker**: Redis v7+ (stream transport; optional, required for cross-replica event delivery)
* **Payment Gateway**: Razorpay Payments API over HTTPS (when `PAYMENT_PROVIDER=razorpay`; no SDK dependency)
* **ORM**: Prisma Client v7.9.0
* **Hashing & Security**: `bcryptjs` v2.4.3
* **Web Framework**: Express.js v4.21.2
