import { ThemeMode } from "./ThemeMode.js";
import { ThemeContext } from "./ThemeContext.js";
import { ThemeOptions } from "./ThemeOptions.js";
import { ThemeResolver } from "./ThemeResolver.js";
import { IThemeStore } from "./IThemeStore.js";
import { SystemThemeDetector } from "./SystemThemeDetector.js";

/**
 * ThemeManager coordinating active theme selections using the abstracted IThemeStore.
 */
export class ThemeManager {
  private currentMode: ThemeMode;
  private readonly listeners: ((context: ThemeContext) => void)[] = [];

  constructor(
    private readonly options: ThemeOptions,
    private readonly resolver: ThemeResolver,
    private readonly store: IThemeStore,
    private readonly detector: SystemThemeDetector
  ) {
    this.currentMode = this.store.loadTheme() || this.options.defaultMode;

    this.detector.onThemeChange(() => {
      if (this.currentMode === ThemeMode.System) {
        this.notify();
      }
    });
  }

  public getContext(): ThemeContext {
    const config = this.resolver.resolve(this.currentMode);
    return new ThemeContext(this.currentMode, config);
  }

  public setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    this.store.saveTheme(mode);
    this.notify();
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }

  public onChange(callback: (context: ThemeContext) => void): void {
    this.listeners.push(callback);
  }

  private notify(): void {
    const context = this.getContext();
    for (const listener of this.listeners) {
      listener(context);
    }
  }
}
