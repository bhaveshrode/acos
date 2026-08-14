# IU-001 — Repository Design Analysis

This document outlines the semantics, structural constraints, and principles of the `Repository` abstraction in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Repository Semantics

A **Repository** is a Domain Layer contract that abstracts persistence mechanics. It acts as an in-memory collection of aggregates.

### Core Principles
- **Persistence Ignorance**: The Domain Layer defines the interface. The Infrastructure Layer implements it. The Domain does not know if aggregates are saved in PostgreSQL, MongoDB, Redis, an Event Store, or in-memory arrays.
- **Asynchronous Execution**: To account for network latency, I/O database queries, and blockchain calls, all repository methods must be asynchronous (returning JS `Promise` objects).
- **Expressive Nomenclature**: We avoid database terms like `insert`, `update`, `select`, `execute`, or `table`. Instead, we use collection-centric terms like `save`, `findById`, `exists`, and `delete`.

---

## 2. Structure & CQRS Segregation

To support Command Query Responsibility Segregation (CQRS) and generic reuse, we split the repository contract into three interfaces:

1. **`IReadRepository<TAggregate, TId>`**:
   - Manages query concerns: `findById()`, `exists()`, `findAll()`, and `findBySpecification()`.
2. **`IWriteRepository<TAggregate, TId>`**:
   - Manages state mutation concerns: `save()` and `delete()`.
3. **`IRepository<TAggregate, TId>`**:
   - Composes both interfaces, representing a standard read-write aggregate repository.

---

## 3. Generic Constraints (Safety)

To prevent developers from accidentally creating repositories for arbitrary objects (such as plain objects or sub-entities like `InvoiceLineItem`), the interfaces enforce strict generics:

```typescript
export interface IRepository<
  TAggregate extends AggregateRoot<TId>,
  TId extends Identifier<any>
>
```

This compile-time safety ensures that only Aggregate Roots with valid typed Identifiers can have repositories.

---

## 4. The "Repository Per Aggregate" Rule

In Domain-Driven Design:
- **Only Aggregate Roots get repositories.**
- Sub-entities (e.g. `InvoiceLineItem` inside `Invoice`) are loaded and saved exclusively through their parent Aggregate Root. 
- Creating a repository for a sub-entity violates the consistency boundary and is strictly forbidden.
