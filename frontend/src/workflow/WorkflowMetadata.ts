/**
 * WorkflowMetadata tracking configuration settings.
 */
export interface WorkflowMetadata {
  id: string;
  version: string;
  category?: string;
  permissions?: string[];
  featureFlags?: string[];
  definition?: Record<string, any>;
}
