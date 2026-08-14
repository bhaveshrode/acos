import { ApiResponse } from "./ApiResponse.js";

/**
 * ParsedResponse capturing raw response formats, headers, and normalized ApiResponse models.
 */
export class ParsedResponse<T = any> {
  constructor(
    public readonly response: ApiResponse<T>,
    public readonly rawBody: string | T,
    public readonly contentType: string,
    public readonly headers: Readonly<Record<string, string>> = {}
  ) {
    Object.freeze(this.headers);
    Object.freeze(this);
  }
}
