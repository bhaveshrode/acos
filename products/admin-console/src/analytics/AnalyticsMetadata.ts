/**
 * AnalyticsMetadata tracking event schemas version and source mappings.
 */
export interface AnalyticsMetadata {
  id: string;
  category?: string;
  eventVersion?: string;
  featureFlags?: string[];
  source?: string;
}
