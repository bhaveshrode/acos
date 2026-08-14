import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../payment/value-objects/PaymentId.js";
import { SettlementAmount } from "../value-objects/SettlementAmount.js";

/**
 * Domain event emitted when a new Settlement aggregate is created.
 */
export class SettlementCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;
  public readonly paymentId: PaymentId;
  public readonly amount: SettlementAmount;

  constructor(
    settlementId: string,
    organizationId: OrganizationId,
    paymentId: PaymentId,
    amount: SettlementAmount
  ) {
    super(settlementId, "Settlement");
    this.organizationId = organizationId;
    this.paymentId = paymentId;
    this.amount = amount;
  }
}
