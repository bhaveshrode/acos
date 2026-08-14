import { IMapper } from "../../foundation/mapping/IMapper.js";
import { Organization } from "../../../business/organization/aggregates/Organization.js";
import { OrganizationResponseDto } from "../dto/OrganizationResponseDto.js";

/**
 * Mapper helper converting Organization aggregate entities into presentation OrganizationResponseDto models.
 */
export class OrganizationMapper implements IMapper<Organization, OrganizationResponseDto> {
  public map(source: Organization): OrganizationResponseDto {
    return {
      id: source.id.value,
      name: source.name.value,
      slug: source.slug.value,
      status: source.status,
      ownerId: source.ownerId.value,
      settings: {
        currency: source.settings.defaultCurrency?.value || "USD",
        fiscalYearStartMonth: 1,
        allowInvites: true
      },
      members: source.members.map((member) => ({
        userId: member.id.value,
        role: member.role,
        status: member.status
      })),
      createdAt: source.createdAt.toISOString()
    };
  }
}
