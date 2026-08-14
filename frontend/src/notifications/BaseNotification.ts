import { INotification } from "./INotification.js";
import { NotificationContext } from "./NotificationContext.js";
import { NotificationState } from "./NotificationState.js";

/**
 * BaseNotification implementing dismissals and timeouts.
 */
export abstract class BaseNotification implements INotification {
  public state: NotificationState = NotificationState.Queued;

  constructor(
    public readonly context: NotificationContext,
    public readonly message: string
  ) {}

  public abstract render(): string;

  public dismiss(): void {
    this.state = NotificationState.Dismissed;
    this.onDismiss();
  }

  protected onDismiss(): void {}
}
