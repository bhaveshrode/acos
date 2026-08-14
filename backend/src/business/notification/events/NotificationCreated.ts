import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";

/**
 * Domain event emitted when a new Notification aggregate is created.
 */
export class NotificationCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;

  constructor(notificationId: string, organizationId: OrganizationId) {
    super(notificationId, "Notification");
    this.organizationId = organizationId;
  }
}
