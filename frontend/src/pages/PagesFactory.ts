import { IPageFactory } from "./IPageFactory.js";
import { PageRegistry } from "./PageRegistry.js";
import { PageResolver } from "./PageResolver.js";
import { PageLoader } from "./PageLoader.js";
import { PageDataLoader } from "./PageDataLoader.js";
import { PageCache } from "./PageCache.js";
import { PageNavigator } from "./PageNavigator.js";
import { PageRefreshManager } from "./PageRefreshManager.js";
import { PageComposer } from "./PageComposer.js";
import { PageRenderer } from "./PageRenderer.js";
import { PageTransitionManager } from "./PageTransitionManager.js";
import { PageEventDispatcher } from "./PageEventDispatcher.js";
import { PageObserver } from "./PageObserver.js";

/**
 * PagesFactory implementing standard IPageFactory composition roots.
 */
export class PagesFactory implements IPageFactory {
  public static createRegistry(): PageRegistry {
    return new PageRegistry();
  }

  public static createResolver(registry: PageRegistry): PageResolver {
    return new PageResolver(registry);
  }

  public static createLoader(): PageLoader {
    return new PageLoader();
  }

  public static createDataLoader(): PageDataLoader {
    return new PageDataLoader();
  }

  public static createCache(): PageCache {
    return new PageCache();
  }

  public static createNavigator(resolver: PageResolver, cache: PageCache): PageNavigator {
    return new PageNavigator(resolver, cache);
  }

  public static createRefreshManager(): PageRefreshManager {
    return new PageRefreshManager();
  }

  public static createComposer(): PageComposer {
    return new PageComposer();
  }

  public static createRenderer(): PageRenderer {
    return new PageRenderer();
  }

  public static createTransitionManager(): PageTransitionManager {
    return new PageTransitionManager();
  }

  public static createEventDispatcher(): PageEventDispatcher {
    return new PageEventDispatcher();
  }

  public static createObserver(dispatcher: PageEventDispatcher): PageObserver {
    return new PageObserver(dispatcher);
  }

  public createRegistry(): PageRegistry {
    return PagesFactory.createRegistry();
  }

  public createResolver(registry: PageRegistry): PageResolver {
    return PagesFactory.createResolver(registry);
  }

  public createLoader(): PageLoader {
    return PagesFactory.createLoader();
  }

  public createDataLoader(): PageDataLoader {
    return PagesFactory.createDataLoader();
  }

  public createCache(): PageCache {
    return PagesFactory.createCache();
  }

  public createNavigator(resolver: PageResolver, cache: PageCache): PageNavigator {
    return PagesFactory.createNavigator(resolver, cache);
  }

  public createRefreshManager(): PageRefreshManager {
    return PagesFactory.createRefreshManager();
  }

  public createComposer(): PageComposer {
    return PagesFactory.createComposer();
  }

  public createRenderer(): PageRenderer {
    return PagesFactory.createRenderer();
  }

  public createTransitionManager(): PageTransitionManager {
    return PagesFactory.createTransitionManager();
  }

  public createEventDispatcher(): PageEventDispatcher {
    return PagesFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: PageEventDispatcher): PageObserver {
    return PagesFactory.createObserver(dispatcher);
  }
}
