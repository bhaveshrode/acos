import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { OrganizationResponseDto } from "../dto/OrganizationResponseDto.js";

/**
 * Query to request loading an Organization details by ID.
 */
export class GetOrganizationByIdQuery
  implements IQuery<ApplicationResult<OrganizationResponseDto>>
{
  readonly requestType?: ApplicationResult<OrganizationResponseDto>;
  constructor(public readonly id: string) {}
}
