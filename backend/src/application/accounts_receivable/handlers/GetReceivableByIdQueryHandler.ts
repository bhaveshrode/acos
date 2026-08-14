import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetReceivableByIdQuery } from "../queries/GetReceivableByIdQuery.js";
import { ReceivableResponseDto } from "../dto/ReceivableResponseDto.js";
import { IAccountsReceivableRepository } from "../../../business/accounts_receivable/repositories/IAccountsReceivableRepository.js";
import { ReceivableMapper } from "../mapping/ReceivableMapper.js";
import { ReceivableAccountId } from "../../../business/accounts_receivable/value-objects/ReceivableAccountId.js";

/**
 * Use case handler reading an Accounts Receivable profile by ID.
 */
export class GetReceivableByIdQueryHandler
  implements IRequestHandler<GetReceivableByIdQuery, ApplicationResult<ReceivableResponseDto>>
{
  constructor(
    private readonly repository: IAccountsReceivableRepository,
    private readonly mapper: ReceivableMapper
  ) {}

  public async handle(
    request: GetReceivableByIdQuery
  ): Promise<ApplicationResult<ReceivableResponseDto>> {
    const accId = ReceivableAccountId.from(request.id);
    const loadRes = await this.repository.findById(accId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
