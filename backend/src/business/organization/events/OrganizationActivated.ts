import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when an organization account status is set to active.
 */
export class OrganizationActivated extends BaseDomainEvent {
  constructor(organizationId: string) {
    super(organizationId, "Organization");
  }
}
