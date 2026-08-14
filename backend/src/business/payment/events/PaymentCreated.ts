import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { PaymentAmount } from "../value-objects/PaymentAmount.js";

/**
 * Domain event emitted when a new Payment aggregate root is created.
 */
export class PaymentCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;
  public readonly customerId: CustomerId;
  public readonly amount: PaymentAmount;

  constructor(
    paymentId: string,
    organizationId: OrganizationId,
    customerId: CustomerId,
    amount: PaymentAmount
  ) {
    super(paymentId, "Payment");
    this.organizationId = organizationId;
    this.customerId = customerId;
    this.amount = amount;
  }
}
