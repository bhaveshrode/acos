/**
 * PageMetadata holding SEO, layouts, breadcrumbs, and permission targets.
 */
export interface PageMetadata {
  id: string;
  title: string;
  breadcrumbs?: string[];
  permissions?: string[];
  featureFlags?: string[];
  layout?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
