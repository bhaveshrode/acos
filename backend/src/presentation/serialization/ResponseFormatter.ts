/**
 * ResponseFormatter shaping standard JSON envelopes for API responses.
 */
export class ResponseFormatter {
  public formatSuccess(data: any): any {
    return {
      success: true,
      data
    };
  }

  public formatError(message: string, code?: string): any {
    return {
      success: false,
      error: {
        message,
        code: code ?? "INTERNAL_SERVER_ERROR"
      }
    };
  }
}
