# ACOS Merchant Portal (Client App)

The merchant portal is a decoupled, client-facing presentation and API server application. It bridges client web traffic to the **Autonomous Commerce OS (ACOS)** core using an integration boundary layer.

---

## 🏗️ Architecture Design

```
Merchant App (Express Router)
         │
         ▼
AcosIntegrationBoundary ───► CQRS Mediator ───► ACOS Subsystems
         │
         ▼
Prisma Database Client ────► PostgreSQL (durable persistence)
```

-   **Authoritative Boundary**: The merchant application never updates business or financial states directly. All mutations pass through [AcosIntegrationBoundary.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/integration/AcosIntegrationBoundary.ts) command handlers.
-   **Durable Outbox**: In production mode, mutations write events to the `OutboxEvent` table. The outbox processor polls this table sequentially, publishing events to the message bus to ensure transactional integrity.
-   **Broker Transport**: When `MERCHANT_BROKER_URL` is set, the message bus is backed by a Redis stream, so events reach every replica instead of only the process that wrote them. Each replica consumes under its own group; a failed handler stays pending and is reclaimed, and repeated failures are dead-lettered to `acos.events.dead`. Without the URL the boundary refuses to start unless the caller explicitly passes `allowInProcessBus`, which keeps the in-process bus and cannot deliver events to other replicas.
-   **Payment Gateway**: `PAYMENT_PROVIDER=razorpay` collects INR invoices through Razorpay Payment Links: `createPaymentRequest` returns a hosted `paymentUrl`, the stored gateway reference is the link id, and `payment_link.paid` is verified over the raw request body with `X-Razorpay-Signature` before the payment is confirmed. Confirmation always re-reads the payment from Razorpay, so a callback cannot confirm money the gateway has not captured. The default `sandbox` provider simulates the gateway in-process.

---

## 📁 Workspace Map

-   **[src/start.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/start.ts)**: Configures the mock runtime factory, establishes database boundaries, and boots the Express server.
-   **[src/backend/MerchantBackend.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/backend/MerchantBackend.ts)**: Express.js REST application. Manages session cookie generation, idempotency record checks, raw-body capture for webhook signatures, and correlation context storage.
-   **[src/integration/PrismaRepositories.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/integration/PrismaRepositories.ts)**: Persistence adapters mapping ACOS aggregates to PostgreSQL tables.
-   **[src/frontend/MerchantFrontend.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/frontend/MerchantFrontend.ts)**: Simulated client SDK mimicking client actions (e.g., API requests).
-   **[src/events/consumers/MerchantEventConsumer.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/events/consumers/MerchantEventConsumer.ts)**: Subscribes to invoice state updates, clearing presentation caches.

---

## ⚙️ Configuration (`.env`)

To start the portal in production mode, copy `.env.example` to `.env` and specify the database parameters:

```env
PORT=9000
ENV=production
DB_URL=postgresql://user:password@localhost:5432/acos_db
MERCHANT_BROKER_URL=redis://localhost:6379
MERCHANT_REPLICA_ID=merchant-1
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

`MERCHANT_BROKER_URL` is required for a normal start: without it the boundary aborts unless `connect()` is called with `allowInProcessBus`, which keeps outbox events inside the process that wrote them. `MERCHANT_REPLICA_ID` names the consumer group and must be unique per replica (it defaults to the hostname).

`PAYMENT_PROVIDER` defaults to `sandbox`. Setting it to `razorpay` requires the three `RAZORPAY_*` values and refuses to start without them. Point the Razorpay webhook at `POST /payments/webhook` and subscribe to `payment_link.paid` (plus any events you want acknowledged); only that event settles a payment.

---

## 🧪 Testing

The merchant validation suite tests integration boundary logic, failure resistance, PostgreSQL syncing, and full E2E paths:

*   **Integration Specs**: Checks logins, multi-tenant boundaries, and invoice state transitions.
*   **Failure Specs**: Verifies correct error codes during connection loss or invalid webhook signatures.
*   **Recovery Specs**: Checks that active sessions, outbox queues, and idempotency states survive server restarts.
*   **Broker Specs**: Proves cross-replica delivery, per-replica dedupe, handler retry and dead-lettering against a real Redis stream (skipped when Redis is unreachable).
*   **Razorpay Specs**: Covers minor-unit conversion, INR-only collection, gateway-authoritative confirmation, raw-body signature verification and webhook dispatch against a stubbed gateway client.
*   **Razorpay Live Smoke**: Opt-in (`RAZORPAY_SMOKE=1` with test-mode keys) and skipped by default; dispatched manually to prove Razorpay accepts link creation with the charge in paise. Paying a link still needs a human at the hosted page.
*   **Razorpay Inbound E2E**: Opt-in (`RAZORPAY_E2E=1`) and skipped by default; dispatched manually, it exposes the backend through a public tunnel, prints the webhook URL and a ₹1 test-mode link, then asserts the delivered webhook confirms the payment and settles the invoice. Run against test mode on 2026-11-13 with a real ₹1 payment: signature accepted, payment `CONFIRMED`, invoice `PAID`, receivable settled.
*   **Golden E2E Flow**: Resolves a complete signup ──► onboard ──► customer ──► invoice ──► payment collection ──► webhook reconciliation path.

```bash
# Run the merchant test suite
npm test
```
