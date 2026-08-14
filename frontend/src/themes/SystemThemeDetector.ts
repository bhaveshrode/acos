/**
 * SystemThemeDetector observing OS theme color preferences changes.
 */
export class SystemThemeDetector {
  private readonly listeners: ((isDark: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined" && window.matchMedia) {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      query.addEventListener("change", (e) => {
        this.notify(e.matches);
      });
    }
  }

  public isDark(): boolean {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }

  public onThemeChange(callback: (isDark: boolean) => void): void {
    this.listeners.push(callback);
  }

  private notify(isDark: boolean): void {
    for (const listener of this.listeners) {
      listener(isDark);
    }
  }
}
