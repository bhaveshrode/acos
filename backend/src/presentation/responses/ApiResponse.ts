/**
 * ApiResponse wrapping success flag, data payload, error details, and metadata cards.
 */
export class ApiResponse<T> {
  constructor(
    public readonly success: boolean,
    public readonly data?: T,
    public readonly error?: any,
    public readonly metadata?: Record<string, any>
  ) {}
}
