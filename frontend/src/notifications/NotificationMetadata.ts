/**
 * NotificationMetadata tracking severity, categorization, and source details.
 */
export interface NotificationMetadata {
  id: string;
  severity: "success" | "info" | "warning" | "error";
  category?: string;
  source?: string;
  timestamp?: number;
  groupingId?: string;
}
