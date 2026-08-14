/**
 * Physical database schema mapping interface for customer records.
 */
export interface CustomerTable {
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
  createdAt: Date;
  updatedAt: Date;
}
