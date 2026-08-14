import { ApiResponse } from "./ApiResponse.js";

export interface ErrorDetails {
  message: string;
  code: string;
  details?: any;
}

/**
 * ErrorResponse formatting errors with distinct codes.
 */
export class ErrorResponse extends ApiResponse<never> {
  constructor(
    error: ErrorDetails,
    metadata?: Record<string, any>
  ) {
    super(false, undefined, error, metadata);
  }
}
