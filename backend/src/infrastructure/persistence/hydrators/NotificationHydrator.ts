import { Notification } from "../../../business/notification/aggregates/Notification.js";
import { NotificationId } from "../../../business/notification/value-objects/NotificationId.js";
import { NotificationSnapshot } from "../snapshots/NotificationSnapshot.js";
import { NotificationDeserializer } from "../deserializers/NotificationDeserializer.js";

/**
 * Reconstructs the complete Notification aggregate root from historical snapshot state.
 */
export class NotificationHydrator {
  public static hydrate(snapshot: NotificationSnapshot): Notification {
    const props = NotificationDeserializer.deserialize(snapshot);
    const id = new NotificationId(snapshot.id);
    return new (Notification as any)(id, props) as Notification;
  }
}
