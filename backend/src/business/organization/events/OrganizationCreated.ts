import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { UserId } from "../../identity/value-objects/UserId.js";

/**
 * Domain event emitted when a new Organization is registered, assigning its owner.
 */
export class OrganizationCreated extends BaseDomainEvent {
  public readonly ownerId: UserId;

  constructor(organizationId: string, ownerId: UserId) {
    super(organizationId, "Organization");
    this.ownerId = ownerId;
  }
}
