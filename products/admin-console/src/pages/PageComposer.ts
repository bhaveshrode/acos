import { IPage } from "./IPage.js";

/**
 * PageComposer binding content pieces onto page templates.
 */
export class PageComposer {
  public compose(page: IPage, elements: Record<string, string>): string {
    for (const [name, content] of Object.entries(elements)) {
      if (typeof (page as any).registerElement === "function") {
        (page as any).registerElement(name, content);
      }
    }
    return page.render();
  }
}
