import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { UserId } from "../../identity/value-objects/UserId.js";

/**
 * Domain event emitted when a member is removed from an organization.
 */
export class MemberRemoved extends BaseDomainEvent {
  public readonly userId: UserId;

  constructor(organizationId: string, userId: UserId) {
    super(organizationId, "Organization");
    this.userId = userId;
  }
}
