import { IntegrationCredentials } from "./IntegrationCredentials.js";
import { HMACSignedRequest } from "./HMACSignedRequest.js";
import { IRateLimiter } from "./IRateLimiter.js";
import { TokenBucketLimiter } from "./TokenBucketLimiter.js";

/**
 * SecurityFactory constructing credentials and rate limiters.
 */
export class SecurityFactory {
  public static createCredentials(
    clientId: string,
    clientSecret: string,
    tokenUrl?: string
  ): IntegrationCredentials {
    return new IntegrationCredentials(clientId, clientSecret, tokenUrl);
  }

  public static createRateLimiter(
    maxTokens: number,
    refillRate: number
  ): IRateLimiter {
    return new TokenBucketLimiter(maxTokens, refillRate);
  }

  public createCredentials(
    clientId: string,
    clientSecret: string,
    tokenUrl?: string
  ): IntegrationCredentials {
    return SecurityFactory.createCredentials(clientId, clientSecret, tokenUrl);
  }

  public createRateLimiter(
    maxTokens: number,
    refillRate: number
  ): IRateLimiter {
    return SecurityFactory.createRateLimiter(maxTokens, refillRate);
  }
}
