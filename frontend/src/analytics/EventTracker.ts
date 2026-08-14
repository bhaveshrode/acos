import { AnalyticsEvent } from "./AnalyticsEvent.js";
import { EventDispatcher } from "./EventDispatcher.js";

/**
 * EventTracker capturing interactions, workflows, navigation, and timing telemetry.
 */
export class EventTracker {
  constructor(private readonly dispatcher: EventDispatcher) {}

  public trackInteraction(name: string, payload: Record<string, any> = {}): void {
    const event = new AnalyticsEvent(name, "interaction", payload);
    this.dispatcher.dispatch(event);
  }

  public trackNavigation(to: string, payload: Record<string, any> = {}): void {
    const event = new AnalyticsEvent(to, "navigation", payload);
    this.dispatcher.dispatch(event);
  }

  public trackWorkflow(wfId: string, action: string, payload: Record<string, any> = {}): void {
    const event = new AnalyticsEvent(`${wfId}:${action}`, "workflow", payload);
    this.dispatcher.dispatch(event);
  }

  public trackApiCall(url: string, method: string, durationMs: number): void {
    const event = new AnalyticsEvent(`${method}:${url}`, "api", { durationMs });
    this.dispatcher.dispatch(event);
  }

  public trackPerformance(metricName: string, value: number): void {
    const event = new AnalyticsEvent(metricName, "performance", { value });
    this.dispatcher.dispatch(event);
  }
}
