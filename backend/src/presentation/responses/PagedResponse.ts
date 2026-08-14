import { ApiResponse } from "./ApiResponse.js";

export interface PagingMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PagedNavigationLinks {
  self: string;
  next?: string;
  prev?: string;
  first: string;
  last: string;
}

/**
 * PagedResponse wrapping list collections with navigation links.
 */
export class PagedResponse<T> extends ApiResponse<T[]> {
  constructor(
    data: T[],
    public readonly pagination: PagingMetadata,
    public readonly links: PagedNavigationLinks,
    metadata?: Record<string, any>
  ) {
    super(true, data, undefined, metadata);
  }
}
