# Utilities Submodule Guide — ACOS Foundation Layer

This guide outlines the purpose, categories, architectural boundaries, and guidelines for the `foundation/utils` package of the Autonomous Commerce OS (ACOS).

---

## 1. Architectural Philosophy: Zero-Dependency Helper Tools

In ACOS, a **Utility** is a generic, reusable, and side-effect-free programming helper.
- **Scope**: Utilities operate on standard JavaScript types (strings, numbers, objects, arrays, promises) and have **zero knowledge** of ACOS business concepts (invoices, payments, identities) or infrastructure technologies (Prisma, SQLite, Express).
- **Pure Functions**: Most utilities are implemented as pure, deterministic functions, ensuring they do not store state or create hidden side effects.
- **Dependency Inversion**: Higher-level modules (e.g. Core, Configuration) may depend on Utilities, but Utilities must **never** depend on any other submodule in ACOS.

---

## 2. Utility Categories

The submodule is divided into six logical helper namespaces:

1. **`Guard`**:
   - Defensively validates programming invariants (e.g., checks if function parameters are null, undefined, or empty).
   - Throws standard runtime errors when validation fails. Used for programming preconditions, not soft client input validation.
2. **`CollectionUtils`**:
   - Performs operations on arrays, sets, and maps (e.g. `distinct`, `groupBy`, `partition`, `chunk`) in an immutable fashion, always returning new collection references.
3. **`ObjectUtils`**:
   - Deeply manipulates generic JSON/data objects (e.g., `deepFreeze`, `deepClone`, `deepMerge`, `pick`, `omit`).
   - Serves as the central engine for freezing immutable Domain Value Objects and Configurations.
4. **`StringUtils`**:
   - Generic string formatting (e.g., `capitalize`, `camelCase`, `kebabCase`, `snakeCase`, `truncate`, `normalizeWhitespace`).
5. **`AsyncUtils`**:
   - Simplifies asynchronous behaviors (e.g., generic promise timeouts, `delay()`, and generic exponential backoff `retry()` blocks).
6. **`Disposable`**:
   - Defines the standard `IDisposable` contract for clean resource termination (such as files, sockets, database clients, or mock test setups).
