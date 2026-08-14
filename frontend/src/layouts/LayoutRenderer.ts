import { ILayout } from "./ILayout.js";
import { RenderResult } from "../components/RenderResult.js";

/**
 * LayoutRenderer rendering layouts and returning RenderResult objects.
 */
export class LayoutRenderer {
  public render(layout: ILayout): RenderResult {
    const start = performance.now();
    const output = layout.render();
    const duration = performance.now() - start;
    return new RenderResult(output, duration, {
      layoutId: layout.context.metadata.id
    });
  }
}
