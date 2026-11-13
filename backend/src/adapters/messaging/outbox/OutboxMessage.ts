/**
 * Represents the database record of an Event stored in the Outbox table.
 */
export interface OutboxMessage {
  id: string;
  eventType: string;
  payload: string;
  status: "PENDING" | "PROCESSED" | "FAILED";
  retryCount: number;
  createdAt: Date;
  processedAt: Date | null;
  error: string | null;
}
