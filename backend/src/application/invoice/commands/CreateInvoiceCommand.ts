import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CreateInvoiceRequestDto } from "../dto/CreateInvoiceRequestDto.js";
import { InvoiceResponseDto } from "../dto/InvoiceResponseDto.js";

/**
 * Command to request registration of an Invoice in DRAFT status.
 */
export class CreateInvoiceCommand implements ICommand<ApplicationResult<InvoiceResponseDto>> {
  readonly requestType?: ApplicationResult<InvoiceResponseDto>;
  constructor(public readonly dto: CreateInvoiceRequestDto) {}
}
