import { PageMetadata } from "./PageMetadata.js";

/**
 * PageContext carrying parameters, query segment structures, and auth/layout properties.
 */
export class PageContext {
  constructor(
    public readonly metadata: PageMetadata,
    public readonly routeParams: Readonly<Record<string, any>> = {},
    public readonly queryParams: Readonly<Record<string, any>> = {},
    public readonly layoutContext: any = null,
    public readonly authState: any = null
  ) {
    Object.freeze(this.routeParams);
    Object.freeze(this.queryParams);
    Object.freeze(this);
  }
}
