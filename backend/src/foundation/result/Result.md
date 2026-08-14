# IU-001 — Result Design Analysis

This document outlines the semantics, invariants, and guidelines for the `Result` and `ResultError` abstractions in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Exception vs. Result Guideline

In ACOS, we differentiate between two categories of errors:

1. **Domain Errors (Expected Outcomes)**:
   - *Examples*: "Invoice already paid," "User email is already registered," "Insufficient funds."
   - *Handling*: **Use `Result`**. These are standard business outcomes that do not represent software failures. They must be explicitly handled by the application logic.
2. **System Failures (Unexpected Exceptions)**:
   - *Examples*: Database connection timeout, network failure, out-of-memory error.
   - *Handling*: **Throw exceptions**. These represent unexpected, unrecoverable system failures that are captured by global exception middleware.

---

## 2. Structure of `Result<T>`

The `Result<T>` type is a lightweight container for the outcome of an operation. It enforces compile-time safety and explicit handling.

### Public API Contract
- `isSuccess: boolean` — Returns `true` if the operation succeeded.
- `isFailure: boolean` — Returns `true` if the operation failed.
- `value: T` — Retrieves the successful value. **Throws an error** if called on a Failure result.
- `error: ResultError` — Retrieves the failure error details. **Throws an error** if called on a Success result.

### Factory Methods
- `Result.ok<T>(value?: T): Result<T>`
- `Result.fail<T>(error: ResultError): Result<T>`

---

## 3. Structure of `ResultError`

Rather than returning raw strings (which are fragile, hard to parse, and localize), ACOS utilizes a strongly typed `ResultError` object.

### Components
- **`code`** (string): A unique uppercase string category (e.g., `VALIDATION_ERROR`, `NOT_FOUND`).
- **`message`** (string): A human-readable description for debugging or display.
- **`metadata`** (optional object): Key-value pairs for rich error context (e.g. `{ invoiceId: "123", amount: -50 }`).

---

## 4. Design Invariants
1. **Immutability**: Once constructed, a `Result` and its `ResultError` are deeply frozen to prevent state modification.
2. **Composition Support**: The design encourages monadic composition (e.g. combining multiple validation results or matching operations).
3. **Serialization Friendly**: Both `Result` and `ResultError` serialize directly to plain JSON, allowing clean integration with HTTP routes and event payloads.
