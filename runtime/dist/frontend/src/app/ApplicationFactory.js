"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationFactory = void 0;
const ApplicationBootstrapper_js_1 = require("./ApplicationBootstrapper.js");
const ApplicationProviders_js_1 = require("./ApplicationProviders.js");
const App_js_1 = require("./App.js");
const RootLayout_js_1 = require("./RootLayout.js");
/**
 * ApplicationFactory constructing application startup configurations and components.
 */
class ApplicationFactory {
    static createBootstrapper(options) {
        return new ApplicationBootstrapper_js_1.ApplicationBootstrapper(options);
    }
    static createProviders() {
        return new ApplicationProviders_js_1.ApplicationProviders();
    }
    static createApp() {
        return new App_js_1.App(new RootLayout_js_1.RootLayout());
    }
}
exports.ApplicationFactory = ApplicationFactory;
