/**
 * DTO representing detailed Customer details for presentation layers.
 */
export interface CustomerResponseDto {
  id: string;
  organizationId: string;
  customerNumber: string;
  name: string;
  companyName: string | null;
  status: string;
  taxIdentifier: string | null;
  phoneNumber: string | null;
  website: string | null;
  email: string | null;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isPrimary: boolean;
  }>;
  addresses: Array<{
    id: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
