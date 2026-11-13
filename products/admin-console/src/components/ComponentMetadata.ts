/**
 * ComponentMetadata capturing dependencies and security requirements.
 */
export interface ComponentMetadata {
  id: string;
  featureFlags?: string[];
  permissions?: string[];
  dependencies?: string[];
}
