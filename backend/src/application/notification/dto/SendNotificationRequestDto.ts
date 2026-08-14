/**
 * DTO carrying parameters for sending a new Notification.
 */
export interface SendNotificationRequestDto {
  organizationId: string;
  reference: string;
  subject: string;
  body: string;
  priority: string;
  scheduledTime?: string;
  maxRetries?: number;
  retryIntervalSeconds?: number;
  recipients: Array<{
    userId?: string;
    email?: string;
    phone?: string;
    channelPreferences: string[];
  }>;
}
