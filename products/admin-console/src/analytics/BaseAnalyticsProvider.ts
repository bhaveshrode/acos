import { IAnalyticsProvider } from "./IAnalyticsProvider.js";
import { AnalyticsEvent } from "./AnalyticsEvent.js";
import { AnalyticsState } from "./AnalyticsState.js";

/**
 * BaseAnalyticsProvider buffering events and flushing.
 */
export abstract class BaseAnalyticsProvider implements IAnalyticsProvider {
  public state: AnalyticsState = AnalyticsState.Initializing;
  protected readonly buffer: AnalyticsEvent[] = [];

  public collect(event: AnalyticsEvent): void {
    this.state = AnalyticsState.Collecting;
    this.buffer.push(event);
    this.onCollect(event);
  }

  public async flush(): Promise<void> {
    this.state = AnalyticsState.Processing;
    await this.onFlush(this.buffer);
    this.buffer.length = 0;
    this.state = AnalyticsState.Ready;
  }

  protected onCollect(event: AnalyticsEvent): void {}
  protected abstract onFlush(events: AnalyticsEvent[]): Promise<void>;
}
