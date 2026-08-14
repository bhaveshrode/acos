/**
 * Base dependency injection exception.
 */
export class DependencyInjectionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DependencyInjectionException";
  }
}

/**
 * Thrown when a token cannot be resolved.
 */
export class ServiceNotRegisteredException extends DependencyInjectionException {
  constructor(token: string) {
    super(`Required service '${token}' was not registered in the container.`);
    this.name = "ServiceNotRegisteredException";
  }
}

/**
 * Thrown when a circular cycle is detected in resolving paths.
 */
export class CircularDependencyException extends DependencyInjectionException {
  constructor(path: string) {
    super(`Circular dependency path detected in resolution: ${path}`);
    this.name = "CircularDependencyException";
  }
}
