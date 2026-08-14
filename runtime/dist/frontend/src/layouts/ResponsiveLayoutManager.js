"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveLayoutManager = void 0;
const BreakpointResolver_js_1 = require("./BreakpointResolver.js");
/**
 * ResponsiveLayoutManager tracking viewport changes dynamically.
 */
class ResponsiveLayoutManager {
    activeViewport = "Desktop";
    handleResize(width) {
        this.activeViewport = BreakpointResolver_js_1.BreakpointResolver.resolve(width);
        return this.activeViewport;
    }
    getViewport() {
        return this.activeViewport;
    }
}
exports.ResponsiveLayoutManager = ResponsiveLayoutManager;
