import { ApiResponse } from "./ApiResponse.js";
import { ParsedResponse } from "./ParsedResponse.js";

/**
 * ResponseParser executing raw body parsings and outputting a ParsedResponse model.
 */
export class ResponseParser {
  public static async parse<T = any>(
    response: Response,
    durationMs: number = 0
  ): Promise<ParsedResponse<T>> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const contentType = response.headers.get("Content-Type") || "";
    let data: any;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const apiResponse = new ApiResponse<T>(data, response.status, headers, durationMs);
    return new ParsedResponse<T>(apiResponse, data, contentType, headers);
  }
}
