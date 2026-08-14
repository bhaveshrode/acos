import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CreateOrganizationRequestDto } from "../dto/CreateOrganizationRequestDto.js";
import { OrganizationResponseDto } from "../dto/OrganizationResponseDto.js";

/**
 * Command to request creation of an Organization.
 */
export class CreateOrganizationCommand
  implements ICommand<ApplicationResult<OrganizationResponseDto>>
{
  readonly requestType?: ApplicationResult<OrganizationResponseDto>;
  constructor(public readonly dto: CreateOrganizationRequestDto) {}
}
