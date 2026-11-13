import { describe, it, expect, beforeEach } from "vitest";
import { ThemeMode } from "../ThemeMode.js";
import { ThemeOptions } from "../ThemeOptions.js";
import { ThemeTokens } from "../ThemeTokens.js";
import { ThemeConfiguration } from "../ThemeConfiguration.js";
import { ThemeContext } from "../ThemeContext.js";
import { LightPalette, DarkPalette } from "../ColorPalette.js";
import { DefaultTypography } from "../TypographyTheme.js";
import { DefaultSpacing } from "../SpacingTheme.js";
import { DefaultElevation } from "../ElevationTheme.js";
import { DefaultComponentTheme } from "../ComponentTheme.js";
import { SystemThemeDetector } from "../SystemThemeDetector.js";
import { ThemeResolver } from "../ThemeResolver.js";
import { ThemeStore } from "../ThemeStore.js";
import { ThemeManager } from "../ThemeManager.js";
import { ThemeProvider } from "../ThemeProvider.js";
import { ThemeFactory } from "../ThemeFactory.js";

describe("Frontend Themes Component Refactored Unit Tests (Task 63.6)", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("Models & Design Tokens", () => {
    it("should carry styling options, config variables, and contexts nested within deep-frozen tokens", () => {
      const tokens = new ThemeTokens(
        DarkPalette,
        DefaultTypography,
        DefaultSpacing,
        DefaultElevation,
        DefaultComponentTheme
      );
      const config = new ThemeConfiguration(tokens);
      expect(config.tokens.colors).toBe(DarkPalette);
      expect(config.tokens.typography.fontFamily).toContain("Outfit");
      expect(config.tokens.spacing.md).toBe("1rem");
      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.tokens)).toBe(true);

      const context = new ThemeContext(ThemeMode.Dark, config);
      expect(context.mode).toBe(ThemeMode.Dark);
      expect(context.config).toBe(config);
    });

    it("should provide consistent light and dark palettes", () => {
      expect(LightPalette.primary).toBe("hsl(245, 75%, 55%)");
      expect(DarkPalette.primary).toBe("hsl(245, 75%, 65%)");
      expect(LightPalette.background).not.toBe(DarkPalette.background);
    });
  });

  describe("Theme Resolution & Detection", () => {
    it("should resolve light and dark options via ThemeResolver", () => {
      const detector = new SystemThemeDetector();
      const resolver = new ThemeResolver(detector);

      const lightConfig = resolver.resolve(ThemeMode.Light);
      expect(lightConfig.tokens.colors.background).toBe(LightPalette.background);

      const darkConfig = resolver.resolve(ThemeMode.Dark);
      expect(darkConfig.tokens.colors.background).toBe(DarkPalette.background);
    });

    it("should fallback to detector defaults for System mode", () => {
      const mockDetector = {
        isDark: () => true,
        onThemeChange: () => {}
      } as any;

      const resolver = new ThemeResolver(mockDetector);
      const systemConfig = resolver.resolve(ThemeMode.System);
      expect(systemConfig.tokens.colors.background).toBe(DarkPalette.background);
    });
  });

  describe("Store & Management", () => {
    it("should save and load preferences from local storage store utilizing the IThemeStore interface", () => {
      const mockLocalStorage: Record<string, string> = {};
      // Mock global localStorage in node tests
      (globalThis as any).localStorage = {
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        getItem: (key: string) => mockLocalStorage[key] || null,
        clear: () => {}
      } as any;

      const store = new ThemeStore("test_key");
      store.saveTheme(ThemeMode.Dark);

      expect(store.loadTheme()).toBe(ThemeMode.Dark);
      expect(mockLocalStorage.test_key).toBe(ThemeMode.Dark);

      // Cleanup mock
      delete (globalThis as any).localStorage;
    });

    it("should initialize ThemeManager and notify callback on preference change", () => {
      let changeNotified = false;
      const options: ThemeOptions = { defaultMode: ThemeMode.Dark };
      const detector = new SystemThemeDetector();
      const resolver = new ThemeResolver(detector);
      const store = new ThemeStore();

      const manager = new ThemeManager(options, resolver, store, detector);
      manager.onChange((ctx) => {
        changeNotified = true;
        expect(ctx.mode).toBe(ThemeMode.Light);
      });

      manager.setMode(ThemeMode.Light);
      expect(changeNotified).toBe(true);
      expect(manager.getMode()).toBe(ThemeMode.Light);
    });
  });

  describe("Factories & Providers", () => {
    it("should instantiate helper structures via ThemeFactory", () => {
      const detector = ThemeFactory.createDetector();
      expect(detector).toBeInstanceOf(SystemThemeDetector);

      const resolver = ThemeFactory.createResolver(detector);
      expect(resolver).toBeInstanceOf(ThemeResolver);

      const store = ThemeFactory.createStore();
      expect(store.loadTheme).toBeDefined();

      const manager = ThemeFactory.createManager({ defaultMode: ThemeMode.System }, resolver, store, detector);
      expect(manager).toBeInstanceOf(ThemeManager);

      const provider = ThemeFactory.createProvider(manager);
      expect(provider).toBeInstanceOf(ThemeProvider);
      expect(provider.getTheme().mode).toBe(ThemeMode.System);
    });
  });
});
