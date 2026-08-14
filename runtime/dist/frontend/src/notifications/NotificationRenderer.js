"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRenderer = void 0;
const RenderResult_js_1 = require("../components/RenderResult.js");
/**
 * NotificationRenderer formatting notification outputs and returning RenderResult objects.
 */
class NotificationRenderer {
    render(notification) {
        const start = performance.now();
        const output = notification.render();
        const duration = performance.now() - start;
        return new RenderResult_js_1.RenderResult(output, duration, {
            notificationId: notification.context.metadata.id
        });
    }
}
exports.NotificationRenderer = NotificationRenderer;
