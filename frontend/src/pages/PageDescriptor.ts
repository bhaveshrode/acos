import { PageMetadata } from "./PageMetadata.js";

/**
 * PageDescriptor wrapping page constructor classes and layout dependencies.
 */
export class PageDescriptor {
  constructor(
    public readonly metadata: PageMetadata,
    public readonly pageClass: any,
    public readonly layoutId?: string
  ) {
    Object.freeze(this);
  }
}
