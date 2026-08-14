import { AnalyticsEvent } from "./AnalyticsEvent.js";

/**
 * EventBatcher buffering events before network uploads.
 */
export class EventBatcher {
  private batch: AnalyticsEvent[] = [];

  public addToBatch(event: AnalyticsEvent): void {
    this.batch.push(event);
  }

  public getBatch(): AnalyticsEvent[] {
    return [...this.batch];
  }

  public clear(): void {
    this.batch = [];
  }

  public size(): number {
    return this.batch.length;
  }
}
