import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetCustomerByIdQuery } from "../queries/GetCustomerByIdQuery.js";
import { CustomerResponseDto } from "../dto/CustomerResponseDto.js";
import { ICustomerRepository } from "../../../business/customer/repositories/ICustomerRepository.js";
import { CustomerMapper } from "../mapping/CustomerMapper.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";

/**
 * Use case handler reading a Customer aggregate by ID.
 */
export class GetCustomerByIdQueryHandler
  implements IRequestHandler<GetCustomerByIdQuery, ApplicationResult<CustomerResponseDto>>
{
  constructor(
    private readonly repository: ICustomerRepository,
    private readonly mapper: CustomerMapper
  ) {}

  public async handle(request: GetCustomerByIdQuery): Promise<ApplicationResult<CustomerResponseDto>> {
    const custId = CustomerId.from(request.id);
    const loadRes = await this.repository.findById(custId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
