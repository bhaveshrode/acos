import { describe, it, expect, beforeEach, vi } from "vitest";
import { PageState } from "../PageState.js";
import { PageMetadata } from "../PageMetadata.js";
import { PageContext } from "../PageContext.js";
import { BasePage } from "../BasePage.js";
import { PageDescriptor } from "../PageDescriptor.js";
import { PageRegistry } from "../PageRegistry.js";
import { PageResolver } from "../PageResolver.js";
import { PageLoader } from "../PageLoader.js";
import { PageDataLoader } from "../PageDataLoader.js";
import { PageCache } from "../PageCache.js";
import { PageNavigator } from "../PageNavigator.js";
import { PageRefreshManager } from "../PageRefreshManager.js";
import { PageComposer } from "../PageComposer.js";
import { PageRenderer } from "../PageRenderer.js";
import { PageTransitionManager } from "../PageTransitionManager.js";
import { PageLifecycleEvent } from "../PageLifecycleEvent.js";
import { PageEventDispatcher } from "../PageEventDispatcher.js";
import { PageObserver } from "../PageObserver.js";
import { PagesFactory } from "../PagesFactory.js";
import { RenderResult } from "../../components/RenderResult.js";
import { DashboardPage } from "../DashboardPage.js";
import { NotFoundPage } from "../NotFoundPage.js";

class TestPage extends BasePage {
  public render(): string {
    return `<div class="test">${this.getElement("main") || ""}</div>`;
  }
}

describe("Frontend Pages Component Unit Tests (Task 73.8)", () => {
  let context: PageContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    const meta: PageMetadata = { id: "test-p", title: "Test Page" };
    context = new PageContext(meta, { id: "100" }, { filter: "all" });
  });

  describe("Contexts & Models", () => {
    it("should instantiate PageContext and freeze properties", () => {
      const meta: PageMetadata = { id: "p-1", title: "Profile" };
      const ctx = new PageContext(meta, { userId: "2" }, { tab: "billing" });

      expect(ctx.metadata.id).toBe("p-1");
      expect(ctx.routeParams.userId).toBe("2");
      expect(ctx.queryParams.tab).toBe("billing");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.routeParams)).toBe(true);
      expect(Object.isFrozen(ctx.queryParams)).toBe(true);
    });

    it("should manage page lifecycle states", async () => {
      const page = new TestPage(context);
      expect(page.state).toBe(PageState.Initializing);

      page.mount({});
      expect(page.state).toBe(PageState.Ready);

      await page.loadData();
      expect(page.state).toBe(PageState.Ready);

      page.update(context);
      expect(page.state).toBe(PageState.Ready);

      page.unmount();
      expect(page.state).toBe(PageState.Destroyed);
    });
  });

  describe("Page Definitions & Registry", () => {
    it("should catalog descriptors and freeze PageRegistry", () => {
      const registry = new PageRegistry();
      const meta: PageMetadata = { id: "test-p", title: "Test Page" };
      const descriptor = new PageDescriptor(meta, TestPage, "layout-1");

      registry.register(descriptor);
      expect(registry.get("test-p")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "PageRegistry is frozen and cannot accept further pages"
      );
    });

    it("should resolve pages in PageResolver", () => {
      const registry = new PageRegistry();
      const meta: PageMetadata = { id: "test-p", title: "Test Page" };
      const descriptor = new PageDescriptor(meta, TestPage);
      registry.register(descriptor);

      const resolver = new PageResolver(registry);
      expect(resolver.resolve("test-p")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "Page with identifier missing is not registered"
      );
    });
  });

  describe("Application Pages", () => {
    it("should render DashboardPage template", () => {
      const page = new DashboardPage(context);
      page.registerElement("metrics", "<span>75% CTR</span>");
      expect(page.render()).toBe('<div class="dashboard-page"><h1>Dashboard</h1><div class="metrics"><span>75% CTR</span></div></div>');
    });

    it("should render NotFoundPage template", () => {
      const page = new NotFoundPage(context);
      expect(page.render()).toBe('<div class="not-found-page"><h1>404 Not Found</h1><p>The page does not exist.</p></div>');
    });
  });

  describe("Data Loading & Navigation", () => {
    it("should resolve dynamic page modules in PageLoader", async () => {
      const loader = new PageLoader();
      const mockImport = async () => ({ default: TestPage });
      const res = await loader.load(mockImport);
      expect(res).toBe(TestPage);
    });

    it("should resolve API query configurations in PageDataLoader", async () => {
      const dataLoader = new PageDataLoader();
      const data = await dataLoader.loadData({ scope: "all" });
      expect(data.scope).toBe("all");
      expect(data.loadedAt).toBeGreaterThan(0);
    });

    it("should cache page instances in PageCache", () => {
      const cache = new PageCache();
      const page = new TestPage(context);
      cache.set("active", page);
      expect(cache.get("active")).toBe(page);
    });

    it("should navigate pages in PageNavigator", () => {
      const registry = new PageRegistry();
      const meta: PageMetadata = { id: "p-1", title: "Profile" };
      registry.register(new PageDescriptor(meta, TestPage));

      const resolver = new PageResolver(registry);
      const cache = new PageCache();
      const navigator = new PageNavigator(resolver, cache);

      const activeId = navigator.navigateTo("p-1");
      expect(activeId).toBe("p-1");
      expect(navigator.getActivePageId()).toBe("p-1");
    });

    it("should refresh pages in PageRefreshManager", async () => {
      const page = new TestPage(context);
      const refreshManager = new PageRefreshManager();
      await refreshManager.refresh(page);
      expect(page.state).toBe(PageState.Ready);
    });
  });

  describe("Composition & Rendering", () => {
    it("should compose elements using PageComposer", () => {
      const page = new TestPage(context);
      const composer = new PageComposer();
      const html = composer.compose(page, { main: "<main>Hello</main>" });
      expect(html).toBe('<div class="test"><main>Hello</main></div>');
    });

    it("should render page output using PageRenderer", () => {
      const page = new TestPage(context);
      page.registerElement("main", "Content");

      const renderer = new PageRenderer();
      const res = renderer.render(page);

      expect(res).toBeInstanceOf(RenderResult);
      expect(res.output).toBe('<div class="test">Content</div>');
      expect(res.duration).toBeGreaterThanOrEqual(0);
      expect(res.diagnostics.pageId).toBe("test-p");
    });

    it("should transition pages using PageTransitionManager", async () => {
      const mgr = new PageTransitionManager();
      expect(mgr.getIsTransitioning()).toBe(false);

      const transitionFn = vi.fn().mockImplementation(() => {
        expect(mgr.getIsTransitioning()).toBe(true);
      });

      await mgr.transitionTo(transitionFn);
      expect(mgr.getIsTransitioning()).toBe(false);
      expect(transitionFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch and observe page lifecycle events", () => {
      const dispatcher = new PageEventDispatcher();
      const observer = new PageObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.pageId).toBe("page-1");
        expect(ev.type).toBe("ready");
      });

      dispatcher.dispatch(new PageLifecycleEvent("page-1", "ready"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new PageLifecycleEvent("page-1", "ready"));
      expect(count).toBe(1);
    });
  });

  describe("Factory", () => {
    it("should compose factory components", () => {
      const factory = new PagesFactory();
      const reg = factory.createRegistry();
      expect(reg).toBeInstanceOf(PageRegistry);
    });
  });
});
