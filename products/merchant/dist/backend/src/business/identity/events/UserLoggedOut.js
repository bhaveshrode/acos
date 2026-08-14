import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a User terminates their session.
 */
export class UserLoggedOut extends BaseDomainEvent {
    sessionId;
    constructor(userId, sessionId) {
        super(userId, "User");
        this.sessionId = sessionId;
    }
}
