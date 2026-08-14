# Autonomous Commerce OS (ACOS)

Autonomous Commerce OS (ACOS) is an enterprise-grade, domain-driven commerce operating system. It provides the kernel boundaries, transactional engines, state workflows, double-entry financial accounting, security gates, and real-time monitoring required to build self-sovereign and autonomous merchant checkout and settlement applications.

---

## 🚀 Key Subsystems & Features

ACOS consists of several authoritative, core business capabilities:

1.  **Identity Subsystem**: Authenticates merchant users, securely hashes credentials (via `bcryptjs`), and issues cryptographic JSON Web Tokens (JWT).
2.  **Organization Subsystem**: Manages tenant parameters, default currencies, corporate details, and financial boundary zones.
3.  **Customer Subsystem**: Tracks business contacts, invoicing addresses, and communication preferences.
4.  **Invoice Subsystem**: Orchestrates the financial invoice document lifecycles (transitioning from `DRAFT ──► ISSUED ──► SENT ──► PAID / PARTIALLY_PAID / OVERPAID`).
5.  **Payment Subsystem**: Initiates transaction collections, manages gateway references (Sandbox), and registers transactional settlements.
6.  **Accounts Receivable**: Double-entry general ledger tracking allocations, outstanding debts, and customer overpayment credits.
7.  **Reconciliation Engine**: Asynchronously matches incoming gateway transaction webhooks to outstanding customer invoice balances.

---

## 📁 Repository Structure

The project is structured as an npm workspaces monorepo:

```
ACOS/
├── README.md               # Root Monorepo documentation
├── package.json            # Workspace setup and global configs
├── backend/                # Core OS Kernel, DDD primitives, and CQRS handlers
├── frontend/               # Core Admin Panel UI, routing, theme, and ws state
├── compliance/             # PCI, Tax, Audit, and Governance layers
├── platform/               #Tenancy boundaries, reliability check scenarios
├── developer/              # OpenApi schema, SDKs, CLIs, Postman configuration
├── intelligence/           # Context-aware planning, memory, and reasoning agents
├── runtime/                # Subsystem bootstrapper, composition, and health metrics
├── infrastructure/         # DB interfaces (Prisma), container pipelines, and message logs
└── products/
    └── merchant/           # Decoupled Merchant portal Express.js app
```

---

## ⚙️ Prerequisites & Setup

### Prerequisites
-   **Node.js**: v18.0.0 or higher
-   **Database**: PostgreSQL v14.0 or higher (for persistent DB mode)

### Installation
Clone the repository and install all dependencies for workspaces from the monorepo root:
```bash
npm install
```

---

## 🧪 Testing

ACOS features exhaustive automated validation suites powered by **Vitest**:

*   To run all **Backend** tests:
    ```bash
    cd backend
    npm test
    ```
*   To run all **Frontend** tests:
    ```bash
    cd frontend
    npm test
    ```
*   To run all **Merchant Application** integration and E2E E2E tests:
    ```bash
    cd products/merchant
    npm test
    ```
