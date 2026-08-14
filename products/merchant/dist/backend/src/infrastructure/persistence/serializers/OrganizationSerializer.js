/**
 * Serializes Organization aggregate root into OrganizationSnapshot models.
 */
export class OrganizationSerializer {
    static serialize(aggregate) {
        // Get internal properties via proxy getters
        const snapshot = {
            id: aggregate.id.value,
            name: aggregate.name.value,
            slug: aggregate.slug.value,
            status: aggregate.status,
            settings: {
                defaultCurrency: aggregate.settings.defaultCurrency.value,
                timeZone: aggregate.settings.timeZone.value,
                invoiceNumberFormat: aggregate.settings.invoiceNumberFormat
            },
            ownerId: aggregate.ownerId.value,
            members: aggregate.members.map((m) => ({
                id: m.id.value,
                userId: m.userId.value,
                role: m.role,
                status: m.status,
                joinedAt: m.joinedAt
            })),
            invitations: aggregate.invitations.map((i) => ({
                id: i.id.value,
                email: i.inviteeEmail.value,
                role: "MEMBER",
                token: i.token.value,
                expiresAt: i.expiresAt,
                status: i.status
            })),
            createdAt: aggregate.createdAt,
            updatedAt: aggregate.updatedAt
        };
        return snapshot;
    }
}
