import { ILayout } from "./ILayout.js";

/**
 * LayoutComposer binding region segments onto layouts before rendering them.
 */
export class LayoutComposer {
  public compose(layout: ILayout, regions: Record<string, string>): string {
    for (const [name, content] of Object.entries(regions)) {
      if (typeof (layout as any).registerRegion === "function") {
        (layout as any).registerRegion(name, content);
      }
    }
    return layout.render();
  }
}
