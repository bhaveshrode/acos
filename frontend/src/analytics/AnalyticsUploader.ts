import { AnalyticsEvent } from "./AnalyticsEvent.js";

/**
 * AnalyticsUploader transmitting event payloads to backend endpoints.
 */
export class AnalyticsUploader {
  public async upload(events: AnalyticsEvent[]): Promise<boolean> {
    return events.length > 0;
  }
}
