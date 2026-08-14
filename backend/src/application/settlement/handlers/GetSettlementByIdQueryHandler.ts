import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetSettlementByIdQuery } from "../queries/GetSettlementByIdQuery.js";
import { SettlementResponseDto } from "../dto/SettlementResponseDto.js";
import { ISettlementRepository } from "../../../business/settlement/repositories/ISettlementRepository.js";
import { SettlementMapper } from "../mapping/SettlementMapper.js";
import { SettlementId } from "../../../business/settlement/value-objects/SettlementId.js";

/**
 * Use case handler reading a Settlement by ID.
 */
export class GetSettlementByIdQueryHandler
  implements IRequestHandler<GetSettlementByIdQuery, ApplicationResult<SettlementResponseDto>>
{
  constructor(
    private readonly repository: ISettlementRepository,
    private readonly mapper: SettlementMapper
  ) {}

  public async handle(
    request: GetSettlementByIdQuery
  ): Promise<ApplicationResult<SettlementResponseDto>> {
    const setId = SettlementId.from(request.id);
    const loadRes = await this.repository.findById(setId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
