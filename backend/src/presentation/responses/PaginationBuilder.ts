import { PagingMetadata } from "./PagedResponse.js";

/**
 * PaginationBuilder computing total items and total pages.
 */
export class PaginationBuilder {
  public static build(page: number, pageSize: number, totalItems: number): PagingMetadata {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    return {
      page,
      pageSize,
      totalItems,
      totalPages
    };
  }
}
