import { BreakpointResolver } from "./BreakpointResolver.js";

/**
 * ResponsiveLayoutManager tracking viewport changes dynamically.
 */
export class ResponsiveLayoutManager {
  private activeViewport: string = "Desktop";

  public handleResize(width: number): string {
    this.activeViewport = BreakpointResolver.resolve(width);
    return this.activeViewport;
  }

  public getViewport(): string {
    return this.activeViewport;
  }
}
