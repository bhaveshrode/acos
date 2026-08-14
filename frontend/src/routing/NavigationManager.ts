import { NavigationOptions } from "./NavigationOptions.js";
import { INavigationManager } from "./INavigationManager.js";

/**
 * NavigationManager coordinating history state and programmatic page transitions.
 */
export class NavigationManager implements INavigationManager {
  private readonly historyListeners: ((path: string) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", () => {
        this.notifyListeners(window.location.pathname + window.location.search);
      });
    }
  }

  public navigate(path: string, options?: NavigationOptions): void {
    if (typeof window !== "undefined") {
      const state = options?.state || {};
      if (options?.replace) {
        window.history.replaceState(state, "", path);
      } else {
        window.history.pushState(state, "", path);
      }
      if (options?.scrollRestoration) {
        window.history.scrollRestoration = options.scrollRestoration;
      }
      this.notifyListeners(path);
    }
  }

  public goBack(): void {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  }

  public goForward(): void {
    if (typeof window !== "undefined") {
      window.history.forward();
    }
  }

  public onPopState(callback: (path: string) => void): void {
    this.historyListeners.push(callback);
  }

  private notifyListeners(path: string): void {
    for (const listener of this.historyListeners) {
      listener(path);
    }
  }
}
