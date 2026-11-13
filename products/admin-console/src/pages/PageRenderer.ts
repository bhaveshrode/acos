import { IPage } from "./IPage.js";
import { RenderResult } from "../components/RenderResult.js";

/**
 * PageRenderer rendering page instances returning diagnostic telemetry wraps.
 */
export class PageRenderer {
  public render(page: IPage): RenderResult {
    const start = performance.now();
    const output = page.render();
    const duration = performance.now() - start;
    return new RenderResult(output, duration, {
      pageId: page.context.metadata.id
    });
  }
}
