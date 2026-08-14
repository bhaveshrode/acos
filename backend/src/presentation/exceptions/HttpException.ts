/**
 * HttpException serving as the base exception type for all presentation-layer errors.
 */
export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode: string = "HTTP_ERROR",
    public readonly details?: any
  ) {
    super(message);
    this.name = "HttpException";
  }
}
