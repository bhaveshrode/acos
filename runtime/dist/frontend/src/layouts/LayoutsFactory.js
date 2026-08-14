"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutsFactory = void 0;
const LayoutRegistry_js_1 = require("./LayoutRegistry.js");
const LayoutResolver_js_1 = require("./LayoutResolver.js");
const LayoutComposer_js_1 = require("./LayoutComposer.js");
const LayoutRenderer_js_1 = require("./LayoutRenderer.js");
const ResponsiveLayoutManager_js_1 = require("./ResponsiveLayoutManager.js");
const LayoutStateManager_js_1 = require("./LayoutStateManager.js");
const LayoutEventDispatcher_js_1 = require("./LayoutEventDispatcher.js");
const LayoutObserver_js_1 = require("./LayoutObserver.js");
/**
 * LayoutsFactory implementing composition interfaces contracts.
 */
class LayoutsFactory {
    static createRegistry() {
        return new LayoutRegistry_js_1.LayoutRegistry();
    }
    static createResolver(registry) {
        return new LayoutResolver_js_1.LayoutResolver(registry);
    }
    static createComposer() {
        return new LayoutComposer_js_1.LayoutComposer();
    }
    static createRenderer() {
        return new LayoutRenderer_js_1.LayoutRenderer();
    }
    static createResponsiveManager() {
        return new ResponsiveLayoutManager_js_1.ResponsiveLayoutManager();
    }
    static createStateManager() {
        return new LayoutStateManager_js_1.LayoutStateManager();
    }
    static createEventDispatcher() {
        return new LayoutEventDispatcher_js_1.LayoutEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new LayoutObserver_js_1.LayoutObserver(dispatcher);
    }
    createRegistry() {
        return LayoutsFactory.createRegistry();
    }
    createResolver(registry) {
        return LayoutsFactory.createResolver(registry);
    }
    createComposer() {
        return LayoutsFactory.createComposer();
    }
    createRenderer() {
        return LayoutsFactory.createRenderer();
    }
    createResponsiveManager() {
        return LayoutsFactory.createResponsiveManager();
    }
    createStateManager() {
        return LayoutsFactory.createStateManager();
    }
    createEventDispatcher() {
        return LayoutsFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return LayoutsFactory.createObserver(dispatcher);
    }
}
exports.LayoutsFactory = LayoutsFactory;
