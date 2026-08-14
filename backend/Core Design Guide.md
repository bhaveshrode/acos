# Core Design Guide — ACOS Foundation Layer

This guide acts as the reference manual for developers implementing domain aggregates, services, and workflows within the Autonomous Commerce OS (ACOS). It outlines the core Domain-Driven Design (DDD) primitives and provides rules for their consistent application.

---

## 1. Core Architecture Blueprint

All ACOS business capabilities (Identity, Invoice, Payment, Settlement, etc.) are built on top of the shared Foundation Layer using these unified primitives:

```
                 AggregateRoot
                       ▲
                       │ (inherits)
                    Entity
                       │ (abstracts)
        ┌──────────────┴──────────────┐
        │                             │
   Identifier                  ValueObject

Repository ───── manages ─────► AggregateRoot

Specification ── evaluates ───► Entity / Aggregate

DomainService ── coordinates ─► Aggregates

Clock ───────── supplies ─────► Time
```

---

## 2. Tactical Patterns Decision Matrix

### Entity vs. Value Object
- **Entity**:
  - *Definition*: An object defined by its identity (`id`) rather than its attributes. It has a lifecycle with changing states.
  - *When to use*: When the object needs to be tracked over time, changed, saved, loaded, and has unique identity (e.g. `Invoice`, `Payment`, `User`).
- **Value Object**:
  - *Definition*: An object defined solely by its properties. It has no identity, is immutable, and is structurally equal.
  - *When to use*: When you only care about attributes, measurements, or descriptions (e.g. `Money`, `Currency`, `EmailAddress`, `Percentage`). If the values change, throw it away and construct a new one.

---

### Aggregate Root vs. Domain Service
- **Aggregate Root**:
  - *Definition*: The entry-point entity of a cluster of objects (entities/value objects) that form a consistency boundary. It guards invariants and raises domain events.
  - *When to use*: For main transactional entities (e.g. `Invoice` coordinating its line items, `Payment` holding its matches). All actions on the cluster must go through the Root.
- **Domain Service**:
  - *Definition*: A stateless operations class containing business logic that operates across multiple aggregates or doesn't belong to any single entity.
  - *When to use*: For processes like converting currency (requires fetching rates), matching an invoice with a payment transaction, or routing funds. They must be strictly stateless and domain-only.

---

## 3. Reference Principles

### 1. The "Repository Per Aggregate" Rule
- **Only Aggregate Roots get repositories** (`IRepository`).
- Sub-entities (like `InvoiceLineItem` inside `Invoice`) must never have their own repository. They are created, saved, and loaded exclusively via their parent aggregate's repository.
- Repositories represent in-memory collections of aggregates. They are async and must remain persistence-agnostic (no ORM or SQL leaking into the interfaces).

### 2. Encapsulating Business Predicates via Specifications
- Simple validations (e.g., is an email format correct?) belong inside the Value Object's constructor.
- Complex business state rules (e.g., "Can this invoice be cancelled?") belong in a `Specification<T>` (e.g. `InvoiceCancelableSpecification`).
- Specifications are chainable using `and()`, `or()`, and `not()`, keeping complex conditional rules declarative and isolated from the aggregate class itself.

### 3. Absolute Immutability of Values
- Every Value Object and Identifier must be completely immutable.
- Always apply `Object.freeze` (handled automatically via the base constructor's `deepFreeze(props)`) to prevent accidental state mutation.
- Methods on Value Objects must be side-effect free: return a new instance instead of modifying fields.

### 4. Deterministic Time via Clock
- **Never call `new Date()` or `Clock.newDate()` directly** inside entities or domain services.
- Always retrieve time using the `Clock.now()` static registry wrapper.
- This allows unit tests to inject a `TestClock` to freeze, shift, or advance time (e.g., to test overdue invoices) deterministically without mocking JavaScript globals.

---

## 4. Prohibited Practices (Anti-Patterns)

To maintain architectural integrity, the following patterns are strictly prohibited in the ACOS codebase:

- **❌ Entity inside Entity by ID reference without aggregate boundary**: Do not reference entities in other aggregates using direct object references. Always refer to them by their immutable `Identifier` (ID Value Object).
- **❌ Mutable Value Objects**: Value Objects must be completely immutable. Never allow property mutation; always return a new instance for operations.
- **❌ Repositories for child entities**: Only Aggregate Roots can have repositories. Access child entities (e.g., line items) strictly via their parent Aggregate Root.
- **❌ Domain Service accessing database directly**: Domain Services contain domain logic, not database access. Database access belongs in Repositories, and orchestration in Application Services.
- **❌ Business logic inside Repository**: Repositories are collections of aggregates, not business rule processors. They should only load/save state.
- **❌ Calling Clock.newDate() or new Date() directly**: Never call raw host system time functions. Use `Clock.now()` to ensure deterministic test execution.
- **❌ Aggregate modifying another Aggregate directly**: Aggregates can only modify their own internal consistency boundaries. If an action on one aggregate triggers changes in another, coordinate them asynchronously via **Domain Events** and event handlers, or synchronously via an Application Service.

---

## 5. Dependency Rules

To keep the domain layer pure and avoid circular references, adhere to the following package and component dependency rules.

### Permitted Dependencies
```
AggregateRoot ──► Entity ──► Identifier ──► ValueObject
```
- **AggregateRoot** inherits from and contains **Entity** structures.
- **Entity** uses **Identifier** for identity.
- **Identifier** extends **ValueObject** (specialized value representation).
- **Repository** references and manages **AggregateRoot**.
- **Specification** evaluates **Entity / AggregateRoot**.
- **DomainService** coordinates multiple **Entity / AggregateRoot** objects using **Specification**.

### Prohibited Dependencies
| Source Component | Prohibited Target | Rationale |
| :--- | :--- | :--- |
| **Entity** | `Repository` | Entities must not access persistence or load other database records directly. |
| **Entity** | `Database / ORM` | Domain entities must remain pure and free from persistence infrastructure leakage. |
| **AggregateRoot** | `EventBus` | Aggregates raise events by adding them to their internal collection. They do not publish themselves. |
| **ValueObject** | `Clock` | Value Objects are transient values (like money or currency) and should have no concept of temporal host state. |
| **Specification** | `Repository` | Specifications represent pure memory predicates. They must not query databases directly. |
