"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakpointResolver = void 0;
/**
 * BreakpointResolver resolving viewport classifications (Mobile, Tablet, Desktop) based on screen width values.
 */
class BreakpointResolver {
    static resolve(width) {
        if (width < 768)
            return "Mobile";
        if (width < 1024)
            return "Tablet";
        return "Desktop";
    }
}
exports.BreakpointResolver = BreakpointResolver;
