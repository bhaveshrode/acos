# ACOS Backend OS Kernel

The backend workspace contains the core transactional capabilities, domain aggregates, database repository layers, and CQRS request handling mediator pipelines of the **Autonomous Commerce OS (ACOS)**.

---

## 🏗️ Folder Structure

-   **[src/foundation](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation)**: Strategic Domain-Driven Design (DDD) base classes:
    -   `core/`: Base implementations for [AggregateRoot](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation/core/AggregateRoot.ts), [Entity](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation/core/Entity.ts), [ValueObject](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation/core/ValueObject.ts), [Identifier](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation/core/Identifier.ts), [Specification](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation/core/Specification.ts), and [Clock](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/foundation/core/Clock.ts).
-   **[src/business](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/business)**: Authoritative business domains:
    -   `identity`: User aggregate, verification tokens, login attempt lists.
    -   `organization`: Slugs, currencies, member credentials, settings.
    -   `customer`: Billing address details, primary contact value objects.
    -   `invoice`: Invoice number value object, status state machines, line items list.
    -   `payment`: Gateway references, payment references, allocations.
    -   `accounts_receivable`: Debits, credits, ledger allocations, outstanding balance checks.
-   **[src/application](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/application)**: Application-specific command/query definitions and CQRS orchestration pipelines:
    -   `foundation/pipeline/Mediator.ts`: Standard CQRS mediator dispatcher.
    -   `handlers/`: Command/query execution logic (e.g., `RegisterUserCommandHandler`, `CreateInvoiceCommandHandler`).
-   **`src/kernel`**: The public syscall surface (`acos-backend`, `/application`). Nothing outside these entry points is API. Persistence and messaging adapters live with the consumer in `products/merchant/src/adapters`.

---

## 📏 DDD Coding Rules & Constraints

To maintain clean separation and pure business logic, developers must adhere to the rules outlined in **[Core Design Guide.md](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/Core%20Design%20Guide.md)**:

### 1. Repository Boundary
*   **Only Aggregate Roots get repositories** (`IRepository`).
*   Never define repositories for child entities (e.g., `InvoiceLineItem`). All operations must pass through their parent root repository (e.g., `IInvoiceRepository`).

### 2. Side-Effect Free Value Objects
*   Value Objects are completely immutable. Constructors enforce `Object.freeze` (via deep-freezing).
*   Methods on Value Objects must return a new instance instead of modifying existing properties.

### 3. Absolute Temporal Determinism
*   **Do not call `new Date()` directly** inside aggregates, domain services, or handlers.
*   Use `Clock.now()` to ensure deterministic unit testing.

### 4. Prohibited Dependency Rule
*   Entities must NOT depend on or import repositories, database connectors, or raw web request pipelines.
*   Aggregates raise domain events by enqueueing them internally. They do not publish themselves.

---

## 🧪 Testing

The backend suite validates the structural invariants, DDD rules compliance, mediator execution pipelines, and data persistence models:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🗄️ Database Migrations

The schema is deployed from the committed migrations in `prisma/migrations`, never by pushing the datamodel.

```bash
# Regenerate the Prisma client after a schema change
npm run prisma:generate

# Apply the committed migrations (the gate runs this before the merchant suites)
npm run prisma:migrate

# Author a new migration against a local PostgreSQL instance
npm run prisma:migrate:dev -- --name add_customer_index
```

`schema.prisma` must never change without a matching migration. The gate diffs the migrated database against the datamodel and fails the build when they disagree, so a schema edit that is missing its migration surfaces at review time rather than in production.

A database created before the migration history existed already has the tables but no `_prisma_migrations` rows, so `migrate deploy` refuses it with P3005. Mark the baseline as applied once against that database, then deploy as usual:

```bash
npx prisma migrate resolve --applied 20261113120000_init
npm run prisma:migrate
```

