import { ThemeOptions } from "./ThemeOptions.js";
import { ThemeResolver } from "./ThemeResolver.js";
import { IThemeStore } from "./IThemeStore.js";
import { ThemeStore } from "./ThemeStore.js";
import { SystemThemeDetector } from "./SystemThemeDetector.js";
import { ThemeManager } from "./ThemeManager.js";
import { ThemeProvider } from "./ThemeProvider.js";

/**
 * ThemeFactory building resolvers, stores, managers, and providers.
 */
export class ThemeFactory {
  public static createDetector(): SystemThemeDetector {
    return new SystemThemeDetector();
  }

  public static createResolver(detector: SystemThemeDetector): ThemeResolver {
    return new ThemeResolver(detector);
  }

  public static createStore(persistKey?: string): IThemeStore {
    return new ThemeStore(persistKey);
  }

  public static createManager(
    options: ThemeOptions,
    resolver: ThemeResolver,
    store: IThemeStore,
    detector: SystemThemeDetector
  ): ThemeManager {
    return new ThemeManager(options, resolver, store, detector);
  }

  public static createProvider(manager: ThemeManager): ThemeProvider {
    return new ThemeProvider(manager);
  }
}
