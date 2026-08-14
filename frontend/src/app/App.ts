import { RootLayout } from "./RootLayout.js";

/**
 * App serving as the root application mounting coordinator.
 */
export class App {
  constructor(public readonly layout: RootLayout) {}

  public mount(selector: string, contentHtml: string): void {
    if (typeof document !== "undefined") {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = this.layout.render(contentHtml);
      }
    }
  }
}
