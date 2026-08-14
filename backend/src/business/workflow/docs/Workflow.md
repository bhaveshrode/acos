# Workflow Bounded Context — Domain Design Guide

This document details the purpose, ubiquitous vocabulary, aggregate invariants, child entities, and domain events for the `workflow` business module.

---

## 1. Context Boundaries & Purpose

The **Workflow Module** coordinates and tracks multi-context business processes, approvals, deadlines, and escalations.
- **In-Scope**: Process state transitions, task assignments, due dates, reminder timers, escalations, comments, and action histories.
- **Out-of-Scope**: Direct modification of financial documents (Invoices, Payments) or ledger balances (Accounts Receivable).
- **Guiding Rule**: The Workflow aggregate owns coordination. It reacts to context events and orchestrates human/automated reviews without owning business financial data.

---

## 2. Ubiquitous Language

- **Workflow**: Coordinated sequence of business task execution steps.
- **Workflow Definition**: The process blueprint template.
- **Workflow Instance**: An active running process.
- **Task**: Unit of work mapped to a specific assignee or deadline.
- **Assignment**: The user, role, or department responsible for completing a task.
- **Approval**: Manual decision allowing workflow instance completion.
- **Escalation**: Escalating routing priority when deadlines expire.
- **Deadline**: Date/Time task limit.

---

## 3. Aggregate Root and Child Entities

### `Workflow` (Aggregate Root)
Serves as the consistency boundary protecting tasks completion status, assignment records, comments, and escalation progression.

### `WorkflowTask` (Child Entity)
Represents a process step.
- Fields: `Title`, `Assignee`, `DueDate`, `Status`, `Required`, `CompletedAt`, `RejectionReason`.

### `WorkflowHistory` (Child Entity)
Execution audit log.
- Fields: `Action`, `Actor`, `Timestamp`.

### `WorkflowAssignment` (Child Entity)
Assignee info.

### `WorkflowComment` (Child Entity)
Notes logged during execution.

---

## 4. Aggregate Invariant Guards

The `Workflow` aggregate root enforces the following business rules:
1. **Organization Context**: Workflow belongs to exactly one `OrganizationId`.
2. **Task Roster Bounds**: Must contain at least one task step to run.
3. **Status Immutability**: Completed or cancelled instances are locked and immutable.
4. **Task Completion Guards**: A task cannot be completed twice, and completions are blocked on failed/cancelled/expired instances.
5. **Rejection Justifications**: Rejected tasks must record a non-empty explanation reason.
6. **Escalation Progress**: Escalation levels can only step upward (None → Level1 → Level2 → Level3).
7. **Unfinished Work checks**: Instance cannot transition to Completed status while any required tasks remain unfinished.
8. **Expiration lock**: Expired instances reject task completions.

---

## 5. Domain Event Catalog

- `WorkflowCreated`: Instance initialized.
- `WorkflowStarted`: Executions start.
- `TaskAssigned`: Task mapped to user.
- `TaskCompleted`: Task marked finished.
- `TaskRejected`: Task rejected with reason.
- `WorkflowEscalated`: Escalation level stepped up.
- `WorkflowCompleted`: All required tasks finished.
- `WorkflowCancelled`: Instance cancelled.
- `WorkflowExpired`: deadline exceeded.
- `WorkflowFailed`: Process failure logged.
