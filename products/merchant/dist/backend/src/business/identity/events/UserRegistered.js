import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a new User account is registered in ACOS.
 */
export class UserRegistered extends BaseDomainEvent {
    email;
    verificationToken;
    constructor(userId, email, verificationToken) {
        super(userId, "User");
        this.email = email;
        this.verificationToken = verificationToken;
    }
}
