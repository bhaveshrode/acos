import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { UserId } from "../../identity/value-objects/UserId.js";

/**
 * Domain event emitted when organization ownership is transferred.
 */
export class OwnershipTransferred extends BaseDomainEvent {
  public readonly previousOwnerId: UserId;
  public readonly newOwnerId: UserId;

  constructor(organizationId: string, previousOwnerId: UserId, newOwnerId: UserId) {
    super(organizationId, "Organization");
    this.previousOwnerId = previousOwnerId;
    this.newOwnerId = newOwnerId;
  }
}
