"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesFactory = void 0;
const PageRegistry_js_1 = require("./PageRegistry.js");
const PageResolver_js_1 = require("./PageResolver.js");
const PageLoader_js_1 = require("./PageLoader.js");
const PageDataLoader_js_1 = require("./PageDataLoader.js");
const PageCache_js_1 = require("./PageCache.js");
const PageNavigator_js_1 = require("./PageNavigator.js");
const PageRefreshManager_js_1 = require("./PageRefreshManager.js");
const PageComposer_js_1 = require("./PageComposer.js");
const PageRenderer_js_1 = require("./PageRenderer.js");
const PageTransitionManager_js_1 = require("./PageTransitionManager.js");
const PageEventDispatcher_js_1 = require("./PageEventDispatcher.js");
const PageObserver_js_1 = require("./PageObserver.js");
/**
 * PagesFactory implementing standard IPageFactory composition roots.
 */
class PagesFactory {
    static createRegistry() {
        return new PageRegistry_js_1.PageRegistry();
    }
    static createResolver(registry) {
        return new PageResolver_js_1.PageResolver(registry);
    }
    static createLoader() {
        return new PageLoader_js_1.PageLoader();
    }
    static createDataLoader() {
        return new PageDataLoader_js_1.PageDataLoader();
    }
    static createCache() {
        return new PageCache_js_1.PageCache();
    }
    static createNavigator(resolver, cache) {
        return new PageNavigator_js_1.PageNavigator(resolver, cache);
    }
    static createRefreshManager() {
        return new PageRefreshManager_js_1.PageRefreshManager();
    }
    static createComposer() {
        return new PageComposer_js_1.PageComposer();
    }
    static createRenderer() {
        return new PageRenderer_js_1.PageRenderer();
    }
    static createTransitionManager() {
        return new PageTransitionManager_js_1.PageTransitionManager();
    }
    static createEventDispatcher() {
        return new PageEventDispatcher_js_1.PageEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new PageObserver_js_1.PageObserver(dispatcher);
    }
    createRegistry() {
        return PagesFactory.createRegistry();
    }
    createResolver(registry) {
        return PagesFactory.createResolver(registry);
    }
    createLoader() {
        return PagesFactory.createLoader();
    }
    createDataLoader() {
        return PagesFactory.createDataLoader();
    }
    createCache() {
        return PagesFactory.createCache();
    }
    createNavigator(resolver, cache) {
        return PagesFactory.createNavigator(resolver, cache);
    }
    createRefreshManager() {
        return PagesFactory.createRefreshManager();
    }
    createComposer() {
        return PagesFactory.createComposer();
    }
    createRenderer() {
        return PagesFactory.createRenderer();
    }
    createTransitionManager() {
        return PagesFactory.createTransitionManager();
    }
    createEventDispatcher() {
        return PagesFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return PagesFactory.createObserver(dispatcher);
    }
}
exports.PagesFactory = PagesFactory;
