import { AnalyticsMetadata } from "./AnalyticsMetadata.js";

/**
 * AnalyticsDescriptor wrapping provider constructors and supported categories.
 */
export class AnalyticsDescriptor {
  constructor(
    public readonly metadata: AnalyticsMetadata,
    public readonly providerClass: any,
    public readonly supportedCategories: string[] = []
  ) {
    Object.freeze(this.supportedCategories);
    Object.freeze(this);
  }
}
