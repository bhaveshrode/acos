import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a User's email verification is completed.
 */
export class EmailVerified extends BaseDomainEvent {
    email;
    constructor(userId, email) {
        super(userId, "User");
        this.email = email;
    }
}
