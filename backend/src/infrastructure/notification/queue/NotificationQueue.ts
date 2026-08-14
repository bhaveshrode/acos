export type QueuedNotification =
  | { id: string; type: "email"; data: any; status: string; attempts: number; error?: string }
  | { id: string; type: "sms"; data: any; status: string; attempts: number; error?: string };

/**
 * In-memory FIFO queue structure preserving notification tasks.
 */
export class NotificationQueue {
  private static items: QueuedNotification[] = [];

  /**
   * Appends an email/sms task to the queue and returns its unique job identifier.
   */
  public static enqueue(type: "email" | "sms", data: any): string {
    const id = Math.random().toString(36).substring(2, 9);
    this.items.push({
      id,
      type,
      data,
      status: "PENDING",
      attempts: 0
    });
    return id;
  }

  /**
   * Retrieves all pending or failed notification jobs.
   */
  public static getPending(): QueuedNotification[] {
    return this.items.filter((i) => i.status === "PENDING" || i.status === "FAILED");
  }

  /**
   * Updates status metrics of a specific notification task.
   */
  public static updateStatus(id: string, status: string, error?: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = status;
      if (status === "FAILED") {
        item.attempts++;
      }
      if (error) {
        item.error = error;
      }
    }
  }

  /**
   * Empties the queue (useful for test resets).
   */
  public static clear(): void {
    this.items = [];
  }
}
