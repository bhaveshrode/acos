import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { SubmitPaymentRequestDto } from "../dto/SubmitPaymentRequestDto.js";
import { PaymentResponseDto } from "../dto/PaymentResponseDto.js";

/**
 * Command to request recording of a Payment transaction.
 */
export class SubmitPaymentCommand implements ICommand<ApplicationResult<PaymentResponseDto>> {
  readonly requestType?: ApplicationResult<PaymentResponseDto>;
  constructor(public readonly dto: SubmitPaymentRequestDto) {}
}
