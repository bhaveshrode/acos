import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a User account is locked out or suspended.
 */
export class UserSuspended extends BaseDomainEvent {
  public readonly reason: string;

  constructor(userId: string, reason: string) {
    super(userId, "User");
    this.reason = reason;
  }
}
