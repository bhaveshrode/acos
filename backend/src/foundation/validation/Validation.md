# Validation Design Analysis

This document outlines the philosophy, architectural constraints, and structure for the `Validation` framework in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Validation Philosophy

In ACOS, validation ensures that data is structurally valid before it reaches the core domain aggregates or business actions:
- **Structural Validation (Expected)**: Checks if email addresses have the correct syntax, string inputs fit character lengths, or numbers are in expected ranges. Failures of structural validation are expected and **must return a failed `Result`** (`Result.fail(...)`) carrying detailed validation diagnostics.
- **Structural Validation (Unrecoverable Guard)**: In some contexts, like an entity or value object constructor, passing invalid parameters represents a programmer error. In those specific scenarios, constructors should throw a `ValidationException` as a defensive guard.
- **Decoupling**: The validation framework is strictly framework-agnostic. It does not import or know about Express, class-validator annotations, database schemas, or form libraries.

---

## 2. Core Components

To support programmatic validation, we define the following constructs:

1. **`ValidationFailure`**:
   - A Value Object representing a single rule breach.
   - Properties: `property` (string field name) and `message` (string explanation).
2. **`ValidationRule<T>`**:
   - Interface representing a single assertion check.
   - Method: `validate(value: T, property: string): ValidationFailure | null;`
3. **`Validator<T>`**:
   - Class that orchestrates multiple rules against a target object or field.
   - Accumulates all failures and returns a composited `Result<T>`:
     - Success: `Result.ok(target)`
     - Failure: `Result.fail(ResultError.validation("Validation failed.", { failures }))` where `failures` is a list of `ValidationFailure` objects.

---

## 3. Reusable Rules Blueprint

To allow quick, declarative validations across all business modules, the framework provides core reusable rule implementations:

- **`RequiredRule`**: Verifies that a value is not `null`, `undefined`, or an empty/whitespace string.
- **`StringLengthRule`**: Asserts that a string's length is between defined minimum and maximum bounds.
- **`PatternRule`**: Verifies that a string matches a specific Regular Expression pattern (e.g. email, UUID, wallet address formats).
- **`RangeRule`**: Asserts that a number falls between a defined minimum and maximum.
