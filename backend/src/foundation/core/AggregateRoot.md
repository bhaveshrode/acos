# IU-001 — Aggregate Root Design Analysis

This document outlines the responsibilities of the base `AggregateRoot` abstraction in the Autonomous Commerce OS (ACOS) Foundation Layer, and details which responsibilities are delegated to other primitives/layers.

---

## 1. Responsibilities of the `AggregateRoot` Class

An `AggregateRoot` is a specialized `Entity` that binds a cluster of related entities and value objects together. It represents a transaction and consistency boundary in the domain.

### Core Responsibilities
- **Consistency Boundary**: Enforces all business invariants within its boundary (including nested entities and value objects).
- **Domain Event Management**: Maintains an in-memory queue/collection of domain events (`IDomainEvent[]`) that were raised during a business transaction.
- **Event Registration**: Provides a protected method (e.g. `addDomainEvent()`) that allows internal business methods of the aggregate to record that an event occurred.
- **Event Exposure (Read-only)**: Exposes the recorded domain events to the outside (e.g. Application Layer, Repositories, Unit of Work) in a read-only format to prevent external mutation of the queue.
- **Event Clearing**: Exposes a method (e.g. `clearDomainEvents()`) to empty the event queue once they have been successfully dispatched or persisted.

---

## 2. Responsibilities Delegated to Other Abstractions

To maintain clear separation of concerns (specifically between the domain model and infrastructure), the following responsibilities are explicitly delegated:

| Responsibility | Delegated To | Rationale |
| :--- | :--- | :--- |
| **Event Dispatching / Publishing** | `EventBus` | The Aggregate Root should not have a dependency on, or knowledge of, the event delivery system (e.g. in-memory, RabbitMQ, Kafka). It only records what happened. |
| **Persistence & Transactions** | Repositories / Unit of Work | The Aggregate Root doesn't save itself or manage database transactions. The Application Layer retrieves it, executes business methods, saves it via a repository, and then dispatches the events. |
| **Sub-Entity Management** | Nested Entities / Value Objects | Internal logic specific to sub-entities should be encapsulated within those entities. The AggregateRoot coordinates them but does not micromanage their internal attributes directly. |
