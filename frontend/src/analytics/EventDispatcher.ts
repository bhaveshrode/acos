import { AnalyticsEvent } from "./AnalyticsEvent.js";
import { IAnalyticsProvider } from "./IAnalyticsProvider.js";

/**
 * EventDispatcher routing events to registered providers.
 */
export class EventDispatcher {
  private readonly providers = new Set<IAnalyticsProvider>();

  public registerProvider(provider: IAnalyticsProvider): void {
    this.providers.add(provider);
  }

  public dispatch(event: AnalyticsEvent): void {
    for (const provider of this.providers) {
      provider.collect(event);
    }
  }
}
