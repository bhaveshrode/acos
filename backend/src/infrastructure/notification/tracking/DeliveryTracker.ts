export interface DeliveryLog {
  notificationId: string;
  type: "email" | "sms";
  to: string;
  status: "SUCCESS" | "FAILED";
  error?: string;
  timestamp: Date;
}

/**
 * Audit log recording message carrier delivery attempt milestones.
 */
export class DeliveryTracker {
  private static logs: DeliveryLog[] = [];

  /**
   * Appends a delivery result to the audit log.
   */
  public static track(
    notificationId: string,
    type: "email" | "sms",
    to: string,
    status: "SUCCESS" | "FAILED",
    error?: string
  ): void {
    this.logs.push({
      notificationId,
      type,
      to,
      status,
      error,
      timestamp: new Date()
    });
  }

  /**
   * Retrieves the historical logs list.
   */
  public static getLogs(): DeliveryLog[] {
    return this.logs;
  }

  /**
   * Resets delivery metrics history.
   */
  public static clear(): void {
    this.logs = [];
  }
}
