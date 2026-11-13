import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AnalyticsState } from "../AnalyticsState.js";
import { AnalyticsMetadata } from "../AnalyticsMetadata.js";
import { AnalyticsContext } from "../AnalyticsContext.js";
import { BaseAnalyticsProvider } from "../BaseAnalyticsProvider.js";
import { AnalyticsDescriptor } from "../AnalyticsDescriptor.js";
import { AnalyticsRegistry } from "../AnalyticsRegistry.js";
import { AnalyticsResolver } from "../AnalyticsResolver.js";
import { AnalyticsEvent } from "../AnalyticsEvent.js";
import { AnalyticsEventGroup } from "../AnalyticsEventGroup.js";
import { AnalyticsEventRegistry } from "../AnalyticsEventRegistry.js";
import { EventTracker } from "../EventTracker.js";
import { EventDispatcher } from "../EventDispatcher.js";
import { EventBatcher } from "../EventBatcher.js";
import { AnalyticsProcessor } from "../AnalyticsProcessor.js";
import { AnalyticsScheduler } from "../AnalyticsScheduler.js";
import { AnalyticsUploader } from "../AnalyticsUploader.js";
import { SessionTracker } from "../SessionTracker.js";
import { PerformanceTracker } from "../PerformanceTracker.js";
import { ErrorTracker } from "../ErrorTracker.js";
import { UsageMetricsCollector } from "../UsageMetricsCollector.js";
import { ConsentManager } from "../ConsentManager.js";
import { PrivacyFilter } from "../PrivacyFilter.js";
import { AnalyticsPolicy } from "../AnalyticsPolicy.js";
import { AnalyticsLifecycleEvent } from "../AnalyticsLifecycleEvent.js";
import { AnalyticsEventDispatcher } from "../AnalyticsEventDispatcher.js";
import { AnalyticsObserver } from "../AnalyticsObserver.js";
import { AnalyticsFactory } from "../AnalyticsFactory.js";

class TestAnalyticsProvider extends BaseAnalyticsProvider {
  public flushedEvents: AnalyticsEvent[] = [];

  protected async onFlush(events: AnalyticsEvent[]): Promise<void> {
    this.flushedEvents.push(...events);
  }
}

describe("Frontend Analytics Component Unit Tests (Task 76.9)", () => {
  let context: AnalyticsContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    const meta: AnalyticsMetadata = { id: "prov-1" };
    context = new AnalyticsContext(meta);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Contexts & Models", () => {
    it("should instantiate AnalyticsContext and freeze properties", () => {
      const meta: AnalyticsMetadata = { id: "p-1", category: "audit" };
      const ctx = new AnalyticsContext(meta, ["sess-1"], [{ event: "click" }], null, { env: "prod" });

      expect(ctx.metadata.id).toBe("p-1");
      expect(ctx.activeSessions).toContain("sess-1");
      expect(ctx.eventStreams).toHaveLength(1);
      expect(ctx.runtimeMetadata.env).toBe("prod");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.activeSessions)).toBe(true);
      expect(Object.isFrozen(ctx.eventStreams)).toBe(true);
      expect(Object.isFrozen(ctx.runtimeMetadata)).toBe(true);
    });

    it("should manage BaseAnalyticsProvider collection and flush transitions", async () => {
      const provider = new TestAnalyticsProvider();
      expect(provider.state).toBe(AnalyticsState.Initializing);

      const event = new AnalyticsEvent("btn-click", "click");
      provider.collect(event);
      expect(provider.state).toBe(AnalyticsState.Collecting);

      await provider.flush();
      expect(provider.state).toBe(AnalyticsState.Ready);
      expect(provider.flushedEvents).toContain(event);
    });
  });

  describe("Analytics Definitions & Registry", () => {
    it("should register descriptors and freeze AnalyticsRegistry", () => {
      const registry = new AnalyticsRegistry();
      const meta: AnalyticsMetadata = { id: "prov-1" };
      const descriptor = new AnalyticsDescriptor(meta, TestAnalyticsProvider, ["ui"]);

      registry.register(descriptor);
      expect(registry.get("prov-1")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "AnalyticsRegistry is frozen and cannot accept further providers"
      );
    });

    it("should resolve providers in AnalyticsResolver", () => {
      const registry = new AnalyticsRegistry();
      const meta: AnalyticsMetadata = { id: "prov-1" };
      const descriptor = new AnalyticsDescriptor(meta, TestAnalyticsProvider);
      registry.register(descriptor);

      const resolver = new AnalyticsResolver(registry);
      expect(resolver.resolve("prov-1")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "Analytics provider with identifier missing is not registered"
      );
    });
  });

  describe("Event Collection", () => {
    it("should manage event groups and event registry mappings", () => {
      const eventRegistry = new AnalyticsEventRegistry();
      eventRegistry.register("user_login");
      expect(eventRegistry.has("user_login")).toBe(true);

      eventRegistry.freeze();
      expect(() => eventRegistry.register("user_signup")).toThrow("AnalyticsEventRegistry is frozen");

      const event = new AnalyticsEvent("user_login", "auth");
      const group = new AnalyticsEventGroup("g-1", "Authentication Events", [event]);
      expect(group.events).toContain(event);
    });

    it("should dispatch and track items in EventDispatcher and EventTracker", () => {
      const dispatcher = new EventDispatcher();
      const provider = new TestAnalyticsProvider();
      dispatcher.registerProvider(provider);

      const tracker = new EventTracker(dispatcher);
      tracker.trackInteraction("click-save", { target: "submit" });
      tracker.trackNavigation("/dashboard", { from: "/login" });
      tracker.trackWorkflow("wf-100", "step-1");
      tracker.trackApiCall("/users", "GET", 150);
      tracker.trackPerformance("render-time", 45);

      expect(provider.state).toBe(AnalyticsState.Collecting);
    });
  });

  describe("Processing & Delivery", () => {
    it("should batch events in EventBatcher", () => {
      const batcher = new EventBatcher();
      const event = new AnalyticsEvent("ev-1", "log");
      batcher.addToBatch(event);

      expect(batcher.size()).toBe(1);
      expect(batcher.getBatch()).toContain(event);

      batcher.clear();
      expect(batcher.size()).toBe(0);
    });

    it("should enrich payloads in AnalyticsProcessor", () => {
      const processor = new AnalyticsProcessor();
      const event = new AnalyticsEvent("ev-1", "log", { userId: "5" });
      const processed = processor.process(event);

      expect(processed.payload.userId).toBe("5");
      expect(processed.payload.processedAt).toBeGreaterThan(0);
    });

    it("should schedule flush loops in AnalyticsScheduler", () => {
      const scheduler = new AnalyticsScheduler();
      const flushFn = vi.fn();

      scheduler.startFlushLoop(flushFn, 200);
      vi.advanceTimersByTime(400);

      expect(flushFn).toHaveBeenCalledTimes(2);
      scheduler.stopFlushLoop();
    });

    it("should upload packet payloads in AnalyticsUploader", async () => {
      const uploader = new AnalyticsUploader();
      const event = new AnalyticsEvent("ev-1", "log");
      const success = await uploader.upload([event]);
      expect(success).toBe(true);
    });
  });

  describe("Session & Performance", () => {
    it("should track session activity times in SessionTracker", () => {
      const tracker = new SessionTracker();
      tracker.startSession("session-100");
      expect(tracker.getSessionId()).toBe("session-100");

      const t1 = tracker.getLastActivityTime();
      vi.advanceTimersByTime(100);
      tracker.recordActivity();
      expect(tracker.getLastActivityTime()).toBeGreaterThan(t1);
    });

    it("should log rendering metric entries in PerformanceTracker", () => {
      const tracker = new PerformanceTracker();
      tracker.recordMetric("layout-render", 120);
      expect(tracker.getMetric("layout-render")).toBe(120);
    });

    it("should log caught exceptions in ErrorTracker", () => {
      const tracker = new ErrorTracker();
      tracker.trackError(new Error("Timeout"));
      expect(tracker.getErrors()[0].message).toBe("Timeout");
    });

    it("should aggregate click counts in UsageMetricsCollector", () => {
      const collector = new UsageMetricsCollector();
      collector.recordClick();
      collector.recordClick();
      expect(collector.getClickCount()).toBe(2);
    });
  });

  describe("Privacy & Consent", () => {
    it("should record opt-in settings in ConsentManager", () => {
      const manager = new ConsentManager();
      expect(manager.isConsentGranted()).toBe(false);

      manager.grantConsent();
      expect(manager.isConsentGranted()).toBe(true);

      manager.revokeConsent();
      expect(manager.isConsentGranted()).toBe(false);
    });

    it("should mask sensitive values in PrivacyFilter", () => {
      const filter = new PrivacyFilter();
      const sanitized = filter.filterSensitiveData({
        email: "test@acos.com",
        password: "secret-pass",
        apiKey: "unaffected"
      });

      expect(sanitized.email).toBe("[MASKED_EMAIL]");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.apiKey).toBe("unaffected");
    });

    it("should check category permissions in AnalyticsPolicy", () => {
      const consent = new ConsentManager();
      const policy = new AnalyticsPolicy(consent);

      expect(policy.shouldCollectEvent("performance")).toBe(true);
      expect(policy.shouldCollectEvent("workflow")).toBe(false);

      consent.grantConsent();
      expect(policy.shouldCollectEvent("workflow")).toBe(true);
    });
  });

  describe("Events & Observers", () => {
    it("should publish lifecycle events to observers", () => {
      const dispatcher = new AnalyticsEventDispatcher();
      const observer = new AnalyticsObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.providerId).toBe("prov-100");
        expect(ev.type).toBe("flushing");
      });

      dispatcher.dispatch(new AnalyticsLifecycleEvent("prov-100", "flushing"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new AnalyticsLifecycleEvent("prov-100", "flushing"));
      expect(count).toBe(1);
    });
  });

  describe("Factory", () => {
    it("should build factory components", () => {
      const factory = new AnalyticsFactory();
      const reg = factory.createRegistry();
      expect(reg).toBeInstanceOf(AnalyticsRegistry);
    });
  });
});
