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
1. **Mock Context (Development Fallback)**: In-memory repository registries mapping data to local collections for rapid testing.
2. **Persistent Context (Production Mode)**: Relational tables mapped to PostgreSQL using Prisma Client. Repositories utilize transaction boundaries (`$transaction`) to enforce financial ledger consistency.

---

## 7. Event & Outbox Architecture
To guarantee at-least-once domain event delivery and avoid dual-write consistency issues:
1. When mutations generate domain events, `OutboxEventBus` writes them to the `OutboxEvent` database table.
2. The asynchronous outbox background processor (`processOutboxAsynchronously`) polls the table sequentially, publishes events to the raw Event Bus, and marks records as processed in PostgreSQL.

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
| **Failure Tests** | 9 | Infrastructure and network degradation tests (Port 9003) |
| **Total** | **71** | **All tests must pass cleanly (`71/71 PASS`)** |

---

## 11. Known Development Fallbacks
* **Mock Repositories**: Default to in-memory mocks when database URLs are omitted.
* **Sandbox Payment Provider**: Simulates provider integrations rather than querying live Stripe endpoints.
* **Local Event Bus**: Utilizes in-memory dispatching rather than external message queues (e.g. RabbitMQ/Kafka).

---

## 12. Production Dependencies
* **Runtime**: Node.js v18+
* **Database**: PostgreSQL v14+
* **ORM**: Prisma Client v7.9.0
* **Hashing & Security**: `bcryptjs` v2.4.3
* **Web Framework**: Express.js v4.21.2
