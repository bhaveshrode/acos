/**
 * ApiResponse wrapping response data, status, headers, and duration telemetry metrics.
 */
export class ApiResponse<T = any> {
  constructor(
    public readonly data: T,
    public readonly status: number,
    public readonly headers: Readonly<Record<string, string>> = {},
    public readonly durationMs: number = 0
  ) {
    Object.freeze(this.headers);
    Object.freeze(this);
  }
}
