"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationShutdown = void 0;
const ApplicationState_js_1 = require("./ApplicationState.js");
/**
 * ApplicationShutdown coordinating cleanup processes (e.g. closing socket connections, releasing sub registers).
 */
class ApplicationShutdown {
    async shutdown(context) {
        context.state.transitionTo(ApplicationState_js_1.InitState.Shutdown);
        // Simulate cleanup tasks
        await new Promise((resolve) => setTimeout(resolve, 5));
    }
}
exports.ApplicationShutdown = ApplicationShutdown;
