import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Value Objects
import { OrganizationId } from "../value-objects/OrganizationId.js";
import { OrganizationName } from "../value-objects/OrganizationName.js";
import { OrganizationSlug } from "../value-objects/OrganizationSlug.js";
import { OrganizationSettings } from "../value-objects/OrganizationSettings.js";
import { InvitationToken } from "../value-objects/InvitationToken.js";

// Entities
import { Member } from "../entities/Member.js";
import { Invitation } from "../entities/Invitation.js";

// Enums
import { OrganizationStatus } from "../enums/OrganizationStatus.js";
import { MemberStatus } from "../enums/MemberStatus.js";
import { OrganizationRole } from "../enums/OrganizationRole.js";
import { InvitationStatus } from "../enums/InvitationStatus.js";

// Identity References
import { UserId } from "../../identity/value-objects/UserId.js";
import { Email } from "../../identity/value-objects/Email.js";

// Domain Events
import { OrganizationCreated } from "../events/OrganizationCreated.js";
import { OrganizationActivated } from "../events/OrganizationActivated.js";
import { OrganizationSuspended } from "../events/OrganizationSuspended.js";
import { OrganizationArchived } from "../events/OrganizationArchived.js";
import { OrganizationDeleted } from "../events/OrganizationDeleted.js";
import { MemberInvited } from "../events/MemberInvited.js";
import { MemberJoined } from "../events/MemberJoined.js";
import { MemberRemoved } from "../events/MemberRemoved.js";
import { OwnershipTransferred } from "../events/OwnershipTransferred.js";
import { OrganizationSettingsChanged } from "../events/OrganizationSettingsChanged.js";

export interface OrganizationProps {
  name: OrganizationName;
  slug: OrganizationSlug;
  status: OrganizationStatus;
  settings: OrganizationSettings;
  ownerId: UserId;
  members: Map<string, Member>;
  invitations: Map<string, Invitation>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root guarding Organization membership, settings, and business profile lifecycle invariants.
 */
export class Organization extends AggregateRoot<OrganizationId> {
  private readonly props: OrganizationProps;

  private constructor(id: OrganizationId, props: OrganizationProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory method to create an Organization and register its owner.
   */
  public static create(
    id: OrganizationId,
    name: OrganizationName,
    slug: OrganizationSlug,
    ownerId: UserId,
    settings: OrganizationSettings
  ): Organization {
    const members = new Map<string, Member>();
    
    // Automatically join the owner as an active member
    const ownerMember = new Member(ownerId, {
      role: OrganizationRole.OWNER,
      joinedAt: new Date(),
      status: MemberStatus.ACTIVE
    });
    members.set(ownerId.value, ownerMember);

    const organization = new Organization(id, {
      name,
      slug,
      status: OrganizationStatus.ACTIVE,
      settings,
      ownerId,
      members,
      invitations: new Map(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    organization.addDomainEvent(new OrganizationCreated(id.value, ownerId));
    return organization;
  }

  // Getters
  public get name(): OrganizationName { return this.props.name; }
  public get slug(): OrganizationSlug { return this.props.slug; }
  public get status(): OrganizationStatus { return this.props.status; }
  public get settings(): OrganizationSettings { return this.props.settings; }
  public get ownerId(): UserId { return this.props.ownerId; }
  public get members(): readonly Member[] { return Object.freeze(Array.from(this.props.members.values())); }
  public get invitations(): readonly Invitation[] { return Object.freeze(Array.from(this.props.invitations.values())); }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Issues a new member invitation token.
   */
  public inviteMember(
    invitationId: UniqueEntityID,
    inviteeEmail: Email,
    token: InvitationToken,
    expiresAt: Date
  ): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Cannot invite members to an inactive organization."));
    }

    // Check for existing pending invitations for this email
    for (const invite of this.props.invitations.values()) {
      if (invite.inviteeEmail.equals(inviteeEmail) && invite.status === InvitationStatus.PENDING && !invite.isExpired) {
        return Result.fail(ResultError.conflict(`An active invitation is already pending for '${inviteeEmail.value}'.`));
      }
    }

    // Ensure they aren't already a member
    for (const member of this.props.members.values()) {
      // In a real application, we might check by matching user profile emails.
      // Here, we defer the double-membership lookup inside the accept flow via UserId.
    }

    const invitation = new Invitation(invitationId, {
      inviteeEmail,
      token,
      expiresAt,
      status: InvitationStatus.PENDING
    });

    this.props.invitations.set(invitationId.value, invitation);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new MemberInvited(this.id.value, inviteeEmail, token));
    return Result.ok();
  }

  /**
   * Accepts a pending invitation, mapping the invitee to a member.
   */
  public acceptInvitation(
    tokenValue: string,
    inviteeUserId: UserId,
    inviteeEmail: Email
  ): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Cannot accept invitation into an inactive organization."));
    }

    let foundInvite: Invitation | null = null;
    for (const invite of this.props.invitations.values()) {
      if (invite.token.value === tokenValue) {
        foundInvite = invite;
        break;
      }
    }

    if (!foundInvite) {
      return Result.fail(ResultError.notFound("Invitation not found."));
    }
    if (foundInvite.status !== InvitationStatus.PENDING) {
      return Result.fail(ResultError.conflict(`Invitation is already ${foundInvite.status}.`));
    }
    if (foundInvite.isExpired) {
      foundInvite.expire();
      return Result.fail(ResultError.validation("Invitation has expired."));
    }
    if (!foundInvite.inviteeEmail.equals(inviteeEmail)) {
      return Result.fail(ResultError.validation("Invitee email address mismatch."));
    }

    // Enforce unique membership
    if (this.props.members.has(inviteeUserId.value)) {
      return Result.fail(ResultError.conflict("User is already a member of this organization."));
    }

    foundInvite.accept();

    const member = new Member(inviteeUserId, {
      role: OrganizationRole.MEMBER,
      joinedAt: new Date(),
      status: MemberStatus.ACTIVE
    });

    this.props.members.set(inviteeUserId.value, member);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new MemberJoined(this.id.value, inviteeUserId));
    return Result.ok();
  }

  /**
   * Removes a member from membership.
   */
  public removeMember(userId: UserId, actorUserId: UserId): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Cannot modify membership in an inactive organization."));
    }

    const member = this.props.members.get(userId.value);
    if (!member) {
      return Result.fail(ResultError.notFound("Member not found."));
    }

    // Owner protection invariant check
    if (member.role === OrganizationRole.OWNER) {
      return Result.fail(
        ResultError.conflict("Cannot remove the owner. Transfer ownership to another member first.")
      );
    }

    const actor = this.props.members.get(actorUserId.value);
    if (!actor || (actor.role !== OrganizationRole.OWNER && actor.role !== OrganizationRole.ADMINISTRATOR)) {
      return Result.fail(ResultError.unauthorized("Only owners or administrators can remove members."));
    }

    member.updateStatus(MemberStatus.REMOVED);
    this.props.members.delete(userId.value);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new MemberRemoved(this.id.value, userId));
    return Result.ok();
  }

  /**
   * Transfers ownership to another active member.
   */
  public transferOwnership(newOwnerId: UserId, actorUserId: UserId): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Cannot transfer ownership in an inactive organization."));
    }

    if (this.ownerId.value !== actorUserId.value) {
      return Result.fail(ResultError.unauthorized("Only the current owner can transfer ownership."));
    }

    const targetMember = this.props.members.get(newOwnerId.value);
    if (!targetMember || targetMember.status !== MemberStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Ownership can only be transferred to an active member."));
    }

    const previousOwner = this.props.members.get(this.ownerId.value);
    if (previousOwner) {
      previousOwner.updateRole(OrganizationRole.ADMINISTRATOR);
    }

    targetMember.updateRole(OrganizationRole.OWNER);
    this.props.ownerId = newOwnerId;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OwnershipTransferred(this.id.value, actorUserId, newOwnerId));
    return Result.ok();
  }

  /**
   * Updates organizational preferences and settings.
   */
  public updateSettings(settings: OrganizationSettings): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Cannot update settings of an inactive organization."));
    }
    this.props.settings = settings;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrganizationSettingsChanged(this.id.value, settings));
    return Result.ok();
  }

  /**
   * Suspends the organization.
   */
  public suspend(reason: string): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE) {
      return Result.fail(ResultError.conflict("Only active organizations can be suspended."));
    }
    this.props.status = OrganizationStatus.SUSPENDED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrganizationSuspended(this.id.value, reason));
    return Result.ok();
  }

  /**
   * Reactivates a suspended organization.
   */
  public reactivate(): Result<void> {
    if (this.status !== OrganizationStatus.SUSPENDED) {
      return Result.fail(ResultError.conflict("Only suspended organizations can be reactivated."));
    }
    this.props.status = OrganizationStatus.ACTIVE;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrganizationActivated(this.id.value));
    return Result.ok();
  }

  /**
   * Archives the organization.
   */
  public archive(): Result<void> {
    if (this.status !== OrganizationStatus.ACTIVE && this.status !== OrganizationStatus.SUSPENDED) {
      return Result.fail(ResultError.conflict("Only active or suspended organizations can be archived."));
    }
    this.props.status = OrganizationStatus.ARCHIVED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrganizationArchived(this.id.value));
    return Result.ok();
  }

  /**
   * Permanently deletes the organization. Revokes all memberships.
   */
  public delete(): Result<void> {
    if (this.status === OrganizationStatus.DELETED) {
      return Result.ok();
    }

    this.props.status = OrganizationStatus.DELETED;
    this.props.members.forEach((m) => m.updateStatus(MemberStatus.REMOVED));
    this.props.members.clear();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrganizationDeleted(this.id.value));
    return Result.ok();
  }
}
