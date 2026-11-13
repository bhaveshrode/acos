import { IAnalyticsFactory } from "./IAnalyticsFactory.js";
import { AnalyticsRegistry } from "./AnalyticsRegistry.js";
import { AnalyticsResolver } from "./AnalyticsResolver.js";
import { AnalyticsEventRegistry } from "./AnalyticsEventRegistry.js";
import { EventTracker } from "./EventTracker.js";
import { EventDispatcher } from "./EventDispatcher.js";
import { EventBatcher } from "./EventBatcher.js";
import { AnalyticsProcessor } from "./AnalyticsProcessor.js";
import { AnalyticsScheduler } from "./AnalyticsScheduler.js";
import { AnalyticsUploader } from "./AnalyticsUploader.js";
import { SessionTracker } from "./SessionTracker.js";
import { PerformanceTracker } from "./PerformanceTracker.js";
import { ErrorTracker } from "./ErrorTracker.js";
import { UsageMetricsCollector } from "./UsageMetricsCollector.js";
import { ConsentManager } from "./ConsentManager.js";
import { PrivacyFilter } from "./PrivacyFilter.js";
import { AnalyticsPolicy } from "./AnalyticsPolicy.js";
import { AnalyticsEventDispatcher } from "./AnalyticsEventDispatcher.js";
import { AnalyticsObserver } from "./AnalyticsObserver.js";

/**
 * AnalyticsFactory implementing standard IAnalyticsFactory composition roots.
 */
export class AnalyticsFactory implements IAnalyticsFactory {
  public static createRegistry(): AnalyticsRegistry {
    return new AnalyticsRegistry();
  }

  public static createResolver(registry: AnalyticsRegistry): AnalyticsResolver {
    return new AnalyticsResolver(registry);
  }

  public static createEventRegistry(): AnalyticsEventRegistry {
    return new AnalyticsEventRegistry();
  }

  public static createEventDispatcher(): EventDispatcher {
    return new EventDispatcher();
  }

  public static createTracker(dispatcher: EventDispatcher): EventTracker {
    return new EventTracker(dispatcher);
  }

  public static createBatcher(): EventBatcher {
    return new EventBatcher();
  }

  public static createProcessor(): AnalyticsProcessor {
    return new AnalyticsProcessor();
  }

  public static createScheduler(): AnalyticsScheduler {
    return new AnalyticsScheduler();
  }

  public static createUploader(): AnalyticsUploader {
    return new AnalyticsUploader();
  }

  public static createSessionTracker(): SessionTracker {
    return new SessionTracker();
  }

  public static createPerformanceTracker(): PerformanceTracker {
    return new PerformanceTracker();
  }

  public static createErrorTracker(): ErrorTracker {
    return new ErrorTracker();
  }

  public static createMetricsCollector(): UsageMetricsCollector {
    return new UsageMetricsCollector();
  }

  public static createConsentManager(): ConsentManager {
    return new ConsentManager();
  }

  public static createPrivacyFilter(): PrivacyFilter {
    return new PrivacyFilter();
  }

  public static createPolicy(consentManager: ConsentManager): AnalyticsPolicy {
    return new AnalyticsPolicy(consentManager);
  }

  public static createLifecycleDispatcher(): AnalyticsEventDispatcher {
    return new AnalyticsEventDispatcher();
  }

  public static createObserver(dispatcher: AnalyticsEventDispatcher): AnalyticsObserver {
    return new AnalyticsObserver(dispatcher);
  }

  public createRegistry(): AnalyticsRegistry {
    return AnalyticsFactory.createRegistry();
  }

  public createResolver(registry: AnalyticsRegistry): AnalyticsResolver {
    return AnalyticsFactory.createResolver(registry);
  }

  public createEventRegistry(): AnalyticsEventRegistry {
    return AnalyticsFactory.createEventRegistry();
  }

  public createEventDispatcher(): EventDispatcher {
    return AnalyticsFactory.createEventDispatcher();
  }

  public createTracker(dispatcher: EventDispatcher): EventTracker {
    return AnalyticsFactory.createTracker(dispatcher);
  }

  public createBatcher(): EventBatcher {
    return AnalyticsFactory.createBatcher();
  }

  public createProcessor(): AnalyticsProcessor {
    return AnalyticsFactory.createProcessor();
  }

  public createScheduler(): AnalyticsScheduler {
    return AnalyticsFactory.createScheduler();
  }

  public createUploader(): AnalyticsUploader {
    return AnalyticsFactory.createUploader();
  }

  public createSessionTracker(): SessionTracker {
    return AnalyticsFactory.createSessionTracker();
  }

  public createPerformanceTracker(): PerformanceTracker {
    return AnalyticsFactory.createPerformanceTracker();
  }

  public createErrorTracker(): ErrorTracker {
    return AnalyticsFactory.createErrorTracker();
  }

  public createMetricsCollector(): UsageMetricsCollector {
    return AnalyticsFactory.createMetricsCollector();
  }

  public createConsentManager(): ConsentManager {
    return AnalyticsFactory.createConsentManager();
  }

  public createPrivacyFilter(): PrivacyFilter {
    return AnalyticsFactory.createPrivacyFilter();
  }

  public createPolicy(consentManager: ConsentManager): AnalyticsPolicy {
    return AnalyticsFactory.createPolicy(consentManager);
  }

  public createLifecycleDispatcher(): AnalyticsEventDispatcher {
    return AnalyticsFactory.createLifecycleDispatcher();
  }

  public createObserver(dispatcher: AnalyticsEventDispatcher): AnalyticsObserver {
    return AnalyticsFactory.createObserver(dispatcher);
  }
}
