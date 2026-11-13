import { AnalyticsMetadata } from "./AnalyticsMetadata.js";

/**
 * AnalyticsContext storing session and active streams arrays references.
 */
export class AnalyticsContext {
  constructor(
    public readonly metadata: AnalyticsMetadata,
    public readonly activeSessions: ReadonlyArray<string> = [],
    public readonly eventStreams: ReadonlyArray<any> = [],
    public readonly userContext: any = null,
    public readonly runtimeMetadata: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.activeSessions);
    Object.freeze(this.eventStreams);
    Object.freeze(this.runtimeMetadata);
    Object.freeze(this);
  }
}
