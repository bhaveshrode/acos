"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
/**
 * App serving as the root application mounting coordinator.
 */
class App {
    layout;
    constructor(layout) {
        this.layout = layout;
    }
    mount(selector, contentHtml) {
        if (typeof document !== "undefined") {
            const container = document.querySelector(selector);
            if (container) {
                container.innerHTML = this.layout.render(contentHtml);
            }
        }
    }
}
exports.App = App;
