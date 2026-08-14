import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetOrganizationByIdQuery } from "../queries/GetOrganizationByIdQuery.js";
import { OrganizationResponseDto } from "../dto/OrganizationResponseDto.js";
import { IOrganizationRepository } from "../../../business/organization/repositories/IOrganizationRepository.js";
import { OrganizationMapper } from "../mapping/OrganizationMapper.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";

/**
 * Use case handler reading an Organization by ID.
 */
export class GetOrganizationByIdQueryHandler
  implements IRequestHandler<GetOrganizationByIdQuery, ApplicationResult<OrganizationResponseDto>>
{
  constructor(
    private readonly repository: IOrganizationRepository,
    private readonly mapper: OrganizationMapper
  ) {}

  public async handle(
    request: GetOrganizationByIdQuery
  ): Promise<ApplicationResult<OrganizationResponseDto>> {
    const orgId = OrganizationId.from(request.id);
    const loadRes = await this.repository.findById(orgId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
