# IU-001 — Clock Design Analysis

This document outlines the semantics, UTC policies, and testability strategies for the `Clock` abstraction in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Why a Clock Abstraction Exists

Directly calling `new Date()` within domain aggregates or services binds the code directly to the host machine's system clock. This creates several problems:
- **Non-determinism**: Tests that evaluate time-sensitive rules (e.g. invoice expiry, overdue reminders) depend on the exact moment the test runs.
- **Invasive Mocking**: Developers are forced to mock the global JavaScript `Date` object, which is invasive and can break test runners (such as Vitest/Jest internals) and asynchronous timers.
- **Timezone Inconsistencies**: Machine clocks can run on local times, causing database reconciliation issues across multi-region servers.

By abstracting time retrieval behind an `IClock` interface, the domain remains pure, deterministic, and easily testable.

---

## 2. UTC Policy

To prevent timezone issues:
- **All dates** retrieved from ACOS clock implementations must represent Coordinated Universal Time (UTC).
- All serialization of dates (e.g. to JSON strings) must append the UTC indicator `Z` (e.g. `2026-07-23T06:25:14.000Z`).

---

## 3. Testability Strategy: Static Provider Registry

While constructor dependency injection is ideal for Application Services, it is cumbersome for Entities and Value Objects (which are constructed manually via factories, not DI).

To balance clean architecture and developer convenience, we will implement:
1. An `IClock` interface defining the contract.
2. A concrete `SystemClock` (production system time) and a concrete `TestClock` (fake controllable time).
3. A static `Clock` registry/provider class that defaults to using `SystemClock`, but allows tests to swap the active provider with `TestClock` to freeze or advance time programmatically.

```typescript
// Example domain use:
const issuedAt = Clock.now();

// Example test setup:
const testClock = new TestClock(new Date("2026-07-23T00:00:00Z"));
Clock.setProvider(testClock);
// ... run code ...
testClock.advanceDays(7); // advance time to verify overdue state
```
