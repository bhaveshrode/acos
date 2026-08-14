import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { SessionId } from "../value-objects/SessionId.js";

/**
 * Domain event emitted when a User terminates their session.
 */
export class UserLoggedOut extends BaseDomainEvent {
  public readonly sessionId: SessionId;

  constructor(userId: string, sessionId: SessionId) {
    super(userId, "User");
    this.sessionId = sessionId;
  }
}
