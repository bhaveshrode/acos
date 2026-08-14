/**
 * DTO representing detailed Notification status properties.
 */
export interface NotificationResponseDto {
  id: string;
  organizationId: string;
  reference: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  scheduledTime: string;
  recipients: Array<{
    userId: string | null;
    email: string | null;
    phone: string | null;
    channelPreferences: string[];
  }>;
  createdAt: string;
}
