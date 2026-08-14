# IU-001 — Value Object Design Analysis

This document outlines the semantics and design principles of the base `ValueObject` abstraction in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. DDD Semantics of a Value Object

Unlike `Entity`, which is defined by a persistent identity, a `ValueObject` is defined solely by its properties.

### Core Semantics
1. **No Identity**: Value Objects do not have IDs. Two instances with identical property values are considered completely equal and interchangeable.
2. **Immutability**: A Value Object's properties cannot be modified after instantiation. Any changes require constructing a new instance.
3. **Enforced Invariants**: A Value Object must validate its own attributes inside the constructor. An invalid Value Object (e.g., negative money, malformed email) must never be allowed to exist.
4. **Structural Equality**: Equality is checked by performing a deep comparison of all properties.
5. **Hash Consistency**: The hash code of a Value Object must be deterministically generated from its properties. Equal Value Objects must always produce equal hash codes.
6. **Side-effect Free Operations**: Methods on Value Objects must only perform computations and return new instances or values. They must never mutate the existing instance.

---

## 2. Structural Equality & Hashing Design

To handle structural equality in TypeScript/JavaScript, the base `ValueObject` must recursively compare values:
- **Primitives**: Standard strict equality (`===`).
- **Dates**: Compare numeric representation (`date.getTime()`).
- **Nested Value Objects**: Invoke their `equals()` method.
- **Arrays**: Ensure same length and recursively compare elements in order.
- **Plain Objects**: Compare keys and values recursively.

For hashing, we will serialize the properties deterministically (sorting object keys) or walk the object structure to compute a stable hash string.

---

## 3. Comparison of Domain Primitives

| Aspect | Entity | Value Object |
| :--- | :--- | :--- |
| **Identity** | Unique, stable (`id`) | None |
| **Equality** | Identity-based (`this.id === other.id`) | Structural-based (deep comparison of all properties) |
| **Immutability** | Identity is immutable, attributes can be mutable | Entire object is completely immutable |
| **Operations** | May mutate state and raise Domain Events | Side-effect free, returns new instances |
| **Lifecycle** | Has a lifecycle (created, updated, archived) | Transient (instantiated, passed around, discarded) |
