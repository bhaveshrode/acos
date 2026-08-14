"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsFactory = void 0;
const FormRegistry_js_1 = require("./FormRegistry.js");
const FormResolver_js_1 = require("./FormResolver.js");
const FormCache_js_1 = require("./FormCache.js");
const LazyFormLoader_js_1 = require("./LazyFormLoader.js");
const FormLoader_js_1 = require("./FormLoader.js");
const FormRenderer_js_1 = require("./FormRenderer.js");
const FormEventDispatcher_js_1 = require("./FormEventDispatcher.js");
const FormObserver_js_1 = require("./FormObserver.js");
const FormBinder_js_1 = require("./FormBinder.js");
const FormValidator_js_1 = require("./FormValidator.js");
const FormStateManager_js_1 = require("./FormStateManager.js");
const FormSerializer_js_1 = require("./FormSerializer.js");
const DraftManager_js_1 = require("./DraftManager.js");
const FormHydrator_js_1 = require("./FormHydrator.js");
/**
 * FormsFactory composing loaders, validators, observers, and draft managers, implementing IFormFactory.
 */
class FormsFactory {
    static createRegistry() {
        return new FormRegistry_js_1.FormRegistry();
    }
    static createResolver(registry) {
        return new FormResolver_js_1.FormResolver(registry);
    }
    static createCache() {
        return new FormCache_js_1.FormCache();
    }
    static createLazyLoader() {
        return new LazyFormLoader_js_1.LazyFormLoader();
    }
    static createLoader(resolver, cache, lazyLoader) {
        return new FormLoader_js_1.FormLoader(resolver, cache, lazyLoader);
    }
    static createRenderer() {
        return new FormRenderer_js_1.FormRenderer();
    }
    static createEventDispatcher() {
        return new FormEventDispatcher_js_1.FormEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new FormObserver_js_1.FormObserver(dispatcher);
    }
    static createBinder() {
        return new FormBinder_js_1.FormBinder();
    }
    static createValidator() {
        return new FormValidator_js_1.FormValidator();
    }
    static createStateManager() {
        return new FormStateManager_js_1.FormStateManager();
    }
    static createSerializer() {
        return new FormSerializer_js_1.FormSerializer();
    }
    static createDraftManager(serializer) {
        return new DraftManager_js_1.DraftManager(serializer);
    }
    static createHydrator(serializer, draftManager) {
        return new FormHydrator_js_1.FormHydrator(serializer, draftManager);
    }
    createRegistry() {
        return FormsFactory.createRegistry();
    }
    createResolver(registry) {
        return FormsFactory.createResolver(registry);
    }
    createCache() {
        return FormsFactory.createCache();
    }
    createLazyLoader() {
        return FormsFactory.createLazyLoader();
    }
    createLoader(resolver, cache, lazyLoader) {
        return FormsFactory.createLoader(resolver, cache, lazyLoader);
    }
    createRenderer() {
        return FormsFactory.createRenderer();
    }
    createEventDispatcher() {
        return FormsFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return FormsFactory.createObserver(dispatcher);
    }
    createBinder() {
        return FormsFactory.createBinder();
    }
    createValidator() {
        return FormsFactory.createValidator();
    }
    createStateManager() {
        return FormsFactory.createStateManager();
    }
    createSerializer() {
        return FormsFactory.createSerializer();
    }
    createDraftManager(serializer) {
        return FormsFactory.createDraftManager(serializer);
    }
    createHydrator(serializer, draftManager) {
        return FormsFactory.createHydrator(serializer, draftManager);
    }
}
exports.FormsFactory = FormsFactory;
