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

---

## 📁 Workspace Map

-   **[src/start.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/start.ts)**: Configures the mock runtime factory, establishes database boundaries, and boots the Express server.
-   **[src/backend/MerchantBackend.ts](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/products/merchant/src/backend/MerchantBackend.ts)**: Express.js REST application. Manages session cookie generation, idempotency record checks, stripe webhook HMACS, and correlation context storage.
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
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

---

## 🧪 Testing

The merchant validation suite tests integration boundary logic, failure resistance, PostgreSQL syncing, and full E2E paths:

*   **Integration Specs**: Checks logins, multi-tenant boundaries, and invoice state transitions.
*   **Failure Specs**: Verifies correct error codes during connection loss or invalid webhook signatures.
*   **Recovery Specs**: Checks that active sessions, outbox queues, and idempotency states survive server restarts.
*   **Golden E2E Flow**: Resolves a complete signup ──► onboard ──► customer ──► invoice ──► payment collection ──► webhook reconciliation path.

```bash
# Run the merchant test suite
npm test
```
