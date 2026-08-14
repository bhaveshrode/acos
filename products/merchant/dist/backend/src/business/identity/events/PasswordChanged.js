import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a User rotates their password.
 */
export class PasswordChanged extends BaseDomainEvent {
    constructor(userId) {
        super(userId, "User");
    }
}
