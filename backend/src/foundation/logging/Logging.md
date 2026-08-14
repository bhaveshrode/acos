# Logging Submodule Guide — ACOS Foundation Layer

This guide outlines the purpose, categories, architectural boundaries, and guidelines for the `foundation/logging` package of the Autonomous Commerce OS (ACOS).

---

## 1. Architectural Philosophy: Observation vs. Flow

In ACOS, logging is purely **observational**. 
- It answers *what happened* in the system for diagnostics, analytics, and auditing.
- It **never** controls execution flow, sends emails, retries operations, or replaces exception/result handling.

### Concept Boundaries
| Construct | Responsibility | Return / Flow |
| :--- | :--- | :--- |
| **Domain Event** | Represents a business fact change (e.g. `InvoicePaid`). | Propagates state asynchronously to trigger side-effects. |
| **Result.fail()** | Wraps an expected soft business failure (e.g. invalid password). | Explicit return type for calling services. |
| **Exception** | Indicates an unrecoverable system crash (e.g. database down). | Aborts current execution thread. |
| **Log Entry** | Structured diagnostic text + context capturing variable values. | Pure side-effect; doesn't affect execution logic. |

---

## 2. Standardized Log Levels

ACOS enforces six log levels. Every logging implementation must respect these levels:

1. **`TRACE`**: High-frequency, extremely detailed diagnostic variables (e.g. raw packet segments, loop iterations).
2. **`DEBUG`**: Developer-level flows (e.g. query compilation details, state check triggers).
3. **`INFO`**: High-level application milestones (e.g. service start, invoice created, payment matched).
4. **`WARN`**: Minor anomalies that do not halt operation (e.g. slow DB query, cache miss on critical key).
5. **`ERROR`**: Caught failures in operations (e.g. external payment API timeout, failed invoice delivery).
6. **`CRITICAL`**: Fatal failures affecting the entire system (e.g. database connection lost, disk full).

---

## 3. Structured Logging & Correlation IDs

### No Message Concatenation
Never construct logs like:
`logger.info("Invoice " + invoiceId + " created for customer " + customerId)`

Instead, write structured context:
```typescript
logger.info("Invoice created", {
  invoiceId: "123",
  customerId: "456",
  amount: 250
});
```

### Flow Trace Correlation
To trace logs across async boundaries (e.g. from an HTTP request to an event subscriber), every log entry holds a `LogContext` containing:
- **`correlationId`**: Uniquely identifies the initial user/system trigger (e.g. HTTP request ID).
- **`causationId`**: Identifies the direct cause of this action (e.g. event ID of `InvoiceCreatedEvent`).
- **`traceId` / `spanId`**: Telemetry markers for OpenTelemetry integration.
