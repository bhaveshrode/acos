import { describe, it, expect, beforeEach, vi } from "vitest";
import { LayoutState } from "../LayoutState.js";
import { LayoutMetadata } from "../LayoutMetadata.js";
import { LayoutContext } from "../LayoutContext.js";
import { BaseLayout } from "../BaseLayout.js";
import { LayoutDescriptor } from "../LayoutDescriptor.js";
import { LayoutRegistry } from "../LayoutRegistry.js";
import { LayoutResolver } from "../LayoutResolver.js";
import { LayoutComposer } from "../LayoutComposer.js";
import { LayoutRenderer } from "../LayoutRenderer.js";
import { RenderResult } from "../../components/RenderResult.js";
import { BreakpointResolver } from "../BreakpointResolver.js";
import { ResponsiveLayoutManager } from "../ResponsiveLayoutManager.js";
import { LayoutStateManager } from "../LayoutStateManager.js";
import { LayoutLifecycleEvent } from "../LayoutLifecycleEvent.js";
import { LayoutEventDispatcher } from "../LayoutEventDispatcher.js";
import { LayoutObserver } from "../LayoutObserver.js";
import { LayoutsFactory } from "../LayoutsFactory.js";
import { RootLayout } from "../RootLayout.js";
import { DashboardLayout } from "../DashboardLayout.js";
import { WorkspaceLayout } from "../WorkspaceLayout.js";
import { AuthenticationLayout } from "../AuthenticationLayout.js";
import { SettingsLayout } from "../SettingsLayout.js";
import { DialogLayout } from "../DialogLayout.js";
import { ErrorLayout } from "../ErrorLayout.js";

class TestLayout extends BaseLayout {
  public render(): string {
    return `<div class="test">${this.getRegion("body") || ""}</div>`;
  }
}

describe("Frontend Layouts Component Unit Tests (Task 70.8)", () => {
  let context: LayoutContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    const meta: LayoutMetadata = { id: "test-l", supportedRegions: ["body"] };
    context = new LayoutContext(meta, { routeName: "Home" });
  });

  describe("Contexts & Models", () => {
    it("should instantiate LayoutContext and freeze objects", () => {
      const meta: LayoutMetadata = { id: "l-1", supportedRegions: ["header", "content"] };
      const ctx = new LayoutContext(meta, { page: "auth" }, "Tablet", ["header"]);

      expect(ctx.metadata.id).toBe("l-1");
      expect(ctx.viewport).toBe("Tablet");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.routeInfo)).toBe(true);
      expect(Object.isFrozen(ctx.registeredRegions)).toBe(true);
    });

    it("should maintain state values correctly", () => {
      const layout = new TestLayout(context);
      expect(layout.state).toBe(LayoutState.Initializing);

      layout.mount({});
      expect(layout.state).toBe(LayoutState.Active);

      layout.update(context);
      expect(layout.state).toBe(LayoutState.Active);

      layout.unmount();
      expect(layout.state).toBe(LayoutState.Destroyed);
    });
  });

  describe("Layout Definitions & Registry", () => {
    it("should catalog layouts and support registry freezing", () => {
      const registry = new LayoutRegistry();
      const meta: LayoutMetadata = { id: "test-l" };
      const descriptor = new LayoutDescriptor(meta, TestLayout, ["body"]);

      registry.register(descriptor);
      expect(registry.get("test-l")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "LayoutRegistry is frozen and cannot accept further layouts"
      );
    });

    it("should resolve layouts in LayoutResolver", () => {
      const registry = new LayoutRegistry();
      const meta: LayoutMetadata = { id: "test-l" };
      const descriptor = new LayoutDescriptor(meta, TestLayout, ["body"]);
      registry.register(descriptor);

      const resolver = new LayoutResolver(registry);
      expect(resolver.resolve("test-l")).toBe(descriptor);

      expect(() => resolver.resolve("missing")).toThrow(
        "Layout with identifier missing is not registered"
      );
    });
  });

  describe("Application Layouts", () => {
    it("should render RootLayout template", () => {
      const layout = new RootLayout(context);
      layout.registerRegion("content", "<span>Root Content</span>");
      expect(layout.render()).toBe('<div class="root-shell"><span>Root Content</span></div>');
    });

    it("should render DashboardLayout template", () => {
      const layout = new DashboardLayout(context);
      layout.registerRegion("sidebar", "<nav>Menu</nav>");
      layout.registerRegion("content", "<p>Dashboard Data</p>");
      expect(layout.render()).toBe('<div class="dashboard-shell"><aside class="sidebar"><nav>Menu</nav></aside><main class="main-content"><p>Dashboard Data</p></main></div>');
    });

    it("should render WorkspaceLayout template", () => {
      const layout = new WorkspaceLayout(context);
      layout.registerRegion("header", "HeaderContent");
      layout.registerRegion("content", "BodyContent");
      layout.registerRegion("footer", "FooterContent");
      const html = layout.render();
      expect(html).toContain("HeaderContent");
      expect(html).toContain("BodyContent");
      expect(html).toContain("FooterContent");
    });

    it("should render AuthenticationLayout template", () => {
      const layout = new AuthenticationLayout(context);
      layout.registerRegion("content", "LoginView");
      expect(layout.render()).toBe('<div class="auth-shell"><div class="auth-box">LoginView</div></div>');
    });

    it("should render SettingsLayout template", () => {
      const layout = new SettingsLayout(context);
      layout.registerRegion("toolbar", "SettingsTabs");
      layout.registerRegion("content", "ProfileSettings");
      expect(layout.render()).toBe('<div class="settings-shell"><nav class="settings-nav">SettingsTabs</nav><section class="settings-content">ProfileSettings</section></div>');
    });

    it("should render DialogLayout template", () => {
      const layout = new DialogLayout(context);
      layout.registerRegion("content", "ConfirmModal");
      expect(layout.render()).toBe('<div class="dialog-shell"><div class="dialog-content">ConfirmModal</div></div>');
    });

    it("should render ErrorLayout template", () => {
      const layout = new ErrorLayout(context);
      layout.registerRegion("content", "500 Critical");
      expect(layout.render()).toBe('<div class="error-shell"><div class="error-box">500 Critical</div></div>');
    });
  });

  describe("Regions & Composition", () => {
    it("should compose layouts using LayoutComposer", () => {
      const layout = new TestLayout(context);
      const composer = new LayoutComposer();
      const html = composer.compose(layout, { body: "<p>Composed Content</p>" });
      expect(html).toBe('<div class="test"><p>Composed Content</p></div>');
    });

    it("should render layouts output in LayoutRenderer", () => {
      const layout = new TestLayout(context);
      layout.registerRegion("body", "RendererOutput");

      const renderer = new LayoutRenderer();
      const res = renderer.render(layout);

      expect(res).toBeInstanceOf(RenderResult);
      expect(res.output).toBe('<div class="test">RendererOutput</div>');
      expect(res.duration).toBeGreaterThanOrEqual(0);
      expect(res.diagnostics.layoutId).toBe("test-l");
    });
  });

  describe("Responsive Management", () => {
    it("should resolve responsive breakpoints correctly in BreakpointResolver", () => {
      expect(BreakpointResolver.resolve(480)).toBe("Mobile");
      expect(BreakpointResolver.resolve(800)).toBe("Tablet");
      expect(BreakpointResolver.resolve(1200)).toBe("Desktop");
    });

    it("should handle responsive resizing in ResponsiveLayoutManager", () => {
      const mgr = new ResponsiveLayoutManager();
      expect(mgr.getViewport()).toBe("Desktop");

      const viewport = mgr.handleResize(500);
      expect(viewport).toBe("Mobile");
      expect(mgr.getViewport()).toBe("Mobile");
    });

    it("should log transitions in LayoutStateManager", () => {
      const mgr = new LayoutStateManager();
      expect(mgr.getActiveLayoutId()).toBeUndefined();

      mgr.transitionTo("workspace-layout-id");
      expect(mgr.getActiveLayoutId()).toBe("workspace-layout-id");
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch and observe layout lifecycle events", () => {
      const dispatcher = new LayoutEventDispatcher();
      const observer = new LayoutObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.layoutId).toBe("workspace-layout");
        expect(ev.type).toBe("active");
      });

      dispatcher.dispatch(new LayoutLifecycleEvent("workspace-layout", "active"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new LayoutLifecycleEvent("workspace-layout", "active"));
      expect(count).toBe(1); // unsubscribed
    });
  });
});
