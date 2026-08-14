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
 * INotificationFactory interface defining notification composition roots contract.
 */
export interface INotificationFactory {
  createRegistry(): NotificationRegistry;
  createResolver(registry: NotificationRegistry): NotificationResolver;
  createQueue(): NotificationQueue;
  createDispatcher(queue: NotificationQueue): NotificationDispatcher;
  createScheduler(dispatcher: NotificationDispatcher): NotificationScheduler;
  createManager(queue: NotificationQueue): NotificationManager;
  createRenderer(): NotificationRenderer;
  createContainer(): NotificationContainer;
  createStack(): NotificationStack;
  createAnimator(): NotificationAnimator;
  createEventDispatcher(): NotificationEventDispatcher;
  createObserver(dispatcher: NotificationEventDispatcher): NotificationObserver;
}
