import { IMapper } from "../../foundation/mapping/IMapper.js";
import { Payment } from "../../../business/payment/aggregates/Payment.js";
import { PaymentResponseDto } from "../dto/PaymentResponseDto.js";

/**
 * Mapper helper converting Payment entities into presentation PaymentResponseDto models.
 */
export class PaymentMapper implements IMapper<Payment, PaymentResponseDto> {
  public map(source: Payment): PaymentResponseDto {
    return {
      id: source.id.value,
      organizationId: source.organizationId.value,
      customerId: source.customerId.value,
      reference: source.reference.value,
      amount: source.amount.amount,
      currency: source.amount.currency,
      status: source.status,
      method: source.method.type,
      transactionHash: source.transactionHash ? source.transactionHash.value : null,
      allocations: source.allocations.map((alloc) => ({
        id: alloc.id.value,
        invoiceId: alloc.invoiceId.value,
        allocatedAmount: alloc.allocatedAmount.amount,
        currency: alloc.allocatedAmount.currency,
        status: alloc.status
      })),
      createdAt: source.createdAt.toISOString()
    };
  }
}
