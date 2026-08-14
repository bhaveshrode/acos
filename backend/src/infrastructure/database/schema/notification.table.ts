/**
 * Physical database schema mapping interface for notification records.
 */
export interface NotificationTable {
  id: string;
  organizationId: string;
  reference: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  scheduledTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
