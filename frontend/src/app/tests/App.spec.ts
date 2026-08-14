import { describe, it, expect } from "vitest";
import { ApplicationOptions } from "../ApplicationOptions.js";
import { ApplicationState, InitState } from "../ApplicationState.js";
import { ApplicationContext } from "../ApplicationContext.js";
import { ApplicationBootstrapper } from "../ApplicationBootstrapper.js";
import { ApplicationProviders, IProvider } from "../ApplicationProviders.js";
import { RootLayout } from "../RootLayout.js";
import { App } from "../App.js";
import { ApplicationFactory } from "../ApplicationFactory.js";

describe("Frontend App Component Unit Tests (Task 61.7)", () => {
  const mockOptions: ApplicationOptions = {
    apiBaseUrl: "http://api.acos.local",
    wsUrl: "ws://api.acos.local/ws",
    environment: "production",
    enableLogging: true
  };

  describe("Models & Context", () => {
    it("should initialize ApplicationOptions and ApplicationState", () => {
      const state = new ApplicationState();
      expect(state.get()).toBe(InitState.Uninitialized);

      state.transitionTo(InitState.Initializing);
      expect(state.get()).toBe(InitState.Initializing);
    });

    it("should register and resolve services on ApplicationContext", () => {
      const state = new ApplicationState();
      const context = new ApplicationContext(mockOptions, state);

      const mockService = { api: "ok" };
      context.registerService("MockApi", mockService);

      expect(context.getService("MockApi")).toBe(mockService);
      expect(() => context.getService("NonExistent")).toThrow("Service NonExistent not found");
    });
  });

  describe("Bootstrap & Lifecycles", () => {
    it("should start and stop app lifecycle, transitioning state values", async () => {
      const bootstrapper = new ApplicationBootstrapper(mockOptions);
      
      const context = await bootstrapper.start();
      expect(context.state.get()).toBe(InitState.Ready);
      expect(context.options.apiBaseUrl).toBe("http://api.acos.local");

      expect(bootstrapper.getContext()).toBe(context);

      await bootstrapper.stop();
      expect(context.state.get()).toBe(InitState.Shutdown);
    });

    it("should throw if getting context before starting bootstrapper", () => {
      const bootstrapper = new ApplicationBootstrapper(mockOptions);
      expect(() => bootstrapper.getContext()).toThrow("has not been started");
    });
  });

  describe("Provider Composition", () => {
    it("should register and execute dynamic initialization hooks list on providers", async () => {
      const providers = new ApplicationProviders();
      let initInvoked = false;

      const mockProvider: IProvider = {
        name: "MockProvider",
        init: async (ctx: any) => {
          initInvoked = true;
          expect(ctx).toBeDefined();
        }
      };

      providers.register(mockProvider);
      expect(providers.getProviders()).toContain(mockProvider);

      await providers.initializeAll({});
      expect(initInvoked).toBe(true);
    });
  });

  describe("Root Rendering layout", () => {
    it("should render HSL premium layouts wrapping content strings", () => {
      const layout = new RootLayout();
      const html = layout.render("<p>Page contents</p>");
      
      expect(html).toContain("acos-root-layout");
      expect(html).toContain("Page contents");
      expect(html).toContain("ACOS Platform");
    });

    it("should instantiate App component mounting containers shell", () => {
      const layout = new RootLayout();
      const app = new App(layout);
      
      expect(app.layout).toBe(layout);
      // Verify safe mount execution in node
      expect(() => app.mount("#root", "<div></div>")).not.toThrow();
    });
  });

  describe("Factories Builder", () => {
    it("should instantiate helper structures via ApplicationFactory", () => {
      const bootstrapper = ApplicationFactory.createBootstrapper(mockOptions);
      expect(bootstrapper).toBeInstanceOf(ApplicationBootstrapper);

      const providers = ApplicationFactory.createProviders();
      expect(providers).toBeInstanceOf(ApplicationProviders);

      const app = ApplicationFactory.createApp();
      expect(app).toBeInstanceOf(App);
    });
  });
});
