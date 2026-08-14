import { CorrelationMiddleware } from "./CorrelationMiddleware.js";
import { RequestIdMiddleware } from "./RequestIdMiddleware.js";
import { RequestContextMiddleware } from "./RequestContextMiddleware.js";
import { AuthenticationMiddleware } from "./AuthenticationMiddleware.js";
import { AuthorizationMiddleware } from "./AuthorizationMiddleware.js";
import { ExceptionHandlingMiddleware } from "./ExceptionHandlingMiddleware.js";
import { LoggingMiddleware } from "./LoggingMiddleware.js";
import { CorsMiddleware } from "./CorsMiddleware.js";
import { CompressionMiddleware } from "./CompressionMiddleware.js";
import { RateLimitingMiddleware } from "./RateLimitingMiddleware.js";
import { SecurityHeadersMiddleware } from "./SecurityHeadersMiddleware.js";
import { HealthCheckMiddleware } from "./HealthCheckMiddleware.js";

/**
 * MiddlewareFactory class generating pipeline interceptors.
 */
export class MiddlewareFactory {
  public static createCorrelationMiddleware() { return new CorrelationMiddleware(); }
  public static createRequestIdMiddleware() { return new RequestIdMiddleware(); }
  public static createRequestContextMiddleware() { return new RequestContextMiddleware(); }
  public static createAuthenticationMiddleware() { return new AuthenticationMiddleware(); }
  public static createAuthorizationMiddleware(role: string) { return new AuthorizationMiddleware(role); }
  public static createExceptionHandlingMiddleware() { return new ExceptionHandlingMiddleware(); }
  public static createLoggingMiddleware() { return new LoggingMiddleware(); }
  public static createCorsMiddleware() { return new CorsMiddleware(); }
  public static createCompressionMiddleware() { return new CompressionMiddleware(); }
  public static createRateLimitingMiddleware() { return new RateLimitingMiddleware(); }
  public static createSecurityHeadersMiddleware() { return new SecurityHeadersMiddleware(); }
  public static createHealthCheckMiddleware() { return new HealthCheckMiddleware(); }
}
