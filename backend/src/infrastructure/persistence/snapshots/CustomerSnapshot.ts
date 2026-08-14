/**
 * Infrastructure snapshot model for the Customer aggregate.
 */
export interface CustomerSnapshot {
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
  addresses: Array<{
    id: string;
    line1: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    line2: string | null;
    type: string;
  }>;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isPrimary: boolean;
  }>;
  notes: Array<{
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
  }>;
  communicationPreferences: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
