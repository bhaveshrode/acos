/**
 * Pagination helper class.
 */
export class PageResult<T> {
  public readonly items: T[];
  public readonly totalCount: number;
  public readonly pageNumber: number;
  public readonly pageSize: number;

  constructor(items: T[], totalCount: number, pageNumber: number, pageSize: number) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
