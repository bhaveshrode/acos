import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NotificationState } from "../NotificationState.js";
import { NotificationMetadata } from "../NotificationMetadata.js";
import { NotificationContext } from "../NotificationContext.js";
import { BaseNotification } from "../BaseNotification.js";
import { NotificationDescriptor } from "../NotificationDescriptor.js";
import { NotificationRegistry } from "../NotificationRegistry.js";
import { NotificationResolver } from "../NotificationResolver.js";
import { SuccessNotification } from "../SuccessNotification.js";
import { InformationNotification } from "../InformationNotification.js";
import { WarningNotification } from "../WarningNotification.js";
import { ErrorNotification } from "../ErrorNotification.js";
import { ProgressNotification } from "../ProgressNotification.js";
import { ActionNotification } from "../ActionNotification.js";
import { NotificationQueue } from "../NotificationQueue.js";
import { NotificationDispatcher } from "../NotificationDispatcher.js";
import { NotificationScheduler } from "../NotificationScheduler.js";
import { NotificationManager } from "../NotificationManager.js";
import { NotificationRenderer } from "../NotificationRenderer.js";
import { NotificationContainer } from "../NotificationContainer.js";
import { NotificationStack } from "../NotificationStack.js";
import { NotificationAnimator } from "../NotificationAnimator.js";
import { NotificationEvent } from "../NotificationEvent.js";
import { NotificationEventDispatcher } from "../NotificationEventDispatcher.js";
import { NotificationObserver } from "../NotificationObserver.js";
import { NotificationsFactory } from "../NotificationsFactory.js";
import { RenderResult } from "../../components/RenderResult.js";

class TestNotification extends BaseNotification {
  public render(): string {
    return `<div class="test-alert">${this.message}</div>`;
  }
}

describe("Frontend Notifications Component Unit Tests (Task 74.8)", () => {
  let context: NotificationContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    const meta: NotificationMetadata = { id: "test-n", severity: "info" };
    context = new NotificationContext(meta);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Contexts & Models", () => {
    it("should instantiate NotificationContext and freeze arrays", () => {
      const meta: NotificationMetadata = { id: "n-1", severity: "success" };
      const ctx = new NotificationContext(meta, ["alert-1"], ["queued-1"], ["email"]);

      expect(ctx.metadata.id).toBe("n-1");
      expect(ctx.activeNotifications).toContain("alert-1");
      expect(ctx.displayQueue).toContain("queued-1");
      expect(ctx.channels).toContain("email");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.activeNotifications)).toBe(true);
      expect(Object.isFrozen(ctx.displayQueue)).toBe(true);
      expect(Object.isFrozen(ctx.channels)).toBe(true);
    });

    it("should manage BaseNotification lifecycle states", () => {
      const alert = new TestNotification(context, "Welcome");
      expect(alert.state).toBe(NotificationState.Queued);

      alert.dismiss();
      expect(alert.state).toBe(NotificationState.Dismissed);
    });
  });

  describe("Notification Definitions & Registry", () => {
    it("should register descriptors and freeze NotificationRegistry", () => {
      const registry = new NotificationRegistry();
      const meta: NotificationMetadata = { id: "n-1", severity: "info" };
      const descriptor = new NotificationDescriptor(meta, TestNotification, "tmpl-1");

      registry.register(descriptor);
      expect(registry.get("n-1")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "NotificationRegistry is frozen and cannot accept further notifications"
      );
    });

    it("should resolve notifications in NotificationResolver", () => {
      const registry = new NotificationRegistry();
      const meta: NotificationMetadata = { id: "n-1", severity: "info" };
      const descriptor = new NotificationDescriptor(meta, TestNotification);
      registry.register(descriptor);

      const resolver = new NotificationResolver(registry);
      expect(resolver.resolve("n-1")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "Notification schema with identifier missing is not registered"
      );
    });
  });

  describe("Notification Types", () => {
    it("should render SuccessNotification markup", () => {
      const alert = new SuccessNotification(context, "Completed successfully");
      expect(alert.render()).toBe('<div class="notification success">✅ Completed successfully</div>');
    });

    it("should render InformationNotification markup", () => {
      const alert = new InformationNotification(context, "System update");
      expect(alert.render()).toBe('<div class="notification info">ℹ️ System update</div>');
    });

    it("should render WarningNotification markup", () => {
      const alert = new WarningNotification(context, "Low memory alert");
      expect(alert.render()).toBe('<div class="notification warning">⚠️ Low memory alert</div>');
    });

    it("should render ErrorNotification markup", () => {
      const alert = new ErrorNotification(context, "Connection failed");
      expect(alert.render()).toBe('<div class="notification error">❌ Connection failed</div>');
    });

    it("should render ProgressNotification markup", () => {
      const alert = new ProgressNotification(context, "Downloading file", 45);
      expect(alert.render()).toBe('<div class="notification progress">⏳ Downloading file (45%)</div>');
    });

    it("should render ActionNotification and trigger action callback", () => {
      const mockAction = vi.fn();
      const alert = new ActionNotification(context, "Delete user?", mockAction);
      expect(alert.render()).toBe('<div class="notification action">🔔 Delete user? <button class="action-btn">Action</button></div>');

      alert.triggerAction();
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Delivery & Queue Management", () => {
    it("should order queue items by priority in NotificationQueue", () => {
      const queue = new NotificationQueue();
      const n1 = new TestNotification(context, "Low priority");
      const n2 = new TestNotification(context, "High priority");

      queue.enqueue(n1, 1);
      queue.enqueue(n2, 10);

      expect(queue.size()).toBe(2);
      expect(queue.dequeue()).toBe(n2);
      expect(queue.dequeue()).toBe(n1);
    });

    it("should dispatch and schedule items in Dispatcher and Scheduler", () => {
      const queue = new NotificationQueue();
      const dispatcher = new NotificationDispatcher(queue);
      const scheduler = new NotificationScheduler(dispatcher);

      const n1 = new TestNotification(context, "Delayed alert");
      scheduler.schedule(n1, 100, 5);

      expect(queue.size()).toBe(0);
      vi.advanceTimersByTime(100);
      expect(queue.size()).toBe(1);
      expect(queue.dequeue()).toBe(n1);
    });

    it("should manage lifecycles in NotificationManager", () => {
      const queue = new NotificationQueue();
      const manager = new NotificationManager(queue);
      const alert = new TestNotification(context, "Direct alert");

      queue.enqueue(alert);
      const active = manager.processQueue();
      expect(active).toBe(alert);
      expect(alert.state).toBe(NotificationState.Displaying);
      expect(manager.getActiveNotifications()).toContain(alert);

      manager.dismiss(alert);
      expect(alert.state).toBe(NotificationState.Dismissed);
      expect(manager.getActiveNotifications()).not.toContain(alert);
    });
  });

  describe("Rendering & Presentation", () => {
    it("should render outputs in NotificationRenderer", () => {
      const alert = new TestNotification(context, "Renderer check");
      const renderer = new NotificationRenderer();
      const res = renderer.render(alert);

      expect(res).toBeInstanceOf(RenderResult);
      expect(res.output).toBe('<div class="test-alert">Renderer check</div>');
      expect(res.diagnostics.notificationId).toBe("test-n");
    });

    it("should manage visible collections in NotificationContainer", () => {
      const container = new NotificationContainer();
      const alert = new TestNotification(context, "ACOS alert");

      container.add(alert);
      expect(container.getNotifications()).toContain(alert);

      container.remove(alert);
      expect(container.getNotifications()).not.toContain(alert);
    });

    it("should group by placement coordinates in NotificationStack", () => {
      const stack = new NotificationStack();
      const alert = new TestNotification(context, "Top alert");

      stack.pushToPlacement("TopRight", alert);
      expect(stack.getForPlacement("TopRight")).toContain(alert);
      expect(stack.getForPlacement("BottomLeft")).toEqual([]);
    });

    it("should support animator transitions in NotificationAnimator", () => {
      const animator = new NotificationAnimator();
      expect(animator.getIsAnimating()).toBe(false);

      const animFn = vi.fn().mockImplementation(() => {
        expect(animator.getIsAnimating()).toBe(true);
      });

      animator.animate(animFn);
      expect(animator.getIsAnimating()).toBe(false);
      expect(animFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch lifecycle events to observers", () => {
      const dispatcher = new NotificationEventDispatcher();
      const observer = new NotificationObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.notificationId).toBe("n-100");
        expect(ev.type).toBe("display");
      });

      dispatcher.dispatch(new NotificationEvent("n-100", "display"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new NotificationEvent("n-100", "display"));
      expect(count).toBe(1);
    });
  });

  describe("Factory", () => {
    it("should build factory components", () => {
      const factory = new NotificationsFactory();
      const reg = factory.createRegistry();
      expect(reg).toBeInstanceOf(NotificationRegistry);
    });
  });
});
