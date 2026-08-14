# IU-001 — Entity Design Analysis

This document outlines the responsibilities of the base `Entity` abstraction in the Autonomous Commerce OS (ACOS) Foundation Layer, and details which responsibilities are delegated to other domain primitives.

---

## 1. Responsibilities of the `Entity` Class

The `Entity` class is the fundamental building block representing an object in the domain that is defined by its identity rather than its attributes.

### Core Responsibilities
- **Stable Identity**: Define and hold a unique identity (`id`) that remains constant throughout the entity's lifecycle.
- **Identity Immutability**: Ensure that once the identity is set (during construction), it cannot be modified or replaced.
- **Identity-based Equality**: Implement equality rules where two entities are equal if and only if:
  1. They are of the the same class type (or subclass).
  2. They share the exact same identity (`id`).
- **Consistent Hashing**: Provide a hashing mechanism (like `getHashCode()`) that remains consistent with the identity and equality semantics (equal entities must produce the same hash code).
- **Invariant Enforcement (Identity)**: Validate that the identity is present and not null/undefined upon creation.

---

## 2. Responsibilities Delegated to Other Abstractions

To keep the `Entity` class focused and free of unrelated concerns, the following responsibilities are explicitly delegated to other parts of the system:

| Responsibility | Delegated To | Rationale |
| :--- | :--- | :--- |
| **Transaction Boundary & Event Tracking** | `AggregateRoot` | Not all entities are aggregates. Only Aggregate Roots manage transactions, maintain consistency boundaries, and dispatch domain events. |
| **Value-based Equality** | `ValueObject` | Value objects have no identity. Their equality is determined by comparing all of their properties. |
| **Persistence (Database mapping)** | Infrastructure Repositories / Mappers | Entities belong to the domain layer and must remain pure (ignoring database schemas, foreign keys, or ORM annotations). |
| **Complex Business Rule Validation** | Value Objects / Domain Services | Base entity should only ensure identity invariants. Specific business rules and attribute validations belong in dedicated domain objects or services. |
| **Business Flow Orchestration** | Application Services / Use Cases | Entities encapsulate their own internal state and behavior, but do not orchestrate interactions between multiple aggregates or systems. |
