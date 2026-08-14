import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { ReceivableResponseDto } from "../dto/ReceivableResponseDto.js";

/**
 * Query to request loading Accounts Receivable details by ID.
 */
export class GetReceivableByIdQuery implements IQuery<ApplicationResult<ReceivableResponseDto>> {
  readonly requestType?: ApplicationResult<ReceivableResponseDto>;
  constructor(public readonly id: string) {}
}
