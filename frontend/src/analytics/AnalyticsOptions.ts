/**
 * AnalyticsOptions defining collection strategies and retention properties.
 */
export interface AnalyticsOptions {
  collectionStrategy?: "Realtime" | "Batched";
  batchingIntervalMs?: number;
  samplingRate?: number;
  privacySettings?: {
    anonymizeIp?: boolean;
    maskEmails?: boolean;
  };
  retentionDays?: number;
}
