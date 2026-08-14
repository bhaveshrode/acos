"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayFactory = void 0;
const ReverseProxy_js_1 = require("./ReverseProxy.js");
const RateLimiter_js_1 = require("./RateLimiter.js");
const LoadBalancer_js_1 = require("./LoadBalancer.js");
/**
 * GatewayFactory building routers, limiters, and load balancers.
 */
class GatewayFactory {
    static createReverseProxy() {
        return new ReverseProxy_js_1.ReverseProxy();
    }
    static createRateLimiter() {
        return new RateLimiter_js_1.RateLimiter();
    }
    static createLoadBalancer() {
        return new LoadBalancer_js_1.LoadBalancer();
    }
    createReverseProxy() {
        return GatewayFactory.createReverseProxy();
    }
    createRateLimiter() {
        return GatewayFactory.createRateLimiter();
    }
    createLoadBalancer() {
        return GatewayFactory.createLoadBalancer();
    }
}
exports.GatewayFactory = GatewayFactory;
