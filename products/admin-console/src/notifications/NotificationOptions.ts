/**
 * NotificationOptions configuring display durations, positioning stacks, and priorities.
 */
export interface NotificationOptions {
  duration?: number;
  position?: "TopRight" | "TopLeft" | "BottomRight" | "BottomLeft" | "Center";
  animation?: boolean;
  priority?: number;
  allowDuplicates?: boolean;
}
