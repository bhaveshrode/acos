import { AnalyticsEvent } from "./AnalyticsEvent.js";

/**
 * AnalyticsProcessor enriching telemetry data payloads.
 */
export class AnalyticsProcessor {
  public process(event: AnalyticsEvent): AnalyticsEvent {
    const enrichedPayload = {
      ...event.payload,
      processedAt: Date.now()
    };
    return new AnalyticsEvent(event.name, event.category, enrichedPayload, event.timestamp);
  }
}
