import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetPaymentByIdQuery } from "../queries/GetPaymentByIdQuery.js";
import { PaymentResponseDto } from "../dto/PaymentResponseDto.js";
import { IPaymentRepository } from "../../../business/payment/repositories/IPaymentRepository.js";
import { PaymentMapper } from "../mapping/PaymentMapper.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";

/**
 * Use case handler reading a Payment by ID.
 */
export class GetPaymentByIdQueryHandler
  implements IRequestHandler<GetPaymentByIdQuery, ApplicationResult<PaymentResponseDto>>
{
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly mapper: PaymentMapper
  ) {}

  public async handle(
    request: GetPaymentByIdQuery
  ): Promise<ApplicationResult<PaymentResponseDto>> {
    const payId = PaymentId.from(request.id);
    const loadRes = await this.repository.findById(payId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
