/**
 * ApiException carrying status codes and failure parameters.
 */
export class ApiException extends Error {
  public override readonly name = "ApiException";

  constructor(
    public override readonly message: string,
    public readonly status?: number,
    public readonly responseData?: any
  ) {
    super(message);
  }
}
