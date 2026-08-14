import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { PaymentResponseDto } from "../dto/PaymentResponseDto.js";

/**
 * Query to request loading Payment details by ID.
 */
export class GetPaymentByIdQuery implements IQuery<ApplicationResult<PaymentResponseDto>> {
  readonly requestType?: ApplicationResult<PaymentResponseDto>;
  constructor(public readonly id: string) {}
}
