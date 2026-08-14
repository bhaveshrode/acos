"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutComposer = void 0;
/**
 * LayoutComposer binding region segments onto layouts before rendering them.
 */
class LayoutComposer {
    compose(layout, regions) {
        for (const [name, content] of Object.entries(regions)) {
            if (typeof layout.registerRegion === "function") {
                layout.registerRegion(name, content);
            }
        }
        return layout.render();
    }
}
exports.LayoutComposer = LayoutComposer;
