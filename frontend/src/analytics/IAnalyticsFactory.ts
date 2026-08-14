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
 * IAnalyticsFactory interface defining composition contract capabilities.
 */
export interface IAnalyticsFactory {
  createRegistry(): AnalyticsRegistry;
  createResolver(registry: AnalyticsRegistry): AnalyticsResolver;
  createEventRegistry(): AnalyticsEventRegistry;
  createEventDispatcher(): EventDispatcher;
  createTracker(dispatcher: EventDispatcher): EventTracker;
  createBatcher(): EventBatcher;
  createProcessor(): AnalyticsProcessor;
  createScheduler(): AnalyticsScheduler;
  createUploader(): AnalyticsUploader;
  createSessionTracker(): SessionTracker;
  createPerformanceTracker(): PerformanceTracker;
  createErrorTracker(): ErrorTracker;
  createMetricsCollector(): UsageMetricsCollector;
  createConsentManager(): ConsentManager;
  createPrivacyFilter(): PrivacyFilter;
  createPolicy(consentManager: ConsentManager): AnalyticsPolicy;
  createLifecycleDispatcher(): AnalyticsEventDispatcher;
  createObserver(dispatcher: AnalyticsEventDispatcher): AnalyticsObserver;
}
