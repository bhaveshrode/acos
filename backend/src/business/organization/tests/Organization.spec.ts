import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { OrganizationId } from "../value-objects/OrganizationId.js";
import { OrganizationName } from "../value-objects/OrganizationName.js";
import { OrganizationSlug } from "../value-objects/OrganizationSlug.js";
import { OrganizationSettings } from "../value-objects/OrganizationSettings.js";
import { InvitationToken } from "../value-objects/InvitationToken.js";
import { TimeZone } from "../value-objects/TimeZone.js";
import { Currency } from "../value-objects/Currency.js";
import { Member } from "../entities/Member.js";
import { Invitation } from "../entities/Invitation.js";
import { Organization } from "../aggregates/Organization.js";
import { OrganizationStatus } from "../enums/OrganizationStatus.js";
import { MemberStatus } from "../enums/MemberStatus.js";
import { OrganizationRole } from "../enums/OrganizationRole.js";
import { InvitationStatus } from "../enums/InvitationStatus.js";

import { UserId } from "../../identity/value-objects/UserId.js";
import { Email } from "../../identity/value-objects/Email.js";

import { MembershipPolicy } from "../services/MembershipPolicy.js";
import { OrganizationPolicy } from "../services/OrganizationPolicy.js";
import { InvitationService } from "../services/InvitationService.js";

describe("Organization Module Unit Tests (Tasks 12.2 - 12.5)", () => {
  const defaultCurrency = Currency.create("USD").value;
  const defaultTimeZone = TimeZone.create("Europe/London").value;
  const defaultSettings = OrganizationSettings.create(defaultCurrency, defaultTimeZone).value;

  describe("Value Objects & Enums", () => {
    it("should validate and normalize OrganizationSlug", () => {
      const slugRes = OrganizationSlug.create("  Acme-Corp-123  ");
      expect(slugRes.isSuccess).toBe(true);
      expect(slugRes.value.value).toBe("acme-corp-123");

      const badSlug = OrganizationSlug.create("acme corp");
      expect(badSlug.isFailure).toBe(true);
    });

    it("should validate ISO Currency codes", () => {
      expect(Currency.create("eur").isSuccess).toBe(true);
      expect(Currency.create("EURO").isFailure).toBe(true);
      expect(Currency.create("123").isFailure).toBe(true);
    });

    it("should validate TimeZone strings using Intl engine", () => {
      expect(TimeZone.create("America/New_York").isSuccess).toBe(true);
      expect(TimeZone.create("invalid-zone").isFailure).toBe(true);
    });
  });

  describe("Organization Aggregate & Membership Invariants", () => {
    const ownerId = UserId.generate();
    const orgName = OrganizationName.create("Acme Corp").value;
    const orgSlug = OrganizationSlug.create("acme-corp").value;

    it("should create organization with owner as the first member", () => {
      const org = Organization.create(
        OrganizationId.generate(),
        orgName,
        orgSlug,
        ownerId,
        defaultSettings
      );

      expect(org.status).toBe(OrganizationStatus.ACTIVE);
      expect(org.ownerId.equals(ownerId)).toBe(true);
      expect(org.members).toHaveLength(1);
      expect(org.members[0].userId.equals(ownerId)).toBe(true);
      expect(org.members[0].role).toBe(OrganizationRole.OWNER);
      expect(org.domainEvents).toHaveLength(1);
      expect(org.domainEvents[0].eventName).toBe("OrganizationCreated");
    });

    it("should handle the invitation lifecycle correctly", () => {
      const org = Organization.create(
        OrganizationId.generate(),
        orgName,
        orgSlug,
        ownerId,
        defaultSettings
      );

      const inviteeEmail = Email.create("bob@acos.io").value;
      const inviteId = new UniqueEntityID();
      const inviteToken = InvitationToken.create("invite_hash_xyz").value;
      const expiresAt = new Date(Date.now() + 60000);

      // Issue invitation
      const inviteRes = org.inviteMember(inviteId, inviteeEmail, inviteToken, expiresAt);
      expect(inviteRes.isSuccess).toBe(true);
      expect(org.invitations).toHaveLength(1);
      expect(org.invitations[0].inviteeEmail.equals(inviteeEmail)).toBe(true);
      expect(org.invitations[0].status).toBe(InvitationStatus.PENDING);

      // Accept invitation
      const inviteeUserId = UserId.generate();
      const acceptRes = org.acceptInvitation("invite_hash_xyz", inviteeUserId, inviteeEmail);
      
      expect(acceptRes.isSuccess).toBe(true);
      expect(org.invitations[0].status).toBe(InvitationStatus.ACCEPTED);
      expect(org.members).toHaveLength(2);
      
      const newMember = org.members.find(m => m.userId.equals(inviteeUserId));
      expect(newMember).toBeDefined();
      expect(newMember!.role).toBe(OrganizationRole.MEMBER);
      expect(newMember!.status).toBe(MemberStatus.ACTIVE);
    });

    it("should enforce owner removal prevention invariant", () => {
      const org = Organization.create(
        OrganizationId.generate(),
        orgName,
        orgSlug,
        ownerId,
        defaultSettings
      );

      // Attempt to remove owner
      const removeRes = org.removeMember(ownerId, ownerId);
      expect(removeRes.isFailure).toBe(true);
      expect(removeRes.error.message).toContain("Cannot remove the owner.");
    });

    it("should transfer ownership successfully to active members", () => {
      const org = Organization.create(
        OrganizationId.generate(),
        orgName,
        orgSlug,
        ownerId,
        defaultSettings
      );

      // Join new member
      const memberId = UserId.generate();
      const inviteId = new UniqueEntityID();
      const inviteToken = InvitationToken.create("hash").value;
      org.inviteMember(inviteId, Email.create("bob@acos.io").value, inviteToken, new Date(Date.now() + 60000));
      org.acceptInvitation("hash", memberId, Email.create("bob@acos.io").value);
      org.clearDomainEvents();

      // Transfer ownership
      const transferRes = org.transferOwnership(memberId, ownerId);
      expect(transferRes.isSuccess).toBe(true);
      expect(org.ownerId.equals(memberId)).toBe(true);
      
      const previousOwnerMember = org.members.find(m => m.userId.equals(ownerId));
      const newOwnerMember = org.members.find(m => m.userId.equals(memberId));
      
      expect(previousOwnerMember!.role).toBe(OrganizationRole.ADMINISTRATOR);
      expect(newOwnerMember!.role).toBe(OrganizationRole.OWNER);

      expect(org.domainEvents).toHaveLength(1);
      expect(org.domainEvents[0].eventName).toBe("OwnershipTransferred");
    });
  });

  describe("Domain Services and Policies", () => {
    it("MembershipPolicy should enforce maximum member limits", () => {
      const org = Organization.create(
        OrganizationId.generate(),
        OrganizationName.create("Cap Corp").value,
        OrganizationSlug.create("cap-corp").value,
        UserId.generate(),
        defaultSettings
      );

      const policy = new MembershipPolicy(1); // Max capacity is 1 (owner)
      const res = policy.validateCanJoin(org, UserId.generate());
      expect(res.isFailure).toBe(true);
      expect(res.error.message).toContain("maximum member limit");
    });

    it("OrganizationPolicy should validate transfers and deletes", () => {
      const oId = UserId.generate();
      const org = Organization.create(
        OrganizationId.generate(),
        OrganizationName.create("Cap Corp").value,
        OrganizationSlug.create("cap-corp").value,
        oId,
        defaultSettings
      );
      const policy = new OrganizationPolicy();

      // Transfer fails if user is not a member
      const badTransfer = policy.validateOwnershipTransfer(org, UserId.generate());
      expect(badTransfer.isFailure).toBe(true);

      // Deletes fail if actor is not the owner
      const badDelete = policy.validateCanDelete(org, UserId.generate());
      expect(badDelete.isFailure).toBe(true);
    });

    it("InvitationService should issue invitation cleanly", () => {
      const oId = UserId.generate();
      const org = Organization.create(
        OrganizationId.generate(),
        OrganizationName.create("Invite Corp").value,
        OrganizationSlug.create("invite-corp").value,
        oId,
        defaultSettings
      );
      const service = new InvitationService();
      
      const res = service.createInvitation(org, Email.create("new@acos.io").value, () => "test_token_123");
      expect(res.isSuccess).toBe(true);
      expect(org.invitations).toHaveLength(1);
      expect(org.invitations[0].token.value).toBe("test_token_123");
    });
  });
});
