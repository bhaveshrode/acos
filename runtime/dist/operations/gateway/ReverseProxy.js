"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReverseProxy = void 0;
/**
 * ReverseProxy routing network paths to downstream targets.
 */
class ReverseProxy {
    route(path) {
        if (path.startsWith("/api"))
            return "http://backend-api";
        return "http://frontend-static";
    }
}
exports.ReverseProxy = ReverseProxy;
