import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Domain event emitted when the primary contact person for a customer is updated.
 */
export class PrimaryContactChanged extends BaseDomainEvent {
  public readonly newPrimaryContactId: UniqueEntityID;

  constructor(customerId: string, newPrimaryContactId: UniqueEntityID) {
    super(customerId, "Customer");
    this.newPrimaryContactId = newPrimaryContactId;
  }
}
