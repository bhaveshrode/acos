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
 * IPageFactory contract interface defining pages factory composition capabilities.
 */
export interface IPageFactory {
  createRegistry(): PageRegistry;
  createResolver(registry: PageRegistry): PageResolver;
  createLoader(): PageLoader;
  createDataLoader(): PageDataLoader;
  createCache(): PageCache;
  createNavigator(resolver: PageResolver, cache: PageCache): PageNavigator;
  createRefreshManager(): PageRefreshManager;
  createComposer(): PageComposer;
  createRenderer(): PageRenderer;
  createTransitionManager(): PageTransitionManager;
  createEventDispatcher(): PageEventDispatcher;
  createObserver(dispatcher: PageEventDispatcher): PageObserver;
}
