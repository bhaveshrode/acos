import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when an organization account is permanently deleted.
 */
export class OrganizationDeleted extends BaseDomainEvent {
  constructor(organizationId: string) {
    super(organizationId, "Organization");
  }
}
