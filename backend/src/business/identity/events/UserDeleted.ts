import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a User account is permanently deleted.
 */
export class UserDeleted extends BaseDomainEvent {
  constructor(userId: string) {
    super(userId, "User");
  }
}
