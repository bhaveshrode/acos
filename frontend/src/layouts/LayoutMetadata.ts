/**
 * LayoutMetadata capturing layout features, permissions, and regions constraints.
 */
export interface LayoutMetadata {
  id: string;
  supportedRegions?: string[];
  permissions?: string[];
  featureFlags?: string[];
}
