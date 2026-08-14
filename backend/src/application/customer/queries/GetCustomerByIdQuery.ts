import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CustomerResponseDto } from "../dto/CustomerResponseDto.js";

/**
 * Query to request loading a Customer by its unique ID.
 */
export class GetCustomerByIdQuery implements IQuery<ApplicationResult<CustomerResponseDto>> {
  readonly requestType?: ApplicationResult<CustomerResponseDto>;
  constructor(public readonly id: string) {}
}
