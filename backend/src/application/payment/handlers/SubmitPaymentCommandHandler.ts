import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { SubmitPaymentCommand } from "../commands/SubmitPaymentCommand.js";
import { PaymentResponseDto } from "../dto/PaymentResponseDto.js";
import { IPaymentRepository } from "../../../business/payment/repositories/IPaymentRepository.js";
import { PaymentMapper } from "../mapping/PaymentMapper.js";

// Domain imports
import { Payment } from "../../../business/payment/aggregates/Payment.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { PaymentReference } from "../../../business/payment/value-objects/PaymentReference.js";
import { PaymentAmount } from "../../../business/payment/value-objects/PaymentAmount.js";
import { PaymentMethod } from "../../../business/payment/value-objects/PaymentMethod.js";
import { PaymentMethodType } from "../../../business/payment/enums/PaymentMethodType.js";
import { TransactionHash } from "../../../business/payment/value-objects/TransactionHash.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";

/**
 * Use case handler submitting a Payment.
 */
export class SubmitPaymentCommandHandler
  implements IRequestHandler<SubmitPaymentCommand, ApplicationResult<PaymentResponseDto>>
{
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly mapper: PaymentMapper
  ) {}

  public async handle(
    request: SubmitPaymentCommand
  ): Promise<ApplicationResult<PaymentResponseDto>> {
    const { dto } = request;

    const orgId = OrganizationId.from(dto.organizationId);
    const custId = CustomerId.from(dto.customerId);

    // Validate reference uniqueness
    const refRes = PaymentReference.create(dto.reference);
    if (refRes.isFailure) return ApplicationResult.failure(refRes.error.message);

    const existsRes = await this.repository.findByReference(orgId, refRes.value);
    if (existsRes.isSuccess && existsRes.value) {
      return ApplicationResult.failure(
        `Payment reference '${dto.reference}' already exists in this organization.`
      );
    }

    // Money instance for Payment amount
    const moneyRes = Money.create(dto.amount, dto.currency);
    if (moneyRes.isFailure) return ApplicationResult.failure(moneyRes.error.message);

    // PaymentAmount validation
    const amountRes = PaymentAmount.create(moneyRes.value);
    if (amountRes.isFailure) return ApplicationResult.failure(amountRes.error.message);

    // PaymentMethod details
    const methodRes = PaymentMethod.create(dto.method as PaymentMethodType, "Direct settlement");
    if (methodRes.isFailure) return ApplicationResult.failure(methodRes.error.message);

    // Initial Invoice allocations
    const invId = InvoiceId.from(dto.invoiceId);
    const allocMoneyRes = Money.create(dto.allocatedAmount, dto.currency);
    if (allocMoneyRes.isFailure) return ApplicationResult.failure(allocMoneyRes.error.message);

    // Parse transaction hash if provided
    let txHash: TransactionHash | undefined;
    if (dto.transactionHash) {
      const hashRes = TransactionHash.create(dto.transactionHash);
      if (hashRes.isFailure) return ApplicationResult.failure(hashRes.error.message);
      txHash = hashRes.value;
    }

    // Create Payment aggregate
    const paymentRes = Payment.create(
      PaymentId.generate(),
      orgId,
      custId,
      refRes.value,
      amountRes.value,
      methodRes.value,
      invId,
      allocMoneyRes.value,
      {
        transactionHash: txHash
      }
    );

    if (paymentRes.isFailure) return ApplicationResult.failure(paymentRes.error.message);
    const payment = paymentRes.value;

    // Save and commit Payment aggregate
    const saveRes = await this.repository.save(payment);
    if (saveRes.isFailure) return ApplicationResult.failure(saveRes.error.message);

    return ApplicationResult.success(this.mapper.map(payment));
  }
}
