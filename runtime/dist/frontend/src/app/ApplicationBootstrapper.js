"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationBootstrapper = void 0;
const ApplicationContext_js_1 = require("./ApplicationContext.js");
const ApplicationState_js_1 = require("./ApplicationState.js");
const ApplicationInitializer_js_1 = require("./ApplicationInitializer.js");
const ApplicationShutdown_js_1 = require("./ApplicationShutdown.js");
/**
 * ApplicationBootstrapper orchestrating the startup/shutdown pipeline flow.
 */
class ApplicationBootstrapper {
    options;
    context;
    constructor(options) {
        this.options = options;
    }
    async start() {
        const state = new ApplicationState_js_1.ApplicationState();
        this.context = new ApplicationContext_js_1.ApplicationContext(this.options, state);
        const initializer = new ApplicationInitializer_js_1.ApplicationInitializer();
        await initializer.initialize(this.context);
        return this.context;
    }
    async stop() {
        if (this.context) {
            const shutdown = new ApplicationShutdown_js_1.ApplicationShutdown();
            await shutdown.shutdown(this.context);
        }
    }
    getContext() {
        if (!this.context) {
            throw new Error("ApplicationBootstrapper has not been started");
        }
        return this.context;
    }
}
exports.ApplicationBootstrapper = ApplicationBootstrapper;
