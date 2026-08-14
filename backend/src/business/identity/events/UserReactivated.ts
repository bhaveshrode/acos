import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a suspended User account is unlocked and reactivated.
 */
export class UserReactivated extends BaseDomainEvent {
  constructor(userId: string) {
    super(userId, "User");
  }
}
