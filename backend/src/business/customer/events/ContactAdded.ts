import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Domain event emitted when a new Contact is added to a Customer profile.
 */
export class ContactAdded extends BaseDomainEvent {
  public readonly contactId: UniqueEntityID;

  constructor(customerId: string, contactId: UniqueEntityID) {
    super(customerId, "Customer");
    this.contactId = contactId;
  }
}
