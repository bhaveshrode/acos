import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Notification identifier.
 */
export class NotificationId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new NotificationId.
   */
  public static override generate(): NotificationId {
    return new NotificationId();
  }

  /**
   * Creates a NotificationId from a string UUID representation.
   */
  public static override from(value: string): NotificationId {
    return new NotificationId(value);
  }
}
