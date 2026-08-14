import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when an organization account is archived.
 */
export class OrganizationArchived extends BaseDomainEvent {
  constructor(organizationId: string) {
    super(organizationId, "Organization");
  }
}
