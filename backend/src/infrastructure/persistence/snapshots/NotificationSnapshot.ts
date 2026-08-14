/**
 * Infrastructure snapshot model for the Notification aggregate.
 */
export interface NotificationSnapshot {
  id: string;
  organizationId: string;
  reference: string;
  subject: string;
  body: string;
  priority: string;
  status: string;
  scheduledTime: Date;
  maxRetries: number;
  retryIntervalSeconds: number;
  recipients: Array<{
    id: string;
    userId: string | null;
    email: string | null;
    phone: string | null;
    channelPreferences: string[];
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
  }>;
  deliveryAttempts: Array<{
    id: string;
    channel: string;
    timestamp: Date;
    providerResponse: string | null;
    status: string;
    retryCount: number;
    metadata: Record<string, string>;
  }>;
  readReceipts: Array<{
    id: string;
    readAt: Date;
    channel: string;
    readerId: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
