import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { CommunicationPreferences } from "../value-objects/CommunicationPreferences.js";

/**
 * Domain event emitted when a customer's channel notification options are updated.
 */
export class CommunicationPreferencesChanged extends BaseDomainEvent {
  public readonly preferences: CommunicationPreferences;

  constructor(customerId: string, preferences: CommunicationPreferences) {
    super(customerId, "Customer");
    this.preferences = preferences;
  }
}
