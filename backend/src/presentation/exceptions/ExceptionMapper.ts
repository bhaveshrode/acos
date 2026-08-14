import { HttpException } from "./HttpException.js";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException
} from "./HttpExceptions.js";

/**
 * ExceptionMapper translating generic or domain exceptions into concrete HTTP error objects.
 */
export class ExceptionMapper {
  private static mappings = new Map<string, (err: Error) => HttpException>();

  /**
   * Registers a translator function for a target Exception name.
   */
  public static register(errorName: string, mapFn: (err: Error) => HttpException): void {
    this.mappings.set(errorName, mapFn);
  }

  /**
   * Maps an error.
   */
  public static map(error: Error): HttpException {
    const mapper = this.mappings.get(error.name);
    if (mapper) {
      return mapper(error);
    }

    if (error instanceof HttpException) {
      return error;
    }

    // Direct name checks for known domain components exceptions
    if (error.name === "ValidationException" || error.name === "ValidationError") {
      const details = (error as any).errors;
      return new BadRequestException(error.message, details);
    }
    if (error.name === "AuthenticationException") {
      return new UnauthorizedException(error.message);
    }
    if (error.name === "AuthorizationException") {
      return new ForbiddenException(error.message);
    }

    return new InternalServerErrorException(error.message);
  }

  /**
   * Clears mapper translator mappings.
   */
  public static clear(): void {
    this.mappings.clear();
  }
}
