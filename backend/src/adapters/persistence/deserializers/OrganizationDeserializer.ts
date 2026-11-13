import { OrganizationSnapshot } from "../snapshots/OrganizationSnapshot.js";
import { OrganizationProps } from "../../../business/organization/aggregates/Organization.js";
import { OrganizationName } from "../../../business/organization/value-objects/OrganizationName.js";
import { OrganizationSlug } from "../../../business/organization/value-objects/OrganizationSlug.js";
import { OrganizationStatus } from "../../../business/organization/enums/OrganizationStatus.js";
import { OrganizationSettings } from "../../../business/organization/value-objects/OrganizationSettings.js";
import { Currency } from "../../../business/organization/value-objects/Currency.js";
import { TimeZone } from "../../../business/organization/value-objects/TimeZone.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { Member } from "../../../business/organization/entities/Member.js";
import { Invitation } from "../../../business/organization/entities/Invitation.js";
import { OrganizationRole } from "../../../business/organization/enums/OrganizationRole.js";
import { MemberStatus } from "../../../business/organization/enums/MemberStatus.js";
import { InvitationStatus } from "../../../business/organization/enums/InvitationStatus.js";
import { InvitationToken } from "../../../business/organization/value-objects/InvitationToken.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs OrganizationProps domain structure from OrganizationSnapshot persistence models.
 */
export class OrganizationDeserializer {
  public static deserialize(snapshot: OrganizationSnapshot): OrganizationProps {
    const members = new Map<string, Member>();
    for (const m of snapshot.members) {
      const uId = new UserId(m.userId);
      members.set(
        m.id,
        new Member(uId, {
          role: m.role as OrganizationRole,
          joinedAt: m.joinedAt,
          status: m.status as MemberStatus
        })
      );
    }

    const invitations = new Map<string, Invitation>();
    for (const i of snapshot.invitations) {
      invitations.set(
        i.id,
        new Invitation(new UniqueEntityID(i.id), {
          inviteeEmail: Email.create(i.email).value,
          token: InvitationToken.create(i.token).value,
          expiresAt: i.expiresAt,
          status: i.status as InvitationStatus
        })
      );
    }

    return {
      name: OrganizationName.create(snapshot.name).value,
      slug: OrganizationSlug.create(snapshot.slug).value,
      status: snapshot.status as OrganizationStatus,
      settings: OrganizationSettings.create(
        Currency.create(snapshot.settings.defaultCurrency).value,
        TimeZone.create(snapshot.settings.timeZone).value,
        snapshot.settings.invoiceNumberFormat
      ).value,
      ownerId: new UserId(snapshot.ownerId),
      members,
      invitations,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
