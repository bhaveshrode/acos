import { AnalyticsEvent } from "./AnalyticsEvent.js";

/**
 * AnalyticsEventGroup organizing related events into logical categories.
 */
export class AnalyticsEventGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly events: AnalyticsEvent[] = []
  ) {}
}
