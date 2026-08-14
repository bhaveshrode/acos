"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationInitializer = void 0;
const ApplicationState_js_1 = require("./ApplicationState.js");
/**
 * ApplicationInitializer running startup tasks and configurations loading.
 */
class ApplicationInitializer {
    async initialize(context) {
        context.state.transitionTo(ApplicationState_js_1.InitState.Initializing);
        // Simulate configuration fetching or dynamic options loading
        await new Promise((resolve) => setTimeout(resolve, 10));
        context.state.transitionTo(ApplicationState_js_1.InitState.Ready);
    }
}
exports.ApplicationInitializer = ApplicationInitializer;
