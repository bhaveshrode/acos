/**
 * DTO carrying parameters for creating a new Customer.
 */
export interface CreateCustomerRequestDto {
  organizationId: string;
  customerNumber: string;
  name: string;
  companyName?: string;
  taxIdentifier?: string;
  phoneNumber?: string;
  website?: string;
  email?: string;
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
