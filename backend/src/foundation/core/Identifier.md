# IU-001 — Identifier Design Analysis

This document outlines the semantics, validation, and serialization strategies for the base `Identifier` abstraction in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Identifier Semantics

An `Identifier` is a specialized Value Object that represents a unique identity. 

### Key Characteristics
1. **Type Safety**: Although many identifiers wrap strings, they should be strongly typed subclass representations (e.g. `UserId`, `InvoiceId`). This prevents developers from accidentally passing a user ID where an invoice ID is expected.
2. **Immutability**: The wrapped value must be readonly and set only once at creation time.
3. **Structural Equality**: Equality is based on comparing the underlying string values and ensuring both objects share the same prototype/class type.

---

## 2. UUID and Generation Strategy

For unique, random identities, ACOS uses **UUID v4**:
- To keep the Foundation Layer clean of external infrastructure and dependencies, we leverage Node.js's built-in `crypto.randomUUID()` API.
- Custom domain identifiers (like `InvoiceNumber` or blockchain tx hashes) may use different formats (e.g., standard sequential patterns, EVM address formats) and should bypass strict UUID validation.

---

## 3. Validation Strategy

The base identifier constructor must enforce core invariants:
- **Null / Undefined Guard**: Reject `null` or `undefined` values.
- **Empty String Guard**: Reject empty strings (`""`) or whitespace-only strings.
- **Format Verification**: Specialized UUID-based identifiers will validate their string values using a standard UUID v4 regular expression:
  `/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`

---

## 4. Serialization Strategy

To prevent serialized objects from outputting nested structures like `{"id": {"props": {"value": "123"}}}`:
- **`toString()`**: Return the raw string value directly.
- **`toJSON()`**: Return the raw string value directly.
- **`toValue()` / `value` getter**: Expose the underlying primitive string value for DB operations.
