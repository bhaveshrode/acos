/**
 * DTO carrying parameters for creating a new Organization.
 */
export interface CreateOrganizationRequestDto {
  name: string;
  slug: string;
  ownerId: string;
  currency?: string;
  fiscalYearStartMonth?: number;
}
