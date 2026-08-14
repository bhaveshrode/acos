import { ReverseProxy } from "./ReverseProxy.js";
import { RateLimiter } from "./RateLimiter.js";
import { LoadBalancer } from "./LoadBalancer.js";

/**
 * GatewayFactory building routers, limiters, and load balancers.
 */
export class GatewayFactory {
  public static createReverseProxy(): ReverseProxy {
    return new ReverseProxy();
  }

  public static createRateLimiter(): RateLimiter {
    return new RateLimiter();
  }

  public static createLoadBalancer(): LoadBalancer {
    return new LoadBalancer();
  }

  public createReverseProxy(): ReverseProxy {
    return GatewayFactory.createReverseProxy();
  }

  public createRateLimiter(): RateLimiter {
    return GatewayFactory.createRateLimiter();
  }

  public createLoadBalancer(): LoadBalancer {
    return GatewayFactory.createLoadBalancer();
  }
}
