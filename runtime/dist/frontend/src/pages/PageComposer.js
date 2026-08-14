"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageComposer = void 0;
/**
 * PageComposer binding content pieces onto page templates.
 */
class PageComposer {
    compose(page, elements) {
        for (const [name, content] of Object.entries(elements)) {
            if (typeof page.registerElement === "function") {
                page.registerElement(name, content);
            }
        }
        return page.render();
    }
}
exports.PageComposer = PageComposer;
