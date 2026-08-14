# IU-001 — Domain Service Design Analysis

This document outlines the semantics, constraints, and responsibilities of the `DomainService` pattern in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Domain Service Semantics

In Domain-Driven Design (DDD), a **Domain Service** is a stateless construct that encapsulates business operations, rules, and calculations that do not naturally belong inside a single Entity or Value Object.

### When to Use a Domain Service
- **Multi-Aggregate Operations**: The operation involves coordinating multiple distinct Aggregate Roots (e.g. transfering funds between two ledger balances).
- **Stateless Calculations**: The process requires computing a value based on business rules but doesn't modify a single aggregate directly (e.g. currency conversion, tax rate calculations).
- **Decoupled Business Rules**: A business rule applies to an interaction that would feel forced if assigned to one of the entities (e.g. reconciling a payment received with an issued invoice).

---

## 2. Core Constraints of a Domain Service

To maintain clean DDD separation, all Domain Services must adhere to the following rules:

1. **Strictly Stateless**: A Domain Service must never hold internal state (such as transaction records, query cache, or connection statuses) across invocations.
2. **Domain-Layer Purism**: It contains domain logic only. It must not handle persistence operations, HTTP routers, or infrastructure side effects (such as sending emails).
3. **No Direct Orchestration**: Orchestrating application workflows (e.g. fetching database records, saving aggregates, triggering notifications) is the responsibility of **Application Services**, not Domain Services.

---

## 3. Marker Abstraction Design

We will implement a marker base class or interface:
- A base abstract class `DomainService` or marker class serves as a clear label for clean architecture boundaries.
- Because it is stateless, it doesn't need constructor properties or internal queues. It acts purely as a design separator.
