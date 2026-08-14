"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentsFactory = void 0;
const ComponentRegistry_js_1 = require("./ComponentRegistry.js");
const ComponentResolver_js_1 = require("./ComponentResolver.js");
const ComponentCache_js_1 = require("./ComponentCache.js");
const LazyComponentLoader_js_1 = require("./LazyComponentLoader.js");
const ComponentLoader_js_1 = require("./ComponentLoader.js");
const ComponentRenderer_js_1 = require("./ComponentRenderer.js");
const ComponentComposer_js_1 = require("./ComponentComposer.js");
const ConditionalRenderer_js_1 = require("./ConditionalRenderer.js");
const ComponentEventDispatcher_js_1 = require("./ComponentEventDispatcher.js");
const ComponentObserver_js_1 = require("./ComponentObserver.js");
/**
 * ComponentsFactory composing registries and renderers, implementing IComponentFactory.
 */
class ComponentsFactory {
    static createRegistry() {
        return new ComponentRegistry_js_1.ComponentRegistry();
    }
    static createResolver(registry) {
        return new ComponentResolver_js_1.ComponentResolver(registry);
    }
    static createCache() {
        return new ComponentCache_js_1.ComponentCache();
    }
    static createLazyLoader() {
        return new LazyComponentLoader_js_1.LazyComponentLoader();
    }
    static createLoader(resolver, cache, lazyLoader) {
        return new ComponentLoader_js_1.ComponentLoader(resolver, cache, lazyLoader);
    }
    static createRenderer() {
        return new ComponentRenderer_js_1.ComponentRenderer();
    }
    static createComposer() {
        return new ComponentComposer_js_1.ComponentComposer();
    }
    static createConditionalRenderer(checkFeatureFlag) {
        return new ConditionalRenderer_js_1.ConditionalRenderer(checkFeatureFlag);
    }
    static createEventDispatcher() {
        return new ComponentEventDispatcher_js_1.ComponentEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new ComponentObserver_js_1.ComponentObserver(dispatcher);
    }
    createRegistry() {
        return ComponentsFactory.createRegistry();
    }
    createResolver(registry) {
        return ComponentsFactory.createResolver(registry);
    }
    createCache() {
        return ComponentsFactory.createCache();
    }
    createLazyLoader() {
        return ComponentsFactory.createLazyLoader();
    }
    createLoader(resolver, cache, lazyLoader) {
        return ComponentsFactory.createLoader(resolver, cache, lazyLoader);
    }
    createRenderer() {
        return ComponentsFactory.createRenderer();
    }
    createComposer() {
        return ComponentsFactory.createComposer();
    }
    createConditionalRenderer(checkFeatureFlag) {
        return ComponentsFactory.createConditionalRenderer(checkFeatureFlag);
    }
    createEventDispatcher() {
        return ComponentsFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return ComponentsFactory.createObserver(dispatcher);
    }
}
exports.ComponentsFactory = ComponentsFactory;
