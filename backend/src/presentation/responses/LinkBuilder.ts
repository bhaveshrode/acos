import { PagedNavigationLinks } from "./PagedResponse.js";

/**
 * LinkBuilder generating hypermedia links.
 */
export class LinkBuilder {
  public static build(
    page: number,
    totalPages: number,
    pageSize: number,
    basePath: string
  ): PagedNavigationLinks {
    const cleanPath = basePath.includes("?") ? basePath.split("?")[0] : basePath;
    const links: PagedNavigationLinks = {
      self: `${cleanPath}?page=${page}&pageSize=${pageSize}`,
      first: `${cleanPath}?page=1&pageSize=${pageSize}`,
      last: `${cleanPath}?page=${totalPages}&pageSize=${pageSize}`
    };

    if (page < totalPages) {
      links.next = `${cleanPath}?page=${page + 1}&pageSize=${pageSize}`;
    }
    if (page > 1) {
      links.prev = `${cleanPath}?page=${page - 1}&pageSize=${pageSize}`;
    }

    return links;
  }
}
