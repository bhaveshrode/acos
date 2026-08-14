import { INotificationFactory } from "./INotificationFactory.js";
import { NotificationRegistry } from "./NotificationRegistry.js";
import { NotificationResolver } from "./NotificationResolver.js";
import { NotificationQueue } from "./NotificationQueue.js";
import { NotificationDispatcher } from "./NotificationDispatcher.js";
import { NotificationScheduler } from "./NotificationScheduler.js";
import { NotificationManager } from "./NotificationManager.js";
import { NotificationRenderer } from "./NotificationRenderer.js";
import { NotificationContainer } from "./NotificationContainer.js";
import { NotificationStack } from "./NotificationStack.js";
import { NotificationAnimator } from "./NotificationAnimator.js";
import { NotificationEventDispatcher } from "./NotificationEventDispatcher.js";
import { NotificationObserver } from "./NotificationObserver.js";

/**
 * NotificationsFactory implementing standard INotificationFactory composition roots.
 */
export class NotificationsFactory implements INotificationFactory {
  public static createRegistry(): NotificationRegistry {
    return new NotificationRegistry();
  }

  public static createResolver(registry: NotificationRegistry): NotificationResolver {
    return new NotificationResolver(registry);
  }

  public static createQueue(): NotificationQueue {
    return new NotificationQueue();
  }

  public static createDispatcher(queue: NotificationQueue): NotificationDispatcher {
    return new NotificationDispatcher(queue);
  }

  public static createScheduler(dispatcher: NotificationDispatcher): NotificationScheduler {
    return new NotificationScheduler(dispatcher);
  }

  public static createManager(queue: NotificationQueue): NotificationManager {
    return new NotificationManager(queue);
  }

  public static createRenderer(): NotificationRenderer {
    return new NotificationRenderer();
  }

  public static createContainer(): NotificationContainer {
    return new NotificationContainer();
  }

  public static createStack(): NotificationStack {
    return new NotificationStack();
  }

  public static createAnimator(): NotificationAnimator {
    return new NotificationAnimator();
  }

  public static createEventDispatcher(): NotificationEventDispatcher {
    return new NotificationEventDispatcher();
  }

  public static createObserver(dispatcher: NotificationEventDispatcher): NotificationObserver {
    return new NotificationObserver(dispatcher);
  }

  public createRegistry(): NotificationRegistry {
    return NotificationsFactory.createRegistry();
  }

  public createResolver(registry: NotificationRegistry): NotificationResolver {
    return NotificationsFactory.createResolver(registry);
  }

  public createQueue(): NotificationQueue {
    return NotificationsFactory.createQueue();
  }

  public createDispatcher(queue: NotificationQueue): NotificationDispatcher {
    return NotificationsFactory.createDispatcher(queue);
  }

  public createScheduler(dispatcher: NotificationDispatcher): NotificationScheduler {
    return NotificationsFactory.createScheduler(dispatcher);
  }

  public createManager(queue: NotificationQueue): NotificationManager {
    return NotificationsFactory.createManager(queue);
  }

  public createRenderer(): NotificationRenderer {
    return NotificationsFactory.createRenderer();
  }

  public createContainer(): NotificationContainer {
    return NotificationsFactory.createContainer();
  }

  public createStack(): NotificationStack {
    return NotificationsFactory.createStack();
  }

  public createAnimator(): NotificationAnimator {
    return NotificationsFactory.createAnimator();
  }

  public createEventDispatcher(): NotificationEventDispatcher {
    return NotificationsFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: NotificationEventDispatcher): NotificationObserver {
    return NotificationsFactory.createObserver(dispatcher);
  }
}
