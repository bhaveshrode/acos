import { ControllerFactory } from "../controllers/ControllerFactory.js";
import { RouteFactory } from "../routes/RouteFactory.js";
import { MiddlewareFactory } from "../middleware/MiddlewareFactory.js";
import { AuthenticationFactory } from "../authentication/AuthenticationFactory.js";
import { AuthorizationFactory } from "../authorization/AuthorizationFactory.js";
import { ValidationFactory } from "../validation/ValidationFactory.js";
import { SerializationFactory } from "../serialization/SerializationFactory.js";
import { ExceptionFactory } from "../exceptions/ExceptionFactory.js";
import { VersioningFactory } from "../versioning/VersioningFactory.js";
import { HealthFactory } from "../health/HealthFactory.js";
import { DocumentationFactory } from "../documentation/DocumentationFactory.js";
import { WebSocketFactory } from "../websocket/WebSocketFactory.js";
import { ResponseFactory } from "../responses/ResponseFactory.js";
import { RequestFactory } from "../requests/RequestFactory.js";
import { FilterFactory } from "../filters/FilterFactory.js";
import { InterceptorFactory } from "../interceptors/InterceptorFactory.js";

/**
 * PresentationFactory coordinating construction accessors across all presentation subcomponents.
 */
export class PresentationFactory {
  public static getControllers(): typeof ControllerFactory {
    return ControllerFactory;
  }

  public static getRoutes(): typeof RouteFactory {
    return RouteFactory;
  }

  public static getMiddleware(): typeof MiddlewareFactory {
    return MiddlewareFactory;
  }

  public static getAuthentication(): typeof AuthenticationFactory {
    return AuthenticationFactory;
  }

  public static getAuthorization(): typeof AuthorizationFactory {
    return AuthorizationFactory;
  }

  public static getValidation(): typeof ValidationFactory {
    return ValidationFactory;
  }

  public static getSerialization(): typeof SerializationFactory {
    return SerializationFactory;
  }

  public static getExceptions(): typeof ExceptionFactory {
    return ExceptionFactory;
  }

  public static getVersioning(): typeof VersioningFactory {
    return VersioningFactory;
  }

  public static getHealth(): typeof HealthFactory {
    return HealthFactory;
  }

  public static getDocumentation(): typeof DocumentationFactory {
    return DocumentationFactory;
  }

  public static getWebSocket(): typeof WebSocketFactory {
    return WebSocketFactory;
  }

  public static getResponses(): typeof ResponseFactory {
    return ResponseFactory;
  }

  public static getRequests(): typeof RequestFactory {
    return RequestFactory;
  }

  public static getFilters(): typeof FilterFactory {
    return FilterFactory;
  }

  public static getInterceptors(): typeof InterceptorFactory {
    return InterceptorFactory;
  }
}
