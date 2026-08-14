import { NotificationContext } from "./NotificationContext.js";
import { NotificationState } from "./NotificationState.js";

/**
 * INotification interface defining framework-agnostic notification message contracts.
 */
export interface INotification {
  context: NotificationContext;
  state: NotificationState;
  message: string;
  render(): string;
  dismiss(): void;
}
