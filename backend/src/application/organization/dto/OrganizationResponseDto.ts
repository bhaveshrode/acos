/**
 * DTO representing detailed Organization properties for presentation layers.
 */
export interface OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerId: string;
  settings: {
    currency: string;
    fiscalYearStartMonth: number;
    allowInvites: boolean;
  };
  members: Array<{
    userId: string;
    role: string;
    status: string;
  }>;
  createdAt: string;
}
