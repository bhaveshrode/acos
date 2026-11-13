import { LayoutMetadata } from "./LayoutMetadata.js";

/**
 * LayoutDescriptor encapsulating layout metadata, class mappings, and supported regions options.
 */
export class LayoutDescriptor {
  constructor(
    public readonly metadata: LayoutMetadata,
    public readonly layoutClass: any,
    public readonly supportedRegions: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.supportedRegions);
    Object.freeze(this);
  }
}
