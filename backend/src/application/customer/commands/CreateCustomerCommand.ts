import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CreateCustomerRequestDto } from "../dto/CreateCustomerRequestDto.js";
import { CustomerResponseDto } from "../dto/CustomerResponseDto.js";

/**
 * Command to request registration of a new Customer.
 */
export class CreateCustomerCommand implements ICommand<ApplicationResult<CustomerResponseDto>> {
  readonly requestType?: ApplicationResult<CustomerResponseDto>;
  constructor(public readonly dto: CreateCustomerRequestDto) {}
}
