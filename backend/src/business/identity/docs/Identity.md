# Identity Bounded Context — Domain Design Guide

This document details the purpose, ubiquitous vocabulary, aggregate invariants, status state machine, and domain events for the `identity` business module.

---

## 1. Context Boundaries & Purpose

The **Identity Module** is solely responsible for verifying who a user is (authentication, credentials verification, session maintenance, and identity deactivation).
- **In-Scope**: User registrations, password lifecycle, token/session management, email verification, suspension status.
- **Out-of-Scope**: Organizations, teams, roles, permissions (authorization), invoicing, customer ledgers, payment processing, or workflow assignments.
- **Dependency Flow**: The Identity context is independent of all other business contexts. Other business contexts reference users strictly by their `UserId` (never by injecting user properties directly).

---

## 2. Ubiquitous Language

- **User**: A physical entity capable of authenticating. Identified by a unique `UserId`.
- **Credential**: Secrets (e.g., password hash) proving the user's claimed identity.
- **Authentication**: The process of validating a credential.
- **Session**: Represents an active, authenticated window of interaction between a user and ACOS.
- **Account**: The persistent record of identity.
- **Verification**: Evidence (e.g. verified email) confirming user credentials are valid.
- **Suspension**: A temporary state restricting authentication.
- **Deactivation**: A permanent administrative disabling of an account.

---

## 3. The `User` Aggregate Root

The `User` aggregate root is the single entry point for modifying user state.

### Invariants Protected
1. **Plaintext Password Ban**: Plaintext passwords must never be stored on the aggregate root or leaked to repositories. Only hashed credentials (`PasswordHash`) are allowed.
2. **State Transition Validation**: Transitions between `UserStatus` must be validated. For example, a `Deleted` user cannot be `Suspended` or `Reactivated`.
3. **Session Restrictions**: Sessions can only be added or renewed if the user is in the `Active` status.
4. **Token Uniqueness**: Reset tokens and verification tokens are single-use. Once verified, they are cleared.

---

## 4. User Status State Machine

Allowed state transitions:

```
                  ┌──────────────────────┐
                  │ PendingVerification  │
                  └──────────┬───────────┘
                             │ (verifyEmail)
                             ▼
                        ┌──────────┐
         ┌─────────────►│  Active  │◄─────────────┐
         │              └────┬─────┘              │
         │ (reactivate)      │                    │ (reactivate)
         │                   │ (suspend)          │
         │                   ▼                    │
    ┌────┴────┐         ┌──────────┐         ┌────┴─────┐
    │Suspended│         │ Suspended│         │ Disabled │
    └─────────┘         └────┬─────┘         └──────────┘
                             │ (disable/delete)
                             ▼
                        ┌──────────┐
                        │ Deleted  │
                        └──────────┘
```

- **PendingVerification**: Initial registration state.
- **Active**: Email verified; permitted to log in.
- **Suspended**: Temporarily blocked due to login violations. Can be reactivated.
- **Disabled**: Manually deactivated by administrators.
- **Deleted**: Permanent removal. Cannot log in or transition to other states.

---

## 5. Domain Event Catalog

Events are dispatched via the `EventDispatcher` to decouple other modules (e.g. notifications):
- `UserRegistered`: Raised upon sign-up (carries verification tokens).
- `EmailVerified`: Raised when verification is complete.
- `UserLoggedIn`: Raised on successful login.
- `UserLoggedOut`: Raised on manual session termination.
- `PasswordChanged`: Raised on credential rotation.
- `PasswordResetRequested`: Raised to trigger password reset notification delivery.
- `PasswordResetCompleted`: Raised when credentials are successfully recovered.
- `UserSuspended`: Account locked out.
- `UserReactivated`: Account locks cleared.
- `UserDeleted`: Account permanently removed.
