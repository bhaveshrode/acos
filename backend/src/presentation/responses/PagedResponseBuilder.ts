import { PagedResponse } from "./PagedResponse.js";
import { PaginationBuilder } from "./PaginationBuilder.js";
import { LinkBuilder } from "./LinkBuilder.js";

/**
 * PagedResponseBuilder generating paginated results.
 */
export class PagedResponseBuilder {
  public build<T>(
    data: T[],
    page: number,
    pageSize: number,
    totalItems: number,
    basePath: string,
    metadata?: Record<string, any>
  ): PagedResponse<T> {
    const pagingMetadata = PaginationBuilder.build(page, pageSize, totalItems);
    const links = LinkBuilder.build(page, pagingMetadata.totalPages, pageSize, basePath);
    return new PagedResponse<T>(data, pagingMetadata, links, metadata);
  }
}
