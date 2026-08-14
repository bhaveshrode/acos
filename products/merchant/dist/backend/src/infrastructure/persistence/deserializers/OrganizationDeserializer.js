import { OrganizationName } from "../../../business/organization/value-objects/OrganizationName.js";
import { OrganizationSlug } from "../../../business/organization/value-objects/OrganizationSlug.js";
import { OrganizationSettings } from "../../../business/organization/value-objects/OrganizationSettings.js";
import { Currency } from "../../../business/organization/value-objects/Currency.js";
import { TimeZone } from "../../../business/organization/value-objects/TimeZone.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Email } from "../../../business/identity/value-objects/Email.js";
import { Member } from "../../../business/organization/entities/Member.js";
import { Invitation } from "../../../business/organization/entities/Invitation.js";
import { InvitationToken } from "../../../business/organization/value-objects/InvitationToken.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Reconstructs OrganizationProps domain structure from OrganizationSnapshot persistence models.
 */
export class OrganizationDeserializer {
    static deserialize(snapshot) {
        const members = new Map();
        for (const m of snapshot.members) {
            const uId = new UserId(m.userId);
            members.set(m.id, new Member(uId, {
                role: m.role,
                joinedAt: m.joinedAt,
                status: m.status
            }));
        }
        const invitations = new Map();
        for (const i of snapshot.invitations) {
            invitations.set(i.id, new Invitation(new UniqueEntityID(i.id), {
                inviteeEmail: Email.create(i.email).value,
                token: InvitationToken.create(i.token).value,
                expiresAt: i.expiresAt,
                status: i.status
            }));
        }
        return {
            name: OrganizationName.create(snapshot.name).value,
            slug: OrganizationSlug.create(snapshot.slug).value,
            status: snapshot.status,
            settings: OrganizationSettings.create(Currency.create(snapshot.settings.defaultCurrency).value, TimeZone.create(snapshot.settings.timeZone).value, snapshot.settings.invoiceNumberFormat).value,
            ownerId: new UserId(snapshot.ownerId),
            members,
            invitations,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt
        };
    }
}
