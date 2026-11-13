/**
 * Infrastructure snapshot model for the Organization aggregate.
 */
export interface OrganizationSnapshot {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings: {
    defaultCurrency: string;
    timeZone: string;
    invoiceNumberFormat: string;
  };
  ownerId: string;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: Date;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    token: string;
    expiresAt: Date;
    status: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
