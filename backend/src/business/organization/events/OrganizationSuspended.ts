import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when an organization account is suspended.
 */
export class OrganizationSuspended extends BaseDomainEvent {
  public readonly reason: string;

  constructor(organizationId: string, reason: string) {
    super(organizationId, "Organization");
    this.reason = reason;
  }
}
