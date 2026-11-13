import { LayoutMetadata } from "./LayoutMetadata.js";

/**
 * LayoutContext carrying structural metadata, route state, and active responsive parameters.
 */
export class LayoutContext {
  constructor(
    public readonly metadata: LayoutMetadata,
    public readonly routeInfo: Readonly<Record<string, any>> = {},
    public readonly viewport: string = "Desktop",
    public readonly registeredRegions: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.routeInfo);
    Object.freeze(this.registeredRegions);
    Object.freeze(this);
  }
}
