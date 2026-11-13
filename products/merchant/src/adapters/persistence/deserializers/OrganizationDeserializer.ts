import { OrganizationSnapshot } from "../snapshots/OrganizationSnapshot.js";
import {
  OrganizationName,
  OrganizationSlug,
  OrganizationStatus,
  OrganizationSettings,
  Currency,
  TimeZone,
  UserId,
  Email,
  Member,
  Invitation,
  OrganizationRole,
  MemberStatus,
  InvitationStatus,
  InvitationToken,
  UniqueEntityID
} from "acos-backend";

/**
 * Rebuilds the aggregate state from a persisted snapshot.
 */
export class OrganizationDeserializer {
  public static deserialize(snapshot: OrganizationSnapshot) {
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
