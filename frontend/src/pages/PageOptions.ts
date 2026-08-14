/**
 * PageOptions defining caching policies and refresh intervals.
 */
export interface PageOptions {
  cacheable?: boolean;
  prefetch?: boolean;
  authorize?: boolean;
  refreshInterval?: number;
}
