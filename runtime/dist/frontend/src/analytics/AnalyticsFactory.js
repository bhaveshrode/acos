"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsFactory = void 0;
const AnalyticsRegistry_js_1 = require("./AnalyticsRegistry.js");
const AnalyticsResolver_js_1 = require("./AnalyticsResolver.js");
const AnalyticsEventRegistry_js_1 = require("./AnalyticsEventRegistry.js");
const EventTracker_js_1 = require("./EventTracker.js");
const EventDispatcher_js_1 = require("./EventDispatcher.js");
const EventBatcher_js_1 = require("./EventBatcher.js");
const AnalyticsProcessor_js_1 = require("./AnalyticsProcessor.js");
const AnalyticsScheduler_js_1 = require("./AnalyticsScheduler.js");
const AnalyticsUploader_js_1 = require("./AnalyticsUploader.js");
const SessionTracker_js_1 = require("./SessionTracker.js");
const PerformanceTracker_js_1 = require("./PerformanceTracker.js");
const ErrorTracker_js_1 = require("./ErrorTracker.js");
const UsageMetricsCollector_js_1 = require("./UsageMetricsCollector.js");
const ConsentManager_js_1 = require("./ConsentManager.js");
const PrivacyFilter_js_1 = require("./PrivacyFilter.js");
const AnalyticsPolicy_js_1 = require("./AnalyticsPolicy.js");
const AnalyticsEventDispatcher_js_1 = require("./AnalyticsEventDispatcher.js");
const AnalyticsObserver_js_1 = require("./AnalyticsObserver.js");
/**
 * AnalyticsFactory implementing standard IAnalyticsFactory composition roots.
 */
class AnalyticsFactory {
    static createRegistry() {
        return new AnalyticsRegistry_js_1.AnalyticsRegistry();
    }
    static createResolver(registry) {
        return new AnalyticsResolver_js_1.AnalyticsResolver(registry);
    }
    static createEventRegistry() {
        return new AnalyticsEventRegistry_js_1.AnalyticsEventRegistry();
    }
    static createEventDispatcher() {
        return new EventDispatcher_js_1.EventDispatcher();
    }
    static createTracker(dispatcher) {
        return new EventTracker_js_1.EventTracker(dispatcher);
    }
    static createBatcher() {
        return new EventBatcher_js_1.EventBatcher();
    }
    static createProcessor() {
        return new AnalyticsProcessor_js_1.AnalyticsProcessor();
    }
    static createScheduler() {
        return new AnalyticsScheduler_js_1.AnalyticsScheduler();
    }
    static createUploader() {
        return new AnalyticsUploader_js_1.AnalyticsUploader();
    }
    static createSessionTracker() {
        return new SessionTracker_js_1.SessionTracker();
    }
    static createPerformanceTracker() {
        return new PerformanceTracker_js_1.PerformanceTracker();
    }
    static createErrorTracker() {
        return new ErrorTracker_js_1.ErrorTracker();
    }
    static createMetricsCollector() {
        return new UsageMetricsCollector_js_1.UsageMetricsCollector();
    }
    static createConsentManager() {
        return new ConsentManager_js_1.ConsentManager();
    }
    static createPrivacyFilter() {
        return new PrivacyFilter_js_1.PrivacyFilter();
    }
    static createPolicy(consentManager) {
        return new AnalyticsPolicy_js_1.AnalyticsPolicy(consentManager);
    }
    static createLifecycleDispatcher() {
        return new AnalyticsEventDispatcher_js_1.AnalyticsEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new AnalyticsObserver_js_1.AnalyticsObserver(dispatcher);
    }
    createRegistry() {
        return AnalyticsFactory.createRegistry();
    }
    createResolver(registry) {
        return AnalyticsFactory.createResolver(registry);
    }
    createEventRegistry() {
        return AnalyticsFactory.createEventRegistry();
    }
    createEventDispatcher() {
        return AnalyticsFactory.createEventDispatcher();
    }
    createTracker(dispatcher) {
        return AnalyticsFactory.createTracker(dispatcher);
    }
    createBatcher() {
        return AnalyticsFactory.createBatcher();
    }
    createProcessor() {
        return AnalyticsFactory.createProcessor();
    }
    createScheduler() {
        return AnalyticsFactory.createScheduler();
    }
    createUploader() {
        return AnalyticsFactory.createUploader();
    }
    createSessionTracker() {
        return AnalyticsFactory.createSessionTracker();
    }
    createPerformanceTracker() {
        return AnalyticsFactory.createPerformanceTracker();
    }
    createErrorTracker() {
        return AnalyticsFactory.createErrorTracker();
    }
    createMetricsCollector() {
        return AnalyticsFactory.createMetricsCollector();
    }
    createConsentManager() {
        return AnalyticsFactory.createConsentManager();
    }
    createPrivacyFilter() {
        return AnalyticsFactory.createPrivacyFilter();
    }
    createPolicy(consentManager) {
        return AnalyticsFactory.createPolicy(consentManager);
    }
    createLifecycleDispatcher() {
        return AnalyticsFactory.createLifecycleDispatcher();
    }
    createObserver(dispatcher) {
        return AnalyticsFactory.createObserver(dispatcher);
    }
}
exports.AnalyticsFactory = AnalyticsFactory;
