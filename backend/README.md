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
-   **[src/presentation](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/backend/src/presentation)**: Server filters, JWT decoders, error filters, websocket connections, and versioning routing.

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
