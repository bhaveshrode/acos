import { Notification } from "../aggregates/Notification.js";
import { NotificationId } from "../value-objects/NotificationId.js";
import { NotificationReference } from "../value-objects/NotificationReference.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for Notification aggregate root operations.
 */
export interface INotificationRepository {
  /**
   * Retrieves a Notification by its unique ID.
   */
  findById(id: NotificationId): Promise<Result<Notification>>;

  /**
   * Retrieves a Notification by its unique business reference.
   */
  findByReference(orgId: OrganizationId, ref: NotificationReference): Promise<Result<Notification>>;

  /**
   * Retrieves all Notifications sent to a specific user.
   */
  findByRecipient(orgId: OrganizationId, userId: UserId): Promise<Result<Notification[]>>;

  /**
   * Retrieves all scheduled or pending notifications ready to be sent.
   */
  findPending(orgId: OrganizationId): Promise<Result<Notification[]>>;

  /**
   * Saves or updates a Notification aggregate in persistence.
   */
  save(notification: Notification): Promise<Result<void>>;

  /**
   * Permanently deletes a Notification aggregate.
   */
  delete(id: NotificationId): Promise<Result<void>>;
}
