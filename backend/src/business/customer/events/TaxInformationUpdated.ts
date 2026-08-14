import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { TaxIdentifier } from "../value-objects/TaxIdentifier.js";

/**
 * Domain event emitted when a customer's tax registration or numbers are changed.
 */
export class TaxInformationUpdated extends BaseDomainEvent {
  public readonly taxIdentifier: TaxIdentifier | null;

  constructor(customerId: string, taxIdentifier: TaxIdentifier | null) {
    super(customerId, "Customer");
    this.taxIdentifier = taxIdentifier;
  }
}
