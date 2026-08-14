# Organization Bounded Context — Domain Design Guide

This document details the purpose, ubiquitous vocabulary, aggregate invariants, child entities, and domain events for the `organization` business module.

---

## 1. Context Boundaries & Purpose

The **Organization Module** manages the administrative and structural boundaries of companies, agencies, or freelancers using ACOS.
- **In-Scope**: Organization lifecycle, membership roster (members and roles), workspace definitions, organization settings, ownership transfers, invitations.
- **Out-of-Scope**: User authentication (Identity), invoices (Invoice), payment routes (Payment), and balances (Wallet).
- **Dependency Flow**: The Organization module references users strictly by their `UserId` (never injecting full User aggregates). Other operational modules (like Invoice and Payment) reference organizations strictly by their `OrganizationId`.

---

## 2. Ubiquitous Language

- **Organization**: A business entity (company, agency, or freelancer) that owns configurations and records in ACOS.
- **Member**: A User holding a defined role within an Organization.
- **Owner**: The member with final administrative authority over the Organization. Each organization must always have exactly one owner.
- **Invitation**: A request allowing a User to join an Organization.
- **Membership**: The relationship linking a User to an Organization.
- **Workspace**: The operational environment partition owned by the Organization.
- **Organization Settings**: Custom business configurations (e.g. default currency, timezone).

---

## 3. Aggregate Root and Child Entities

### `Organization` (Aggregate Root)
Serves as the transaction boundary for all membership, invitation, and business profile updates.

### `Member` (Child Entity)
Represents a user's affiliation and access role.
- Fields: `UserId`, `OrganizationRole`, `JoinedAt`, `MemberStatus`.

### `Invitation` (Child Entity)
Represents a pending invite.
- Fields: `InviteeEmail`, `InvitationToken`, `expiresAt`, `InvitationStatus`.

---

## 4. Aggregate Invariant Guards

The `Organization` aggregate root enforces the following business rules:
1. **Always One Owner**: Every organization must always have exactly one owner assigned.
2. **Unique Membership**: A user (`UserId`) cannot be added as a member of the same organization twice.
3. **Valid Ownership Transfer**: Ownership can only be transferred to a user who is currently an active member of that organization.
4. **Owner Protection**: The owner cannot be removed or suspended from membership without first transferring ownership to another active member.
5. **No Double-Invite**: An email address cannot have multiple pending/active invitations simultaneously.
6. **No Invitation Reuse**: Expired, revoked, or already accepted invitations cannot be processed.
7. **Inactive Block**: Organizations in a `Suspended`, `Archived`, or `Deleted` state cannot issue invitations or accept new members.

---

## 5. Domain Event Catalog

- `OrganizationCreated`: Emitted upon aggregate instantiation.
- `OrganizationActivated`: Emitted when account leaves pending state.
- `OrganizationSuspended`: Account locked out due to administration blocks.
- `OrganizationArchived`: Account frozen but preserved.
- `OrganizationDeleted`: Account marked for cascading resources archiving.
- `MemberInvited`: Invitation issued and logged.
- `MemberJoined`: Invitee accepts token and joins as a member.
- `MemberRemoved`: Member deleted from the organization.
- `OwnershipTransferred`: Owner status assigned to a new member.
- `OrganizationSettingsChanged`: Business timezone or default currency updated.
