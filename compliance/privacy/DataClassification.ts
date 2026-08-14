/**
 * DataClassification categorizing information sensitivity levels.
 */
export enum DataClassification {
  Public = "Public",
  Sensitive = "Sensitive",
  Personal = "Personal" // PII subject to GDPR erasure
}
