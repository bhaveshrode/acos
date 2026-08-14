# Exception Design Analysis

This document outlines the philosophy, boundary conditions, and hierarchy layout for exceptions in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Exception vs. Result Boundary Contract

To maintain structural consistency, ACOS defines a clear separation between expected business flow failures and unexpected system/runtime failures:

| Situation / Scenario | Use `Result.fail(...)` | Throw Exception | Rationale |
| :--- | :---: | :---: | :--- |
| **Invoice not found** | ✅ | ❌ | Expected lookup failure; the application layer should handle this case gracefully. |
| **User entered invalid data** | ✅ | ❌ | Validation failure from user inputs is expected and needs formatting returns. |
| **Payment already processed** | ✅ | ❌ | Business rule conflict; state transitions must return outcomes, not crash. |
| **Database connection lost** | ❌ | ✅ | Unrecoverable infrastructure failure. The application cannot proceed. |
| **Configuration file missing** | ❌ | ✅ | Crucial system startup constraint violated. |
| **Corrupted internal state** | ❌ | ✅ | Aggregates entering impossible states indicate code bugs or corrupted memory. |
| **Impossible invariant violated** | ❌ | ✅ | Defensive program checks (e.g. guard failures inside constructors). |
| **Programmer error** | ❌ | ✅ | Calling wrong methods, passing invalid object parameters, or mock runtime bugs. |

---

## 2. Base Exception Architecture

All system exceptions inherit from a common `BaseException` which extends the JavaScript native `Error` class.

### Standardized Attributes
1. **`message`** (string): Human-readable error description (inherited from native `Error`).
2. **`code`** (string): Unique uppercase code category representing the type of exception (e.g. `INFRASTRUCTURE_ERROR`, `CONFIGURATION_ERROR`).
3. **`context`** (optional object): Additional key-value context capturing variable values at the moment the crash occurred (for log diagnostics).
4. **`cause`** (optional Error): Standard JS `cause` property for nesting inner errors (preserving stack traces from third-party client drivers).

---

## 3. Exception Category Subclasses

We define specialized category exception classes to allow global logger/middleware filters to easily catalog errors:

- **`DomainException`**: Thrown when a fundamental domain model invariant or constraint is breached (indicating impossible domain states).
- **`InfrastructureException`**: Thrown when third-party software, file systems, databases, network connections, or API clients fail.
- **`ValidationException`**: Thrown during strict input formatting checks, specifically when data violates core structural constraints (distinct from soft business validation Results).
- **`ConfigurationException`**: Thrown during startup boot validation checks if parameters or files are invalid/missing.
