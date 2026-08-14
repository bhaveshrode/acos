import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { InvoiceResponseDto } from "../dto/InvoiceResponseDto.js";

/**
 * Query to request loading Invoice details by ID.
 */
export class GetInvoiceByIdQuery implements IQuery<ApplicationResult<InvoiceResponseDto>> {
  readonly requestType?: ApplicationResult<InvoiceResponseDto>;
  constructor(public readonly id: string) {}
}
