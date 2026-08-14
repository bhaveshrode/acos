import { HttpException } from "./HttpException.js";

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad Request", details?: any) {
    super(400, message, "BAD_REQUEST", details);
    this.name = "BadRequestException";
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized", details?: any) {
    super(401, message, "UNAUTHORIZED", details);
    this.name = "UnauthorizedException";
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden", details?: any) {
    super(403, message, "FORBIDDEN", details);
    this.name = "ForbiddenException";
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = "Not Found", details?: any) {
    super(404, message, "NOT_FOUND", details);
    this.name = "NotFoundException";
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = "Conflict", details?: any) {
    super(409, message, "CONFLICT", details);
    this.name = "ConflictException";
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message: string = "Unprocessable Entity", details?: any) {
    super(422, message, "UNPROCESSABLE_ENTITY", details);
    this.name = "UnprocessableEntityException";
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message: string = "Too Many Requests", details?: any) {
    super(429, message, "TOO_MANY_REQUESTS", details);
    this.name = "TooManyRequestsException";
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = "Internal Server Error", details?: any) {
    super(500, message, "INTERNAL_SERVER_ERROR", details);
    this.name = "InternalServerErrorException";
  }
}
