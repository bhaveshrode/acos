/**
 * FormMetadata capturing schema targets, versions, and security options.
 */
export interface FormMetadata {
  id: string;
  version?: string;
  permissions?: string[];
  featureFlags?: string[];
  associatedSchema?: string;
}
