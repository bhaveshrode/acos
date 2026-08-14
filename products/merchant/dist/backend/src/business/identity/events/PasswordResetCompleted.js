import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a User successfully resets their password.
 */
export class PasswordResetCompleted extends BaseDomainEvent {
    constructor(userId) {
        super(userId, "User");
    }
}
