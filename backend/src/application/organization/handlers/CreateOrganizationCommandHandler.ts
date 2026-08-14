import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CreateOrganizationCommand } from "../commands/CreateOrganizationCommand.js";
import { OrganizationResponseDto } from "../dto/OrganizationResponseDto.js";
import { IOrganizationRepository } from "../../../business/organization/repositories/IOrganizationRepository.js";
import { OrganizationMapper } from "../mapping/OrganizationMapper.js";

// Domain imports
import { Organization } from "../../../business/organization/aggregates/Organization.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { OrganizationName } from "../../../business/organization/value-objects/OrganizationName.js";
import { OrganizationSlug } from "../../../business/organization/value-objects/OrganizationSlug.js";
import { OrganizationSettings } from "../../../business/organization/value-objects/OrganizationSettings.js";
import { Currency } from "../../../business/organization/value-objects/Currency.js";
import { TimeZone } from "../../../business/organization/value-objects/TimeZone.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";

/**
 * Use case handler registering an Organization.
 */
export class CreateOrganizationCommandHandler
  implements IRequestHandler<CreateOrganizationCommand, ApplicationResult<OrganizationResponseDto>>
{
  constructor(
    private readonly repository: IOrganizationRepository,
    private readonly mapper: OrganizationMapper
  ) {}

  public async handle(
    request: CreateOrganizationCommand
  ): Promise<ApplicationResult<OrganizationResponseDto>> {
    const { dto } = request;

    // Instantiate and validate Domain Value Objects
    const nameRes = OrganizationName.create(dto.name);
    if (nameRes.isFailure) return ApplicationResult.failure(nameRes.error.message);

    const slugRes = OrganizationSlug.create(dto.slug);
    if (slugRes.isFailure) return ApplicationResult.failure(slugRes.error.message);

    // Verify slug uniqueness
    const existsRes = await this.repository.exists(slugRes.value);
    if (existsRes.isFailure) return ApplicationResult.failure(existsRes.error.message);
    if (existsRes.value) {
      return ApplicationResult.failure(
        `Organization with slug '${dto.slug}' already exists.`
      );
    }

    const ownerId = UserId.from(dto.ownerId);

    // Set defaults
    const currencyRes = Currency.create(dto.currency || "USD");
    if (currencyRes.isFailure) return ApplicationResult.failure(currencyRes.error.message);

    const timeZoneRes = TimeZone.create("UTC");
    if (timeZoneRes.isFailure) return ApplicationResult.failure(timeZoneRes.error.message);

    const settingsRes = OrganizationSettings.create(currencyRes.value, timeZoneRes.value);
    if (settingsRes.isFailure) return ApplicationResult.failure(settingsRes.error.message);

    // Create Organization
    const organization = Organization.create(
      OrganizationId.generate(),
      nameRes.value,
      slugRes.value,
      ownerId,
      settingsRes.value
    );

    // Save aggregate state
    const saveRes = await this.repository.save(organization);
    if (saveRes.isFailure) return ApplicationResult.failure(saveRes.error.message);

    return ApplicationResult.success(this.mapper.map(organization));
  }
}
