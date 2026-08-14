import { AnalyticsEvent } from "./AnalyticsEvent.js";
import { AnalyticsState } from "./AnalyticsState.js";

/**
 * IAnalyticsProvider defining analytics providers contracts.
 */
export interface IAnalyticsProvider {
  state: AnalyticsState;
  collect(event: AnalyticsEvent): void;
  flush(): Promise<void>;
}
