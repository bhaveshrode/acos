# Customer Application Layer Engineering Review (Task 22.5)

This document presents our engineering review of the Customer Application Layer under `backend/src/application/customer/`.

---

## 1. Request Scenarios & Flow Controls
- **Command & Query Handling**: Implemented `CreateCustomerCommand` and `GetCustomerByIdQuery` routed through their respective handler coordinates:
  - `CreateCustomerCommandHandler`: Checks for duplicate customer number registration in the organization context, translates raw DTO inputs to Domain Value Objects, instantiates the aggregate, and saves it.
  - `GetCustomerByIdQueryHandler`: Loads customer by its identifier and maps to output DTO.
- **DTO Isolation Boundaries**: Raw HTTP models do not bleed into the business core. `CreateCustomerRequestDto` acts as the input schema, and `CustomerResponseDto` is returned using the `CustomerMapper` mapping logic.

---

## 2. Invariant Protections & Pipeline Validation
- **Validation Splitting**:
  - **Pipeline Validation** (`CreateCustomerCommandValidator`): Structural parameters checks (non-empty fields, email regex checks, required address fields) are performed before handlers execute.
  - **Domain Validation** (Aggregate): Business rules (requiring at least one primary contact and at least one billing address) are guarded inside `Customer.create()`.
- **Authorization Context Policy**: `CreateCustomerAuthPolicy` checks that `ExecutionContext.organizationId` matches the command's target `organizationId` parameter, enforcing strict organization isolation.
- **Uniqueness Guard**: Checks that `ICustomerRepository.exists` evaluates to `false` before creating a customer, avoiding duplicate customer numbers.

---

## 3. Test Suite Verification
All scenarios were executed successfully via Vitest:
- **Success Registration**: Creates a customer and maps contacts and addresses correctly.
- **Validation Failure**: Throws `ValidationException` when name or email parameters are malformed.
- **Auth Policy Failure**: Throws `AuthorizationException` when organization contexts do not match.
- **Uniqueness Enforcement**: Blocks duplicate registration attempts.
- **Get Customer Query**: Successfully reads customer states.
- **Results**: All 5 tests passed successfully.
